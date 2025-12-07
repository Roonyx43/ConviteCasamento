// backend/src/routes/contribuicoes.js
import express from 'express';
import crypto from 'crypto';
import { pool } from '../db/index.js';

const router = express.Router();

/** Utils */
function makeTxid() {
  const base =
    'GFT' +
    Date.now().toString(36) +
    crypto.randomBytes(3).toString('hex');

  return base
    .replace(/[^a-zA-Z0-9]/g, '')
    .toUpperCase()
    .slice(0, 25); // <= 25, só A-Z0-9
}

function toValor(n) {
  const v = Number(n);
  if (!Number.isFinite(v)) return NaN;
  return Number(v.toFixed(2));
}

/**
 * POST /api/contribuicoes
 *
 * body:
 *  - giftId: number
 *  - padrinhoName: string
 *  - amount: number
 *      > 0 para contribuição em dinheiro
 *      ignorado quando "presentear com item"
 *  - contribuicao_total: "Sim" | "Não" (ou ausente -> tratado como "Não")
 *
 * Regras:
 *  - contribuicao_total === "Sim"  → amount gravado como 0
 *  - contribuicao_total !== "Sim"  → exige amount > 0
 */
router.post('/', async (req, res) => {
  const {
    giftId,
    padrinhoName,
    amount,
    contribuicao_total,
  } = req.body || {};

  // normaliza flag
  const flag = contribuicao_total === 'Sim' ? 'Sim' : 'Não';

  // normaliza giftId e nome
  const id = Number(giftId);
  const nome =
    typeof padrinhoName === 'string' ? padrinhoName.trim() : '';

  if (!Number.isFinite(id) || id <= 0 || !nome) {
    return res
      .status(400)
      .json({ error: 'Dados inválidos (giftId / padrinhoName)' });
  }

  let valor = 0;

  if (flag === 'Não') {
    // 💰 contribuição em dinheiro → precisa de valor > 0
    valor = toValor(amount);
    if (!Number.isFinite(valor) || valor <= 0) {
      return res.status(400).json({
        error: 'Valor inválido para contribuição em dinheiro',
      });
    }
  } else {
    // 🎁 presentear com item → sempre grava 0, ignora amount
    valor = 0;
  }

  const txid = makeTxid();

  try {
    await pool.query(
      `
      INSERT INTO contributions
        (gift_id, padrinho_name, amount, txid, status, contribuicao_total)
      VALUES ($1, $2, $3, $4, 'pending', $5)
      `,
      [id, nome, valor, txid, flag]
    );

    // retorno padrão (PIX usa txid, presentear pode ignorar)
    res.json({ txid });
  } catch (err) {
    console.error('Erro ao registrar contribuição:', err);
    res
      .status(500)
      .json({ error: 'Erro ao registrar contribuição' });
  }
});

/**
 * GET /api/contribuicoes/:txid/status
 * Retorna o status da contribuição (para o polling do PIX).
 */
router.get('/:txid/status', async (req, res) => {
  const { txid } = req.params;
  try {
    const { rows } = await pool.query(
      `SELECT status FROM contributions WHERE txid = $1`,
      [txid]
    );

    if (rows.length === 0) {
      return res
        .status(404)
        .json({ error: 'Contribuição não encontrada' });
    }

    res.json({ status: rows[0].status });
  } catch (err) {
    console.error('Erro ao buscar status:', err);
    res.status(500).json({ error: 'Erro ao buscar status' });
  }
});

/**
 * PATCH /api/contribuicoes/:txid/pagar
 * Marca contribuição como paga e soma no received_amount do presente (1x).
 */
router.patch('/:txid/pagar', async (req, res) => {
  const { txid } = req.params;

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const { rows } = await client.query(
      `
      SELECT id, gift_id, amount, status
        FROM contributions
       WHERE txid = $1
       FOR UPDATE
      `,
      [txid]
    );

    if (rows.length === 0) {
      await client.query('ROLLBACK');
      return res
        .status(404)
        .json({ error: 'Contribuição não encontrada' });
    }

    const c = rows[0];

    if (c.status !== 'pending') {
      await client.query('ROLLBACK');
      return res
        .status(400)
        .json({ error: 'Contribuição já processada' });
    }

    // marca como paga
    await client.query(
      `UPDATE contributions SET status = 'paid' WHERE id = $1`,
      [c.id]
    );

    // soma no received_amount do gift
    await client.query(
      `
      UPDATE gifts
         SET received_amount = COALESCE(received_amount, 0) + $1
       WHERE id = $2
      `,
      [c.amount, c.gift_id]
    );

    await client.query('COMMIT');

    res.json({
      message: 'Contribuição marcada como paga e progresso atualizado',
    });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Erro ao marcar como paga:', err);
    res
      .status(500)
      .json({ error: 'Erro ao marcar contribuição como paga' });
  } finally {
    client.release();
  }
});

/**
 * GET /api/contribuicoes/:giftId
 * Lista contribuições de um presente (para painel/admin).
 */
router.get('/:giftId', async (req, res) => {
  const { giftId } = req.params;

  try {
    const { rows } = await pool.query(
      `
      SELECT
        id,
        padrinho_name,
        amount,
        txid,
        status,
        created_at,
        contribuicao_total
      FROM contributions
      WHERE gift_id = $1
      ORDER BY created_at DESC
      `,
      [giftId]
    );

    res.json(rows);
  } catch (err) {
    console.error('Erro ao listar contribuições:', err);
    res
      .status(500)
      .json({ error: 'Erro ao listar contribuições' });
  }
});

export default router;