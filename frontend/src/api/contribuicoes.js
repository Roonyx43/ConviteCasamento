// api/contribuicoes.js
import api from "./http";

export function criarContribuicao({
  giftId,
  padrinhoName,
  amount,
  contribuicao_total, // "Sim" | "Não"
}) {
  return api
    .post("/api/contribuicoes", {
      giftId,
      padrinhoName,
      amount,
      contribuicao_total,
    })
    .then((r) => r.data); // { txid }
}
