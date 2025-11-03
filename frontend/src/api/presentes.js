import api from "./http";

export function listarPresentes() {
  return api.get("/api/presentes").then(r => r.data);
}
