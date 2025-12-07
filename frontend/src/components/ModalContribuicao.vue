<script setup>
import { ref, watch } from "vue";
import { normalizaValor } from "../utils/moeda";

const props = defineProps({
  aberto: Boolean,
  presente: Object,
});

const emit = defineEmits(["fechar", "confirmar"]);

const nome = ref("");
const valor = ref("");

// reset ao abrir
watch(
  () => props.aberto,
  (v) => {
    if (v) {
      nome.value = "";
      valor.value = "";
    }
  }
);

function confirmar() {
  const amount = normalizaValor(valor.value);
  if (!nome.value || !amount || amount <= 0) return;

  emit("confirmar", { nome: nome.value, amount });
}
</script>

<template>
  <div
    v-if="aberto"
    class="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
  >
    <!-- CAIXA DO MODAL -->
    <div
      class="bg-[#f7f5f2] rounded-2xl shadow-xl w-full max-w-md p-5 relative"
    >
      <!-- botão fechar -->
      <button
        class="absolute right-3 top-3 text-sm text-emerald-950/70"
        @click="emit('fechar')"
      >
        ✕
      </button>

      <!-- título -->
      <h2 class="text-lg font-semibold text-emerald-950 mb-3 text-center">
        Contribuir com valor
      </h2>

      <!-- nome do presente -->
      <p class="text-sm text-emerald-900/80 text-center mb-4">
        {{ presente?.name }}
      </p>

      <!-- FORM -->
      <div class="flex flex-col gap-4">
        <!-- nome -->
        <div class="flex flex-col">
          <label class="text-sm text-emerald-950/90">Seu nome</label>
          <input
            v-model="nome"
            type="text"
            class="mt-1 w-full rounded-lg border border-emerald-900/20 px-3 py-2 text-sm
                   focus:outline-none focus:ring-2 focus:ring-emerald-700/40 bg-white/90"
            placeholder="Ex: Tio João"
          />
        </div>

        <!-- valor -->
        <div class="flex flex-col">
          <label class="text-sm text-emerald-950/90">Valor (R$)</label>
          <input
            v-model="valor"
            inputmode="decimal"
            class="mt-1 w-full rounded-lg border border-emerald-900/20 px-3 py-2 text-sm
                   focus:outline-none focus:ring-2 focus:ring-emerald-700/40 bg-white/90"
            placeholder="Ex: 150,00"
          />
        </div>

        <!-- botão confirmar -->
        <button
          class="mt-2 px-4 py-2.5 rounded-lg text-white shadow-sm hover:brightness-95
                 active:translate-y-[1px] transition"
          style="background-color: #8a9479;"
          @click="confirmar"
        >
          Gerar PIX
        </button>
      </div>
    </div>
  </div>
</template>