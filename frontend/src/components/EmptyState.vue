<script setup lang="ts">
defineProps<{
	message: string;
}>();
</script>

<template>
  <p class="py-8 text-center text-sm text-gray-500">{{ message }}</p>
</template>
