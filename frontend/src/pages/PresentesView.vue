<script setup>
import { ref, onMounted } from "vue";
import { listarPresentes } from "../api/presentes";
import { criarContribuicao } from "../api/contribuicoes";
import PresenteCard from "../components/PresenteCard.vue";
import ModalContribuicao from "../components/ModalContribuicao.vue";
import { useRouter } from "vue-router";

const router = useRouter();
const carregando = ref(true);
const presentes = ref([]);
const modalAberto = ref(false);
const selecionado = ref(null);

async function carregar() {
  carregando.value = true;
  try {
    presentes.value = await listarPresentes();
  } catch (e) {
    console.error(e);
    alert("Falha ao carregar presentes. Verifique o backend/URL.");
  } finally {
    carregando.value = false;
  }
}

onMounted(carregar);

function abrirModal(p) {
  selecionado.value = p;
  modalAberto.value = true;
}
async function confirmarContribuicao({ nome, amount }) {
  modalAberto.value = false;
  // cria contribuição -> recebe txid
  const { txid } = await criarContribuicao({
    giftId: selecionado.value.id,
    padrinhoName: nome,
    amount,
  });
  // vai pra tela de PIX, levando os dados
  router.push({
    name: "pix",
    query: {
      txid,
      amount: amount.toString(),
      gift: selecionado.value.name,
    },
  });
}
</script>

<template>
  <div class="space-y-4">
    <h2 class="text-2xl font-bold">Escolha um presente e contribua</h2>

    <div v-if="carregando" class="text-gray-500">Carregando…</div>

    <div v-else>
      <div v-if="presentes.length === 0" class="text-gray-500">
        Nenhum presente cadastrado ainda.
      </div>
      <div v-else class="grid sm:grid-cols-2 gap-4">
        <PresenteCard
          v-for="p in presentes"
          :key="p.id"
          :presente="p"
          @contribuir="abrirModal"
        />
      </div>
    </div>

    <ModalContribuicao
      :aberto="modalAberto"
      :presente="selecionado"
      @fechar="modalAberto = false"
      @confirmar="confirmarContribuicao"
    />
  </div>
</template>
