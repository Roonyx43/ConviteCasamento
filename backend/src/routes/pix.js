import express from 'express';
import dotenv from 'dotenv';
import { gerarPix } from '../pix/gerarPix.js';

dotenv.config();
const router = express.Router();

router.post('/create', async (req, res) => {
  const { amount, description, txid } = req.body;

  if (!amount || amount <= 0 || !txid) {
    return res.status(400).json({ error: 'Dados inválidos' });
  }

  try {
    const { payload, qrPngDataUrl } = await gerarPix({
      chave: process.env.PIX_CHAVE,
      nomeRecebedor: process.env.PIX_NOME,
      cidade: process.env.PIX_CIDADE,
      valor: Number(amount),
      txid,
      infoAdicional: description,
    });

    res.json({ payload, qrPngDataUrl });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao gerar PIX' });
  }
});

export default router;
