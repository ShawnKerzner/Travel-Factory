<script setup lang="ts">
defineProps<{
	message: string;
}>();
</script>

<template>
  <p class="rounded bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">{{ message }}</p>
</template>
