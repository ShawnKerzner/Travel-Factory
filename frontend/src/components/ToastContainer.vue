<script setup lang="ts">
import { computed } from "vue";
import { useStore } from "vuex";

const store = useStore();
const toasts = computed(() => store.state.toasts.toasts);
</script>

<template>
  <div class="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
    <div
      v-for="toast in toasts"
      :key="toast.id"
      class="rounded bg-gray-800 px-4 py-2 text-sm text-white shadow-lg"
      role="status"
    >
      {{ toast.message }}
    </div>
  </div>
</template>
