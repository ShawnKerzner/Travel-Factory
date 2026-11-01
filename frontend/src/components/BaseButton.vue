<script setup lang="ts">
defineProps<{
	type?: "button" | "submit";
	disabled?: boolean;
}>();
</script>

<template>
  <button
    :type="type ?? 'button'"
    :disabled="disabled"
    class="rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
  >
    <slot />
  </button>
</template>
