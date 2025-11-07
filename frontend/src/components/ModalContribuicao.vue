<script setup>
import { ref, watch } from "vue";
import { normalizaValor } from "../utils/moeda";

const props = defineProps({
  aberto: Boolean,
  presente: Object,
});
const emit = defineEmits(["fechar","confirmar"]);

const nome = ref("");
const valor = ref("");

watch(() => props.aberto, (v) => {
  if (v) { nome.value = ""; valor.value = ""; }
});
function confirmar() {
  const amount = normalizaValor(valor.value);
  if (!nome.value || !amount || amount <= 0) return;
  emit("confirmar", { nome: nome.value, amount });
}
</script>

<template>
  <div v-if="aberto" class="fixed inset-0 bg-black/40 grid place-items-center z-50">
    <div class="bg-white w-full max-w-md rounded-2xl p-4">
      <div class="flex items-start justify-between mb-3">
        <h3 class="text-lg font-semibold">Contribuir — {{ presente?.name }}</h3>
        <button @click="emit('fechar')" class="text-gray-500 hover:text-gray-700">✕</button>
      </div>

      <div class="space-y-3">
        <div>
          <label class="text-sm text-gray-600">Seu nome</label>
          <input v-model="nome" type="text" class="mt-1 w-full border rounded-lg p-2" placeholder="Ex: Tio João" />
        </div>
        <div>
          <label class="text-sm text-gray-600">Valor (R$)</label>
          <input v-model="valor" inputmode="decimal" class="mt-1 w-full border rounded-lg p-2" placeholder="Ex: 150,00" />
        </div>
      </div>

      <div class="mt-4 flex gap-2 justify-end">
        <button @click="emit('fechar')" class="px-3 py-2 rounded-lg border">Cancelar</button>
        <button @click="confirmar" class="px-3 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700">
          Gerar PIX
        </button>
      </div>
    </div>
  </div>
</template>
