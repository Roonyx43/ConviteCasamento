<template>
  <div class="min-h-screen text-gray-800 relative overflow-hidden">
    <!-- Fundo de imagem (bem atrás) -->
    <div class="absolute inset-0 -z-20" style="
        background: url('/fundo.png') center/cover no-repeat;
        filter: brightness(1.05) contrast(0.95);
      "></div>

    <!-- Folhas decorativas (atrás do conteúdo, à frente do fundo) -->
    <img src="/folhas.png" alt="folhas canto superior esquerdo" class="absolute top-0 left-0 -z-10 opacity-80 pointer-events-none select-none
             w-[30rem] -translate-x-[9rem] -translate-y-[21rem] rotate-[-15deg]" />
    <img src="/folhas.png" alt="folhas canto inferior direito" class="absolute bottom-0 right-0 -z-10 opacity-50 pointer-events-none select-none
             w-[32rem] translate-x-[9rem] translate-y-[23rem] rotate-[180deg]" />

    <header class="relative z-10 py-3 px-4">
      <div class="max-w-4xl mx-auto flex items-center justify-center relative">
        <!-- Logo centralizada -->
        <img src="/logo.png" alt="Logo"
          class="h-28 object-contain opacity-90 drop-shadow-[0_2px_6px_rgba(0,0,0,0.5)]" />
      </div>
    </header>

    <section class="relative py-3 px-4">
      <div class="max-w-4xl mx-auto flex items-center flex-col justify-center relative">
        <h3 class="text-3xl texto-inicial py-3">Querido(a) convidado(a),</h3>
        <p class="texto-inicial text-2xl py-4 px-3 text-center">
          Sua presença será o nosso maior presente! 💚
          Mas, se desejar nos presentear de alguma forma, deixamos abaixo algumas sugestões para o enxoval do nosso lar.
          Fique à vontade para contribuir com o valor ou item que quiser — o mais importante para nós é poder
          compartilhar esse momento especial com você!
          Com carinho,
        </p>
        <span class=" text-3xl texto-inicial mt-3">
          Matheus e Gabriela
        </span>
      </div>
    </section>

    <main class="relative z-10 max-w-4xl mx-auto p-4 mt-6 rounded-lg">
      <RouterView />
    </main>
  </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Fira+Code:wght@300..700&family=Great+Vibes&family=Montserrat:ital,wght@0,100..900;1,100..900&family=Oswald:wght@200..700&family=Prata&family=Roboto:ital,wght@0,100..900;1,100..900&display=swap');

.texto-inicial {
  font-family: 'Great Vibes';
}
</style>