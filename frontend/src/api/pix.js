import api from "./http";

export function criarPix({ amount, description, txid }) {
  return api.post("/api/pix/create", { amount, description, txid })
           .then(r => r.data); // { payload, qrPngDataUrl }
}
