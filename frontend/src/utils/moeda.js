export function formataBRL(n) {
  const valor = Number(n ?? 0);
  return valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export function normalizaValor(input) {
  // aceita "12,34" ou "12.34"
  if (typeof input === "string") {
    input = input.replace(/\./g, "").replace(",", ".");
  }
  const num = Number(input);
  return Number.isFinite(num) ? Number(num.toFixed(2)) : 0;
}
