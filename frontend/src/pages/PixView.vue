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
  <div class="max-w-lg mx-auto bg-white p-4 rounded-xl shadow">
    <h2 class="text-xl font-semibold mb-2">Pague com PIX</h2>
    <p class="text-sm text-gray-600 mb-4">
      Presente: <strong>{{ gift }}</strong> · Valor:
      <strong>{{ formataBRL(amount) }}</strong>
    </p>

    <div v-if="carregando" class="text-gray-500">Gerando QR…</div>
    <div v-else-if="erro" class="text-red-500 text-sm">{{ erro }}</div>

    <div v-else class="space-y-4">
      <img
        :src="qr"
        alt="QR Code PIX"
        class="mx-auto border rounded-lg w-56 h-56 object-contain"
      />

      <div>
        <label class="text-sm text-gray-600">Copia e Cola</label>
        <textarea
          :value="payload"
          readonly
          @focus="$event.target.select()"
          class="mt-1 w-full p-2 border rounded-lg text-xs"
          rows="4"
        ></textarea>
      </div>

      <div class="flex flex-col sm:flex-row gap-2">
        <button
          @click="copiar"
          class="flex-1 px-3 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700"
        >
          Copiar código PIX
        </button>
      </div>

      <p class="text-xs text-gray-500">
        Dica: após pagar, envie o comprovante.
      </p>
    </div>
  </div>
</template>
