// Versão estável com QrcodePix (v4)
import { QrCodePix } from 'qrcode-pix';
import QRCode from 'qrcode';

// helpers
function stripAccents(s = '') {
  return String(s).normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}
function safeName(name) {
  return stripAccents(name).toUpperCase().slice(0, 25);
}
function safeCity(city) {
  return stripAccents(city).toUpperCase().slice(0, 15);
}
function safeTxid(txid) {
  return String(txid).replace(/[^a-zA-Z0-9]/g, '').toUpperCase().slice(0, 25);
}
function safeValue(v) {
  const n = Number(v);
  if (!Number.isFinite(n)) throw new Error('Valor inválido');
  const f = Number(n.toFixed(2));
  if (f < 0.01) throw new Error('Valor mínimo é 0,01');
  return f;
}

export async function gerarPix({
  chave,
  nomeRecebedor,
  cidade,
  valor,
  txid = '',
  // message removida de propósito
}) {
  const qrcodePix = QrCodePix({
    version: '01',
    key: String(chave),
    name: safeName(nomeRecebedor),
    city: safeCity(cidade),
    transactionId: safeTxid(txid),
    // ⚠️ sem "message" para evitar problemas de compatibilidade
    value: safeValue(valor),
  });

  const payload = qrcodePix.payload();
  const qrPngDataUrl = await QRCode.toDataURL(payload, { width: 280, margin: 1 });
  return { payload, qrPngDataUrl };
}