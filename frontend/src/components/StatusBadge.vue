<script setup lang="ts">
const props = defineProps<{
	status: "pending" | "approved" | "rejected";
}>();

const styles: Record<string, string> = {
	pending: "bg-yellow-100 text-yellow-800",
	approved: "bg-green-100 text-green-800",
	rejected: "bg-red-100 text-red-800",
};

const labels: Record<string, string> = {
	pending: "Pending",
	approved: "Approved",
	rejected: "Rejected",
};
</script>

<template>
  <span
    class="inline-block rounded-full px-2.5 py-0.5 text-xs font-medium"
    :class="styles[props.status]"
  >
    {{ labels[props.status] }}
  </span>
</template>
