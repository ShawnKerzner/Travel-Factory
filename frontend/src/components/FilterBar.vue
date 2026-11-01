<script setup lang="ts">
import type { Requester } from "../store/modules/requests";

defineProps<{
	status: string;
	userId: string;
	requesters: Requester[];
}>();

const emit = defineEmits<{
	"update:status": [value: string];
	"update:userId": [value: string];
}>();
</script>

<template>
  <div class="mb-4 flex gap-4">
    <label class="block">
      <span class="mb-1 block text-sm font-medium text-gray-700">Status</span>
      <select
        :value="status"
        @change="emit('update:status', ($event.target as HTMLSelectElement).value)"
        class="rounded border border-gray-300 px-3 py-2 text-sm"
      >
        <option value="">All</option>
        <option value="pending">Pending</option>
        <option value="approved">Approved</option>
        <option value="rejected">Rejected</option>
      </select>
    </label>
    <label class="block">
      <span class="mb-1 block text-sm font-medium text-gray-700">Requester</span>
      <select
        :value="userId"
        @change="emit('update:userId', ($event.target as HTMLSelectElement).value)"
        class="rounded border border-gray-300 px-3 py-2 text-sm"
      >
        <option value="">All</option>
        <option v-for="requester in requesters" :key="requester.id" :value="String(requester.id)">
          {{ requester.name }}
        </option>
      </select>
    </label>
  </div>
</template>
