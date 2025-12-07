<script setup>
import { ref, watch } from "vue";

const props = defineProps({
  open: { type: Boolean, required: true },
  presente: { type: Object, default: null },
});

const emit = defineEmits(["close", "confirm"]);

// passo 1 = nome
// passo 2 = detalhes do produto
const step = ref(1);
const nome = ref("");

// sempre que abrir o modal, volta pro passo 1
watch(
  () => props.open,
  (isOpen) => {
    if (isOpen) {
      step.value = 1;
      nome.value = "";
    }
  }
);

function fechar() {
  emit("close");
}

function continuarParaDetalhes() {
  if (!nome.value.trim()) return;
  step.value = 2;
}

function confirmarPresente() {
  emit("confirm", {
    nome: nome.value,
    presente: props.presente,
    contribuicao_total: "Sim", // 👈 aqui marcamos que é presente total
  });
}
</script>

<template>
  <!-- só mostra se estiver aberto -->
  <div
    v-if="open"
    class="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
  >
    <div
      class="bg-[#f7f5f2] rounded-2xl shadow-xl w-full max-w-md p-5 relative"
    >
      <!-- botão fechar -->
      <button
        class="absolute right-3 top-3 text-sm text-emerald-950/70"
        @click="fechar"
      >
        ✕
      </button>

      <!-- título -->
      <h2 class="text-lg font-semibold text-emerald-950 mb-3 text-center">
        Presentear com este item
      </h2>

      <!-- PASSO 1: nome da pessoa -->
      <div v-if="step === 1" class="flex flex-col gap-3">
        <p class="text-sm text-emerald-950/90 text-center">
          Como você gostaria que seu nome apareça para os noivos?
        </p>

        <input
          v-model="nome"
          type="text"
          class="w-full rounded-lg border border-emerald-900/20 px-3 py-2 text-sm
                 focus:outline-none focus:ring-2 focus:ring-emerald-700/50 bg-white/90"
          placeholder="Ex: Maria e João"
        />

        <button
          class="mt-2 px-4 py-2.5 rounded-lg text-white shadow-sm hover:brightness-95
                 active:translate-y-[1px] transition"
          style="background-color: #8a9479;"
          @click="continuarParaDetalhes"
        >
          Continuar
        </button>
      </div>

      <!-- PASSO 2: detalhes do produto em blocos -->
      <div v-else class="flex flex-col gap-3">
        <!-- BLOCO 1: imagem + nome + descrição -->
        <div
          class="flex flex-col justify-center bg-white/80 rounded-xl p-3 border border-emerald-900/10"
        >
          <p class="text-sm font-medium text-emerald-950 mb-2">
            Presente escolhido
          </p>

          <div class="flex gap-3 items-center">
            <!-- imagem do presente -->
            <div
              class="w-14 h-14 rounded-full overflow-hidden ring-[2px] ring-offset-[2px]"
              style="
                --tw-ring-color: #8a9479;
                --tw-ring-offset-color: #f6f3ee;
              "
            >
              <img
                :src="props.presente?.img || '/logo.png'"
                :alt="props.presente?.name"
                class="w-full h-full object-cover"
              />
            </div>

            <!-- textos -->
            <div class="flex-1">
              <p class="text-sm text-emerald-900 font-medium">
                {{ props.presente?.name }}
              </p>
              <p class="text-xs text-emerald-900/80 mt-1">
                {{
                  props.presente?.descricao ||
                  "Descrição do presente será exibida aqui."
                }}
              </p>
            </div>
          </div>
        </div>

        <!-- BLOCO 2: especificações -->
        <div class="bg-white/80 rounded-xl p-3 border border-emerald-900/10">
          <p class="text-sm font-medium text-emerald-950">
            Especificações do produto
          </p>
          <p class="text-xs text-emerald-900/80 mt-2 whitespace-pre-line">
            {{
              props.presente?.especificacoes ||
              "Especificações do produto serão exibidas aqui."
            }}
          </p>
        </div>

        <!-- BLOCO 3: link de referência -->
        <div class="bg-white/80 rounded-xl p-3 border border-emerald-900/10">
          <p class="text-sm font-medium text-emerald-950">
            Link de referência
          </p>

          <div v-if="props.presente?.linkReferencia" class="mt-2">
            <a
              :href="props.presente.linkReferencia"
              target="_blank"
              rel="noopener noreferrer"
              class="inline-flex items-center gap-1 text-xs text-emerald-800 underline"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-3.5 w-3.5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  d="M11 3a1 1 0 0 1 1-1h5a1 1 0 0 1 1 1v5a1 1 0 1 1-2 0V5.414l-6.293 6.293a1 1 0 0 1-1.414-1.414L14.586 4H12a1 1 0 0 1-1-1Z"
                />
                <path
                  d="M4.5 4A1.5 1.5 0 0 0 3 5.5v10A1.5 1.5 0 0 0 4.5 17h10a1.5 1.5 0 0 0 1.5-1.5V10a1 1 0 1 0-2 0v5H5v-9h5a1 1 0 1 0 0-2H4.5Z"
                />
              </svg>
              <span>{{ props.presente?.name }}</span>
            </a>
          </div>

          <p v-else class="text-xs text-emerald-900/70 mt-2">
            Nenhum link de referência cadastrado para este presente.
          </p>
        </div>

        <!-- botão confirmar -->
        <button
          class="mt-1 px-4 py-2.5 rounded-lg text-white shadow-sm hover:brightness-95
                 active:translate-y-[1px] transition"
          style="background-color: #8a9479;"
          @click="confirmarPresente"
        >
          Confirmar presente
        </button>
      </div>
    </div>
  </div>
</template>