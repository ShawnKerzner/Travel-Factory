<script setup lang="ts">
import { ref } from "vue";
import { useStore } from "vuex";
import Modal from "./Modal.vue";
import BaseButton from "./BaseButton.vue";
import ErrorMessage from "./ErrorMessage.vue";
import type { RequestRow } from "./RequestTable.vue";

const props = defineProps<{
	open: boolean;
	request: RequestRow | null;
}>();

const emit = defineEmits<{
	close: [];
}>();

const store = useStore();
const submitError = ref("");
const submitting = ref(false);

async function handleConfirm() {
	submitError.value = "";
	submitting.value = true;
	try {
		await store.dispatch("requests/cancelRequest", { id: props.request!.id });
		store.dispatch("toasts/show", "Request cancelled");
		emit("close");
	} catch (error: any) {
		submitError.value = error.response?.data?.error ?? "Could not cancel the request. Please try again.";
	} finally {
		submitting.value = false;
	}
}
</script>

<template>
  <Modal :open="open" title="Cancel Request" @close="$emit('close')">
    <div class="space-y-4">
      <p v-if="request" class="text-sm text-gray-700">
        Cancel your request for {{ request.startDate }} to {{ request.endDate }}? This can't be undone.
      </p>
      <ErrorMessage v-if="submitError" :message="submitError" />
      <div class="flex justify-end gap-2">
        <BaseButton type="button" @click="$emit('close')">Keep Request</BaseButton>
        <BaseButton type="button" :disabled="submitting" @click="handleConfirm">Yes, Cancel It</BaseButton>
      </div>
    </div>
  </Modal>
</template>
