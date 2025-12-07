<script setup>
import { onMounted, onBeforeUnmount, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { criarPix } from "../api/pix";
import { formataBRL } from "../utils/moeda";
import api from "../api/http";
import { useAppStore } from "../store";

const route = useRoute();
const router = useRouter();
const store = useAppStore();

const txid = route.query.txid?.toString() || "";
const amount = Number(route.query.amount || 0);
const gift = route.query.gift?.toString() || "";

const carregando = ref(true);
const payload = ref("");
const qr = ref("");
const erro = ref("");
let timer = null;

async function gerar() {
  try {
    const { payload: pld, qrPngDataUrl } = await criarPix({
      amount,
      description: `Presente: ${gift} · TX ${txid}`,
      txid,
    });
    payload.value = pld;
    qr.value = qrPngDataUrl;

    // inicia polling de status a cada 5s
    timer = setInterval(checkStatus, 5000);
  } catch (e) {
    console.error(e);
    erro.value = "Falha ao gerar QR Code PIX.";
  } finally {
    carregando.value = false;
  }
}

async function checkStatus() {
  try {
    const { data } = await api.get(`/api/contribuicoes/${txid}/status`);
    if (data?.status === "paid") {
      clearInterval(timer);
      await store.carregarPresentes();
      alert("Pagamento confirmado! Obrigado 💜");
      router.push("/");
    }
  } catch (e) {
    console.warn("Falha ao consultar status:", e?.message || e);
    // segue tentando
  }
}

async function copiar() {
  try {
    await navigator.clipboard.writeText(payload.value);
    alert("Código PIX copiado!");
  } catch {
    alert("Falha ao copiar. Copie manualmente abaixo.");
  }
}

onMounted(gerar);
onBeforeUnmount(() => timer && clearInterval(timer));
</script>


<template>
  <div class="min-h-screen flex items-center justify-center px-4">
    <div
      class="bg-[#f7f5f2] rounded-2xl shadow-xl w-full max-w-md p-5 relative overflow-hidden"
    >
      <!-- textura opcional, se quiser combinar ainda mais com os cards -->
      <div
        class="pointer-events-none absolute inset-0 opacity-[0.06] mix-blend-multiply"
        style="background: url('/fundo.png') center/cover no-repeat;"
      ></div>

      <div class="relative">
        <!-- título -->
        <h2 class="text-xl font-semibold mb-1 text-center text-emerald-950">
          Pague com PIX
        </h2>

        <p class="text-sm text-emerald-900/80 mb-4 text-center">
          Presente:
          <span class="font-semibold">{{ gift }}</span>
          · Valor:
          <span class="font-semibold">{{ formataBRL(amount) }}</span>
        </p>

        <!-- estados -->
        <div v-if="carregando" class="text-emerald-900/70 text-center">
          Gerando QR Code…
        </div>

        <div v-else-if="erro" class="text-red-600 text-sm text-center">
          {{ erro }}
        </div>

        <div v-else class="space-y-4">
          <!-- QR em destaque -->
          <div
            class="bg-white/80 border border-emerald-900/10 rounded-2xl p-4 flex flex-col items-center gap-3"
          >
            <img
              :src="qr"
              alt="QR Code PIX"
              class="border border-emerald-900/20 rounded-xl w-56 h-56 object-contain bg-white"
            />
            <p class="text-xs text-emerald-900/80 text-center max-w-xs">
              Aponte a câmera do aplicativo do seu banco para o QR Code para realizar o pagamento.
            </p>
          </div>

          <!-- copia e cola -->
          <div class="bg-white/80 border border-emerald-900/10 rounded-2xl p-3">
            <label class="text-sm text-emerald-950/90">Copia e Cola</label>
            <textarea
              :value="payload"
              readonly
              @focus="$event.target.select()"
              class="mt-1 w-full px-3 py-2 border border-emerald-900/20 rounded-lg text-xs
                     bg-white/90 focus:outline-none focus:ring-2 focus:ring-emerald-700/40"
              rows="4"
            ></textarea>

            <button
              @click="copiar"
              class="mt-3 w-full px-4 py-2.5 rounded-lg text-white shadow-sm
                     hover:brightness-95 active:translate-y-[1px] transition text-sm"
              style="background-color: #8a9479;"
            >
              Copiar código PIX
            </button>
          </div>

          <p class="text-xs text-emerald-900/70 text-center">
            Dica: após pagar, envie o comprovante para os noivos, se desejar 💌
          </p>
        </div>
      </div>
    </div>
  </div>
</template>