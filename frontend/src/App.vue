<template>
  <div class="min-h-screen bg-gray-50 text-gray-800">
    <header class="p-4 border-b bg-white">
      <div class="max-w-4xl mx-auto flex items-center justify-between">
        <h1 class="text-xl font-bold">Lista de Presentes</h1>
        <nav class="text-sm">
          <RouterLink to="/" class="hover:underline">Presentes</RouterLink>
        </nav>
      </div>
    </header>
    <main class="max-w-4xl mx-auto p-4">
      <RouterView />
    </main>
  </div>
</template>
