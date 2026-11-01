<script setup lang="ts">
import { ref, watch } from "vue";
import { useStore } from "vuex";
import Modal from "./Modal.vue";
import BaseButton from "./BaseButton.vue";
import ErrorMessage from "./ErrorMessage.vue";

const props = defineProps<{
	open: boolean;
	requestId: number | null;
}>();

const emit = defineEmits<{
	close: [];
}>();

const store = useStore();
const comment = ref("");
const commentError = ref("");
const submitError = ref("");
const submitting = ref(false);

watch(
	() => props.open,
	(isOpen) => {
		if (isOpen) {
			comment.value = "";
			commentError.value = "";
			submitError.value = "";
		}
	}
);

async function handleReject() {
	commentError.value = comment.value.trim() ? "" : "A comment is required to reject a request";
	submitError.value = "";
	if (commentError.value) {
		return;
	}

	submitting.value = true;
	try {
		await store.dispatch("requests/rejectRequest", { id: props.requestId, comment: comment.value });
		store.dispatch("toasts/show", "Request rejected");
		emit("close");
	} catch (error: any) {
		submitError.value = error.response?.data?.error ?? "Could not reject the request. Please try again.";
	} finally {
		submitting.value = false;
	}
}
</script>

<template>
  <Modal :open="open" title="Reject Request" @close="$emit('close')">
    <div class="space-y-4">
      <label class="block">
        <span class="mb-1 block text-sm font-medium text-gray-700">Comment</span>
        <textarea
          v-model="comment"
          rows="3"
          class="w-full rounded border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
          :class="commentError ? 'border-red-400' : 'border-gray-300'"
        />
        <span v-if="commentError" class="mt-1 block text-sm text-red-600">{{ commentError }}</span>
      </label>
      <ErrorMessage v-if="submitError" :message="submitError" />
      <div class="flex justify-end gap-2">
        <BaseButton type="button" @click="$emit('close')">Cancel</BaseButton>
        <BaseButton type="button" :disabled="submitting" @click="handleReject">Reject</BaseButton>
      </div>
    </div>
  </Modal>
</template>
