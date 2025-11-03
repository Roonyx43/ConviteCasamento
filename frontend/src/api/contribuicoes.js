import api from "./http";

export function criarContribuicao({ giftId, padrinhoName, amount }) {
  return api.post("/api/contribuicoes", { giftId, padrinhoName, amount })
           .then(r => r.data); // { txid }
}
