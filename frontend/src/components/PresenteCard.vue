<script setup>
const props = defineProps({
  presente: { type: Object, required: true },
});

// vamos emitir dois eventos:
// - "contribuir"  -> para contribuir com valor (PIX)
// - "presentear"  -> para abrir o modal de presentear com o item
const emit = defineEmits(["contribuir", "presentear"]);
</script>

<template>
  <div
    class="relative overflow-hidden rounded-2xl bg-gradient-to-b from-[#f7f5f2] to-[#f3f0ea]
           shadow-[0_3px_12px_rgba(16,24,16,0.08)] p-5 flex flex-col gap-3"
  >
    <!-- textura opcional -->
    <div
      class="pointer-events-none absolute inset-0 opacity-[0.08] mix-blend-multiply"
      style="background: url('/fundo.png') center/cover no-repeat;"
    ></div>

    <!-- imagem redonda no topo -->
    <div
      class="w-36 h-36 mx-auto rounded-full overflow-hidden ring-[2px] ring-offset-[2px]"
      style="--tw-ring-color: #8a9479; --tw-ring-offset-color: #f6f3ee;"
    >
      <img
        :src="presente.img || '/logo.png'"
        :alt="presente.name"
        class="w-full h-full object-cover transition-transform duration-500 ease-out hover:scale-[1.03] saturate-[0.9]"
        style="filter: sepia(0%) contrast(1) brightness(1.02);"
      />
    </div>

    <!-- título -->
    <div class="text-center">
      <h3 class="font-semibold text-lg text-emerald-950/90 leading-snug">
        {{ presente.name }}
      </h3>
    </div>

    <!-- descrição -->
    <div class="text-center">
      <span class="text-sm text-emerald-950/90 leading-snug">
        {{ presente.descricao }}
      </span>
    </div>

    <!-- ESTADO: presente concluído -->
    <div v-if="presente.concluido === 'X'" class="mt-4 text-center">
      <div class="flex flex-col items-center justify-center gap-2 text-emerald-800">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="h-10 w-10"
          viewBox="0 0 24 24"
          fill="currentColor"
        >
          <path
            d="M12 2.25a9.75 9.75 0 1 0 0 19.5 9.75 9.75 0 0 0 0-19.5Zm4.03 6.97a.75.75 0 0 1 0 1.06l-5.5 5.5a.75.75 0 0 1-1.06 0l-2.25-2.25a.75.75 0 0 1 1.06-1.06l1.72 1.72 4.97-4.97a.75.75 0 0 1 1.06 0Z"
          />
        </svg>
        <p class="text-base font-medium leading-snug">
          Este presente foi concluído
        </p>
        <p class="text-sm text-emerald-900/80">
          Obrigado por fazer parte desse momento com tanto carinho!
        </p>
      </div>
    </div>

    <!-- ESTADO: ainda em aberto -->
    <div v-else class="flex flex-col gap-2 mt-2">
      <!-- linha com os dois botões -->
      <div class="flex flex-col gap-2 sm:flex-row">
        <!-- botão: contribuir com valor (PIX) -->
        <button
          class="px-4 py-2.5 text-sm rounded-lg text-white shadow-sm hover:brightness-95 active:translate-y-[1px] transition w-full"
          style="background-color: #8a9479; ring: 1px solid rgba(0,0,0,0.15);"
          @click="emit('contribuir', presente)"
        >
          Contribuir com valor
        </button>

        <!-- botão: presentear com este item -->
        <button
          class="px-4 py-2.5 rounded-lg text-sm text-white shadow-sm hover:brightness-95 active:translate-y-[1px] transition w-full"
          style="background-color: #8a9479; ring: 1px solid rgba(0,0,0,0.15);"
          @click="emit('presentear', presente)"
        >
          Presentear com este item
        </button>
      </div>

      <!-- texto de apoio -->
      <div class="text-center mt-1">
        <span class="text-sm text-emerald-950/90 leading-snug">
          Você pode contribuir com um valor ou presentear diretamente com este item 💚
        </span>
      </div>
    </div>
  </div>
</template>