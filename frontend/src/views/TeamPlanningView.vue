<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useStore } from "vuex";
import AppHeader from "../components/AppHeader.vue";
import BaseInput from "../components/BaseInput.vue";
import BaseButton from "../components/BaseButton.vue";
import ErrorMessage from "../components/ErrorMessage.vue";
import RequestTable from "../components/RequestTable.vue";
import LoadingSpinner from "../components/LoadingSpinner.vue";
import EmptyState from "../components/EmptyState.vue";
import { getCurrentMonthRange, isValidDateRange } from "../utils/validation";

const store = useStore();

const defaultRange = getCurrentMonthRange();
const startDate = ref(defaultRange.startDate);
const endDate = ref(defaultRange.endDate);
const rangeError = ref("");

const vacations = computed(() => store.state.requests.teamVacations);
const loading = computed(() => store.state.requests.teamVacationsLoading);

async function loadRange() {
	rangeError.value = "";

	if (!startDate.value || !endDate.value) {
		rangeError.value = "Both start and end dates are required";
		return;
	}
	if (!isValidDateRange(startDate.value, endDate.value)) {
		rangeError.value = "End date must be on or after start date";
		return;
	}

	try {
		await store.dispatch("requests/fetchTeamVacations", { startDate: startDate.value, endDate: endDate.value });
	} catch (error: any) {
		rangeError.value = error.response?.data?.error ?? "Could not load team vacations. Please try again.";
	}
}

onMounted(loadRange);
</script>

<template>
  <div>
    <AppHeader />
    <main class="mx-auto max-w-3xl space-y-6 px-6 py-8">
      <h1 class="text-xl font-semibold text-gray-800">Team Planning</h1>

      <div class="flex items-end gap-4">
        <BaseInput v-model="startDate" type="date" label="Start Date" />
        <BaseInput v-model="endDate" type="date" label="End Date" />
        <BaseButton type="button" @click="loadRange">View</BaseButton>
      </div>
      <LoadingSpinner v-if="loading" />
      <ErrorMessage v-else-if="rangeError" :message="rangeError" />
      <EmptyState v-else-if="vacations.length === 0" message="No approved vacations in this date range." />
      <RequestTable v-else :requests="vacations" show-requester />
    </main>
  </div>
</template>
