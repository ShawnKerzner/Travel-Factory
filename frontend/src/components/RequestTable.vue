<script setup lang="ts">
import StatusBadge from "./StatusBadge.vue";

export interface RequestRow {
	id: number;
	startDate: string;
	endDate: string;
	reason: string | null;
	status: "pending" | "approved" | "rejected";
	comments?: string | null;
	user?: { name: string };
}

defineProps<{
	requests: RequestRow[];
	showRequester?: boolean;
}>();

defineSlots<{
	actions?: (props: { request: RequestRow }) => any;
}>();
</script>

<template>
  <table class="w-full text-left text-sm">
    <thead class="border-b text-gray-500">
      <tr>
        <th v-if="showRequester" class="py-2 pr-4">Requester</th>
        <th class="py-2 pr-4">Start Date</th>
        <th class="py-2 pr-4">End Date</th>
        <th class="py-2 pr-4">Reason</th>
        <th class="py-2 pr-4">Status</th>
        <th v-if="$slots.actions" class="py-2 pr-4">Actions</th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="request in requests" :key="request.id" class="border-b last:border-0">
        <td v-if="showRequester" class="py-2 pr-4">{{ request.user?.name }}</td>
        <td class="py-2 pr-4">{{ request.startDate }}</td>
        <td class="py-2 pr-4">{{ request.endDate }}</td>
        <td class="py-2 pr-4">{{ request.reason || "—" }}</td>
        <td class="py-2 pr-4"><StatusBadge :status="request.status" /></td>
        <td v-if="$slots.actions" class="py-2 pr-4">
          <slot name="actions" :request="request" />
        </td>
      </tr>
    </tbody>
  </table>
</template>
