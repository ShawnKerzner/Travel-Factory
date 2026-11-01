<script setup lang="ts">
import { ref, computed } from "vue";
import { useStore } from "vuex";
import BaseInput from "./BaseInput.vue";
import BaseButton from "./BaseButton.vue";
import ErrorMessage from "./ErrorMessage.vue";
import { isValidDateRange, isInPast, todayDateString } from "../utils/validation";

const store = useStore();

const startDate = ref("");
const endDate = ref("");
const reason = ref("");
const startDateError = ref("");
const endDateError = ref("");
const submitError = ref("");
const submitting = ref(false);

const dayCount = computed(() => {
	if (!startDate.value || !endDate.value || !isValidDateRange(startDate.value, endDate.value)) {
		return null;
	}
	const start = new Date(`${startDate.value}T00:00:00Z`);
	const end = new Date(`${endDate.value}T00:00:00Z`);
	const days = Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
	return days;
});

function validate(): boolean {
	startDateError.value = "";
	endDateError.value = "";

	if (!startDate.value) {
		startDateError.value = "Start date is required";
	} else if (isInPast(startDate.value)) {
		startDateError.value = "Start date cannot be in the past";
	}

	if (!endDate.value) {
		endDateError.value = "End date is required";
	} else if (startDate.value && !isValidDateRange(startDate.value, endDate.value)) {
		endDateError.value = "End date must be on or after start date";
	}

	return !startDateError.value && !endDateError.value;
}

async function handleSubmit() {
	submitError.value = "";
	if (!validate()) {
		return;
	}

	submitting.value = true;
	try {
		await store.dispatch("requests/submitRequest", {
			startDate: startDate.value,
			endDate: endDate.value,
			reason: reason.value || undefined,
		});
		startDate.value = "";
		endDate.value = "";
		reason.value = "";
		store.dispatch("toasts/show", "Vacation request submitted");
	} catch (error: any) {
		submitError.value = error.response?.data?.error ?? "Could not submit the request. Please try again.";
	} finally {
		submitting.value = false;
	}
}
</script>

<template>
  <form class="space-y-4" @submit.prevent="handleSubmit">
    <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <BaseInput v-model="startDate" type="date" label="Start Date" :error="startDateError" :min="todayDateString()" />
      <BaseInput v-model="endDate" type="date" label="End Date" :error="endDateError" :min="todayDateString()" />
    </div>
    <p v-if="dayCount !== null" class="text-sm text-gray-600">
      {{ dayCount }} {{ dayCount === 1 ? "day" : "days" }}
    </p>
    <BaseInput v-model="reason" label="Reason (optional)" />
    <ErrorMessage v-if="submitError" :message="submitError" />
    <BaseButton type="submit" :disabled="submitting">Submit Request</BaseButton>
  </form>
</template>
