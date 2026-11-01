<script setup lang="ts">
defineProps<{
	open: boolean;
	title?: string;
}>();

defineEmits<{
	close: [];
}>();
</script>

<template>
  <div v-if="open" class="fixed inset-0 z-50 flex items-center justify-center bg-black/40" @click.self="$emit('close')">
    <div class="w-full max-w-sm rounded bg-white p-6 shadow-lg">
      <h2 v-if="title" class="mb-4 text-lg font-semibold text-gray-800">{{ title }}</h2>
      <slot />
    </div>
  </div>
</template>
