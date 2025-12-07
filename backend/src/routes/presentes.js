// backend/src/routes/presentes.js
import express from "express";
import { pool } from "../db/index.js";

const router = express.Router();

/** Utils simples */
function toNumber(n) {
  const v = Number(n);
  if (!Number.isFinite(v)) return NaN;
  return Number(v.toFixed(2));
}
function cleanText(s) {
  return String(s || "").trim();
}
function cleanUrl(u) {
  const s = String(u || "").trim();
  if (!s) return null;
  try {
    const url = new URL(s);
    if (!["http:", "https:"].includes(url.protocol)) return null;
    return url.toString();
  } catch {
    return null;
  }
}

/**
 * GET /api/presentes
 * Lista todos os presentes ativos (valores já como number)
 */
router.get("/", async (_req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT
     id,
     name,
     img,
     goal_amount::float AS goal_amount,
     COALESCE(received_amount, 0)::float AS received_amount,
     is_active,
     descricao,
     concluido,
     especificacoes,
     link_referencia AS "linkReferencia"
   FROM gifts
   WHERE is_active = TRUE
   ORDER BY (concluido = 'X') ASC, id ASC`
    );

    res.json(rows);
  } catch (err) {
    console.error("Erro ao listar presentes:", err);
    res.status(500).json({ error: "Erro ao listar presentes" });
  }
});

/**
 * GET /api/presentes/:id
 * Busca um presente específico
 */
router.get("/:id", async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isFinite(id))
    return res.status(400).json({ error: "ID inválido" });

  try {
    const { rows } = await pool.query(
      `SELECT
         id,
         name,
         img,
         goal_amount::float AS goal_amount,
         COALESCE(received_amount, 0)::float AS received_amount,
         is_active,
         descricao,
         concluido,
         especificacoes,
         link_referencia AS "linkReferencia",
       FROM gifts
       WHERE id = $1`,
      [id]
    );

    if (rows.length === 0)
      return res.status(404).json({ error: "Presente não encontrado" });

    res.json(rows[0]);
  } catch (err) {
    console.error("Erro ao buscar presente:", err);
    res.status(500).json({ error: "Erro ao buscar presente" });
  }
});

/**
 * POST /api/presentes
 * body: { name: string, goal_amount: number }
 * Cria um novo presente e retorna o registro
 */
router.post("/", async (req, res) => {
  const name = cleanText(req.body?.name);
  const goal = toNumber(req.body?.goal_amount);
  const img = cleanUrl(req.body?.img);
  const descricao = cleanText(req.body?.descricao);

  if (!name || !Number.isFinite(goal) || goal <= 0) {
    return res
      .status(400)
      .json({ error: "Nome e meta válidos são obrigatórios" });
  }

  const { rows } = await pool.query(
    `INSERT INTO gifts (name, img, goal_amount, received_amount, is_active, descricao, concluido)
       VALUES ($1, $2, $3, 0, TRUE, $4, NULL)
       RETURNING
         id, name, img,
         goal_amount::float AS goal_amount,
         COALESCE(received_amount,0)::float AS received_amount,
         is_active, descricao, concluido`,
    [name, img, goal, descricao]
  );
  return res.status(201).json(rows[0]);
});

/**
 * PUT /api/presentes/:id
 * body: { name?: string, goal_amount?: number }
 * Edita nome/meta do presente
 */
router.put("/:id", async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isFinite(id)) {
    return res.status(400).json({ error: "ID inválido" });
  }

  // Campos opcionais
  const name =
    req.body?.name !== undefined ? cleanText(req.body.name) : undefined;

  const goal =
    req.body?.goal_amount !== undefined
      ? toNumber(req.body.goal_amount)
      : undefined;

  const img = req.body?.img !== undefined ? cleanUrl(req.body.img) : undefined;

  const descricao =
    req.body?.descricao !== undefined
      ? cleanText(req.body.descricao)
      : undefined;

  // concluido: aceita "X", null ou "" (interpreta "" como null)
  const concluido =
    req.body?.concluido !== undefined ? req.body.concluido : undefined;
  if (concluido !== undefined) {
    const ok = concluido === "X" || concluido === null || concluido === "";
    if (!ok) {
      return res
        .status(400)
        .json({ error: "concluido deve ser 'X' ou null/vazio" });
    }
  }

  // nada pra atualizar?
  if (
    name === undefined &&
    goal === undefined &&
    img === undefined &&
    descricao === undefined &&
    concluido === undefined
  ) {
    return res.status(400).json({ error: "Nada para atualizar" });
  }

  // validações
  if (goal !== undefined && (!Number.isFinite(goal) || goal <= 0)) {
    return res.status(400).json({ error: "Meta inválida" });
  }

  try {
    const fields = [];
    const values = [];
    let idx = 1;

    if (name !== undefined) {
      fields.push(`name = $${idx++}`);
      values.push(name);
    }
    if (img !== undefined) {
      fields.push(`img = $${idx++}`);
      values.push(img);
    }
    if (goal !== undefined) {
      fields.push(`goal_amount = $${idx++}`);
      values.push(goal);
    }
    if (descricao !== undefined) {
      fields.push(`descricao = $${idx++}`);
      values.push(descricao);
    }
    if (concluido !== undefined) {
      fields.push(`concluido = $${idx++}`);
      values.push(concluido === "" ? null : concluido);
    }

    values.push(id);

    const { rows } = await pool.query(
      `UPDATE gifts
         SET ${fields.join(", ")}
       WHERE id = $${idx}
       RETURNING
         id,
         name,
         img,
         goal_amount::float AS goal_amount,
         COALESCE(received_amount,0)::float AS received_amount,
         is_active,
         descricao,
         concluido`,
      values
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: "Presente não encontrado" });
    }

    res.json(rows[0]);
  } catch (err) {
    console.error("Erro ao atualizar presente:", err);
    res.status(500).json({ error: "Erro ao atualizar presente" });
  }
});

/**
 * PATCH /api/presentes/:id/desativar
 * Desativa um presente (não aparece mais na lista pública)
 */
router.patch("/:id/desativar", async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isFinite(id))
    return res.status(400).json({ error: "ID inválido" });

  try {
    const { rows } = await pool.query(
      `UPDATE gifts SET is_active = FALSE WHERE id = $1
          RETURNING id, name, img, goal_amount::float AS goal_amount, COALESCE(received_amount,0)::float AS received_amount, is_active, descricao, concluido`,
      [id]
    );
    if (rows.length === 0)
      return res.status(404).json({ error: "Presente não encontrado" });
    res.json(rows[0]);
  } catch (err) {
    console.error("Erro ao desativar presente:", err);
    res.status(500).json({ error: "Erro ao desativar presente" });
  }
});

/**
 * PATCH /api/presentes/:id/ativar
 * Reativa um presente
 */
router.patch("/:id/ativar", async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isFinite(id))
    return res.status(400).json({ error: "ID inválido" });

  try {
    const { rows } = await pool.query(
      `UPDATE gifts SET is_active = TRUE WHERE id = $1
       RETURNING id, name, img, goal_amount::float AS goal_amount, COALESCE(received_amount,0)::float AS received_amount, is_active, descricao, concluido`,
      [id]
    );
    if (rows.length === 0)
      return res.status(404).json({ error: "Presente não encontrado" });
    res.json(rows[0]);
  } catch (err) {
    console.error("Erro ao reativar presente:", err);
    res.status(500).json({ error: "Erro ao reativar presente" });
  }
});

/**
 * PATCH /api/presentes/:id/recebido
 * body: { delta: number }  -> soma/subtrai do received_amount (conciliação manual)
 */
router.patch("/:id/recebido", async (req, res) => {
  const id = Number(req.params.id);
  const delta = toNumber(req.body?.delta);

  if (!Number.isFinite(id))
    return res.status(400).json({ error: "ID inválido" });
  if (!Number.isFinite(delta))
    return res.status(400).json({ error: "Delta inválido" });

  try {
    const { rows } = await pool.query(
      `UPDATE gifts
         SET received_amount = GREATEST(0, COALESCE(received_amount,0) + $1)
       WHERE id = $2
       RETURNING id, name, img, goal_amount::float AS goal_amount, COALESCE(received_amount,0)::float AS received_amount, is_active, descricao, concluido`,
      [delta, id]
    );
    if (rows.length === 0)
      return res.status(404).json({ error: "Presente não encontrado" });
    res.json(rows[0]);
  } catch (err) {
    console.error("Erro ao ajustar recebido:", err);
    res.status(500).json({ error: "Erro ao ajustar recebido" });
  }
});

export default router;
