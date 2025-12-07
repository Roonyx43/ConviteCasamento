<script setup>
import { ref, onMounted } from "vue";
import { listarPresentes } from "../api/presentes";
import { criarContribuicao } from "../api/contribuicoes";
import PresenteCard from "../components/PresenteCard.vue";
import ModalContribuicao from "../components/ModalContribuicao.vue";
import ModalPresentear from "../components/ModalPresentear.vue";
import { useRouter } from "vue-router";

const router = useRouter();
const carregando = ref(true);
const presentes = ref([]);

// dois modais separados
const modalContribuicaoAberto = ref(false);
const modalPresentearAberto = ref(false);

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

// 🔹 fluxo: contribuir com valor (PIX)
function abrirModalContribuicao(p) {
  selecionado.value = p;
  modalContribuicaoAberto.value = true;
}

async function confirmarContribuicao({ nome, amount }) {
  if (!selecionado.value) return; // só por segurança
  modalContribuicaoAberto.value = false;

  try {
    // cria contribuição -> recebe txid
    const { txid } = await criarContribuicao({
      giftId: selecionado.value.id,
      padrinhoName: nome,
      amount,
      contribuicao_total: "Não", // 👈 contribuição em dinheiro
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
  } catch (e) {
    console.error(e);
    alert("Falha ao registrar contribuição. Tente novamente.");
  }
}

// 🔹 fluxo: presentear com este item
function abrirModalPresentear(p) {
  selecionado.value = p;
  modalPresentearAberto.value = true;
}

function fecharModalPresentear() {
  modalPresentearAberto.value = false;
  selecionado.value = null;
}

async function confirmarPresente({ nome, presente }) {
   if (!presente?.id) return; // segurança extra
  try {
    // cria contribuição "total" (sem valor em dinheiro)
    await criarContribuicao({
      giftId: presente.id,
      padrinhoName: nome,
      amount: 0,              // 👈 presente físico, sem valor em PIX
      contribuicao_total: "Sim", // 👈 marca que é presentear com o item
    });

    alert("Presente registrado! Muito obrigado pelo carinho 💜");
    fecharModalPresentear();
  } catch (e) {
    console.error(e);
    alert("Falha ao registrar o presente. Tente novamente.");
  }
}
</script>

<template>
  <div class="space-y-4">
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
          @contribuir="abrirModalContribuicao"
          @presentear="abrirModalPresentear"
        />
      </div>
    </div>

    <!-- Modal de contribuição com valor (PIX) -->
    <ModalContribuicao
      :aberto="modalContribuicaoAberto"
      :presente="selecionado"
      @fechar="modalContribuicaoAberto = false"
      @confirmar="confirmarContribuicao"
    />

    <!-- Modal de presentear com o item -->
    <ModalPresentear
      :open="modalPresentearAberto"
      :presente="selecionado"
      @close="fecharModalPresentear"
      @confirm="confirmarPresente"
    />
  </div>
</template>