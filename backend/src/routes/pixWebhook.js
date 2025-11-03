import express from 'express';
import { pool } from '../db/index.js';

const router = express.Router();

/**
 * POST /api/pix/webhook
 * Esse endpoint deve ser chamado pelo PSP (Gerencianet/Efi, Mercado Pago, etc.)
 * Estruturas variam por PSP; abaixo um formato genérico, você adapta os campos.
 */
router.post('/webhook', async (req, res) => {
  try {
    // TODO: validar assinatura secreta do PSP (cabecalho + secret do .env)
    // Ex.: const signature = req.headers['x-psp-signature'];

    // Exemplos de possíveis campos (adapte ao seu PSP):
    // - txid
    // - status (paid / concluida)
    // - valor
    // - e2eid (id do Bacen)
    const body = req.body || {};
    const event = body?.pix?.[0] || body; // alguns PSPs mandam lista em body.pix
    const txid = String(event.txid || body.txid || '').toUpperCase();

    if (!txid) {
      return res.status(400).json({ error: 'txid ausente no webhook' });
    }

    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Traz contribuição pendente
      const { rows } = await client.query(
        `SELECT id, gift_id, amount, status FROM contributions
         WHERE txid = $1 FOR UPDATE`,
        [txid]
      );
      if (!rows.length) {
        await client.query('ROLLBACK');
        return res.status(404).json({ error: 'Contribuição não encontrada' });
      }
      const c = rows[0];
      if (c.status !== 'pending') {
        await client.query('ROLLBACK');
        return res.json({ ok: true }); // já processada
      }

      // Marca como paga e soma no presente
      await client.query(`UPDATE contributions SET status = 'paid' WHERE id = $1`, [c.id]);
      await client.query(
        `UPDATE gifts SET received_amount = COALESCE(received_amount,0) + $1 WHERE id = $2`,
        [c.amount, c.gift_id]
      );

      await client.query('COMMIT');
      return res.json({ ok: true });
    } catch (e) {
      await client.query('ROLLBACK');
      console.error('Erro no webhook PIX:', e);
      return res.status(500).json({ error: 'Erro no webhook' });
    } finally {
      client.release();
    }
  } catch (err) {
    console.error('Falha no webhook:', err);
    res.status(500).json({ error: 'Falha no webhook' });
  }
});

export default router;
