<script setup lang="ts">
import { computed } from "vue";

const props = defineProps<{
	page: number;
	total: number;
	limit: number;
}>();

const emit = defineEmits<{
	"update:page": [page: number];
}>();

const totalPages = computed(() => Math.max(1, Math.ceil(props.total / props.limit)));
</script>

<template>
  <div class="flex items-center justify-between gap-4 text-sm text-gray-700">
    <button
      type="button"
      :disabled="page <= 1"
      @click="emit('update:page', page - 1)"
      class="rounded border px-3 py-1 disabled:cursor-not-allowed disabled:opacity-50"
    >
      Previous
    </button>
    <span>Page {{ page }} of {{ totalPages }}</span>
    <button
      type="button"
      :disabled="page >= totalPages"
      @click="emit('update:page', page + 1)"
      class="rounded border px-3 py-1 disabled:cursor-not-allowed disabled:opacity-50"
    >
      Next
    </button>
  </div>
</template>
