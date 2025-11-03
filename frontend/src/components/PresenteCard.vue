<script setup>
import { formataBRL } from "../utils/moeda";

const props = defineProps({
  presente: { type: Object, required: true },
});

const emit = defineEmits(["contribuir"]);
</script>

<template>
  <div class="bg-white rounded-xl shadow p-4 flex flex-col gap-2">
    <div class="flex items-center justify-between">
      <h3 class="font-semibold text-lg">{{ presente.name }}</h3>
      <span class="text-sm text-gray-500">Meta: {{ formataBRL(presente.goal_amount) }}</span>
    </div>

    <div class="w-full bg-gray-100 rounded h-2 overflow-hidden">
      <div
        class="bg-green-500 h-2"
        :style="{ width: Math.min(100, Math.round((Number(presente.received_amount||0) / Number(presente.goal_amount||1)) * 100)) + '%' }">
      </div>
    </div>

    <div class="text-sm text-gray-600">
      Recebido: <strong>{{ formataBRL(presente.received_amount) }}</strong>
      <span class="mx-1">·</span>
      Falta:
      <strong>
        {{ formataBRL(Math.max(0, Number(presente.goal_amount) - Number(presente.received_amount||0))) }}
      </strong>
    </div>

    <button
      class="mt-2 px-3 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
      @click="emit('contribuir', presente)">
      Contribuir
    </button>
  </div>
</template>
