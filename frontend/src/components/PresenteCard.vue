<script setup>
import { formataBRL } from "../utils/moeda";

const props = defineProps({
  presente: { type: Object, required: true }, // ideal ter presente.img (url da foto)
});

const emit = defineEmits(["contribuir"]);
</script>

<template>
  <div class="relative overflow-hidden rounded-2xl bg-gradient-to-b from-[#f7f5f2] to-[#f3f0ea]
           shadow-[0_3px_12px_rgba(16,24,16,0.08)] p-5 flex flex-col gap-3">
    <!-- textura opcional (comente se não quiser) -->
    <div class="pointer-events-none absolute inset-0 opacity-[0.08] mix-blend-multiply"
      style="background: url('/fundo.png') center/cover no-repeat;"></div>

    <!-- imagem redonda no topo -->
    <div class="w-36 h-36 mx-auto rounded-full overflow-hidden ring-[2px] ring-offset-[2px]"
      style="--tw-ring-color: #8a9479; --tw-ring-offset-color: #f6f3ee;">
      <img :src="presente.img || '/logo.png'" :alt="presente.name"
        class="w-full h-full object-cover transition-transform duration-500 ease-out hover:scale-[1.03] saturate-[0.9]"
        style="filter: sepia(0%) contrast(1) brightness(1.02);" />
    </div>

    <!-- título + meta -->
    <div class="text-center">
      <h3 class="font-semibold text-lg text-emerald-950/90 leading-snug">
        {{ presente.name }}
      </h3>
      <p class="text-[13px] mt-1 tracking-wide" style="color: #8a9479;">
        Meta: {{ formataBRL(presente.goal_amount) }}
      </p>
    </div>

    <!-- barra de progresso com vibe “artesanal” -->
    <div class="w-full bg-emerald-900/5 rounded-full h-2 overflow-hidden ring-1 ring-emerald-800/10">
      <div class="h-2 rounded-full bg-emerald-700/80"
        :style="{ width: Math.min(100, Math.round((Number(presente.received_amount || 0) / Number(presente.goal_amount || 1)) * 100)) + '%' }">
      </div>
    </div>

    <!-- recebido / falta -->
    <div class="text-sm text-emerald-950/80 flex items-center justify-center gap-2">
      <span>Recebido: <strong class="font-semibold">{{ formataBRL(presente.received_amount) }}</strong></span>
      <span class="opacity-40">•</span>
      <span>Falta: <strong class="font-semibold">
          {{ formataBRL(Math.max(0, Number(presente.goal_amount) - Number(presente.received_amount || 0))) }}
        </strong></span>
    </div>

    <!-- preço grande (estilo da sua referência) -->
    <div class="text-center mt-1">
      <div class="text-3xl font-bold text-emerald-900/90">
        {{ formataBRL(presente.goal_amount) }}
      </div>
    </div>

    <!-- botão -->
    <button
      class="mt-2 px-4 py-2.5 rounded-lg text-white shadow-sm hover:brightness-95 active:translate-y-[1px] transition"
      style="background-color: #8a9479; ring: 1px solid rgba(0,0,0,0.15);" @click="emit('contribuir', presente)">
      Contribuir
    </button>
    
  </div>
</template>
