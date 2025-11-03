// src/store/index.js
import { defineStore } from "pinia";
import { listarPresentes } from "../api/presentes";
import api from "../api/http";

export const useAppStore = defineStore("app", {
  state: () => ({
    presentes: [],
    carregando: false,
    erro: null,
  }),

  getters: {
    totalRecebido: (state) =>
      state.presentes.reduce(
        (soma, p) => soma + Number(p.received_amount || 0),
        0
      ),
    totalMeta: (state) =>
      state.presentes.reduce(
        (soma, p) => soma + Number(p.goal_amount || 0),
        0
      ),
  },

  actions: {
    async carregarPresentes() {
      this.carregando = true;
      this.erro = null;
      try {
        const data = await listarPresentes();
        this.presentes = data;
      } catch (err) {
        console.error("Erro ao carregar presentes:", err);
        this.erro = "Falha ao carregar presentes.";
      } finally {
        this.carregando = false;
      }
    },

    async criarPresente({ name, goal_amount }) {
      try {
        const { data } = await api.post("/api/presentes", { name, goal_amount });
        this.presentes.push(data);
      } catch (err) {
        console.error("Erro ao criar presente:", err);
        throw err;
      }
    },

    async desativarPresente(id) {
      try {
        const { data } = await api.patch(`/api/presentes/${id}/desativar`);
        this.presentes = this.presentes.map((p) =>
          p.id === id ? data : p
        );
      } catch (err) {
        console.error("Erro ao desativar presente:", err);
      }
    },

    async atualizarPresente(id, payload) {
      try {
        const { data } = await api.put(`/api/presentes/${id}`, payload);
        this.presentes = this.presentes.map((p) =>
          p.id === id ? data : p
        );
      } catch (err) {
        console.error("Erro ao atualizar presente:", err);
      }
    },

    async ajustarRecebido(id, delta) {
      try {
        const { data } = await api.patch(`/api/presentes/${id}/recebido`, {
          delta,
        });
        this.presentes = this.presentes.map((p) =>
          p.id === id ? data : p
        );
      } catch (err) {
        console.error("Erro ao ajustar recebido:", err);
      }
    },
  },
});