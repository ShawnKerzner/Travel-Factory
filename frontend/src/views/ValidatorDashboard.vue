<script setup lang="ts">
import { onMounted, computed, ref } from "vue";
import { useStore } from "vuex";
import AppHeader from "../components/AppHeader.vue";
import FilterBar from "../components/FilterBar.vue";
import RequestTable from "../components/RequestTable.vue";
import Pagination from "../components/Pagination.vue";
import LoadingSpinner from "../components/LoadingSpinner.vue";
import EmptyState from "../components/EmptyState.vue";
import ErrorMessage from "../components/ErrorMessage.vue";
import BaseButton from "../components/BaseButton.vue";
import RejectRequestModal from "../components/RejectRequestModal.vue";
import type { RequestRow } from "../components/RequestTable.vue";

const store = useStore();

const requests = computed(() => store.state.requests.validatorRequests);
const total = computed(() => store.state.requests.validatorTotal);
const page = computed(() => store.state.requests.validatorPage);
const limit = computed(() => store.state.requests.validatorLimit);
const loading = computed(() => store.state.requests.validatorLoading);
const requesters = computed(() => store.state.requests.requesters);

const statusFilter = ref("");
const userIdFilter = ref("");
const actionError = ref("");

const rejectModalOpen = ref(false);
const rejectRequestId = ref<number | null>(null);

function loadPage(newPage: number) {
	store.dispatch("requests/fetchValidatorRequests", { page: newPage });
}

function applyFilters() {
	store.dispatch("requests/setValidatorFilters", {
		status: statusFilter.value || undefined,
		userId: userIdFilter.value ? Number(userIdFilter.value) : undefined,
	});
}

function handleStatusChange(value: string) {
	statusFilter.value = value;
	applyFilters();
}

function handleUserIdChange(value: string) {
	userIdFilter.value = value;
	applyFilters();
}

async function handleApprove(request: RequestRow) {
	actionError.value = "";
	try {
		await store.dispatch("requests/approveRequest", { id: request.id });
	} catch (error: any) {
		actionError.value = error.response?.data?.error ?? "Could not approve the request.";
	}
}

function openReject(request: RequestRow) {
	rejectRequestId.value = request.id;
	rejectModalOpen.value = true;
}

function closeReject() {
	rejectModalOpen.value = false;
	rejectRequestId.value = null;
}

onMounted(() => {
	store.dispatch("requests/fetchRequesters");
	loadPage(1);
});
</script>

<template>
  <div>
    <AppHeader />
    <main class="mx-auto max-w-4xl space-y-6 px-6 py-8">
      <h1 class="text-xl font-semibold text-gray-800">Validator Dashboard</h1>

      <FilterBar
        :status="statusFilter"
        :user-id="userIdFilter"
        :requesters="requesters"
        @update:status="handleStatusChange"
        @update:userId="handleUserIdChange"
      />

      <ErrorMessage v-if="actionError" :message="actionError" />

      <LoadingSpinner v-if="loading" />
      <EmptyState v-else-if="requests.length === 0" message="No vacation requests match these filters." />
      <template v-else>
        <RequestTable :requests="requests" show-requester>
          <template #actions="{ request }">
            <div v-if="request.status === 'pending'" class="flex gap-2">
              <BaseButton type="button" @click="handleApprove(request)">Approve</BaseButton>
              <BaseButton type="button" @click="openReject(request)">Reject</BaseButton>
            </div>
          </template>
        </RequestTable>
        <div class="mt-4">
          <Pagination :page="page" :total="total" :limit="limit" @update:page="loadPage" />
        </div>
      </template>
    </main>

    <RejectRequestModal :open="rejectModalOpen" :request-id="rejectRequestId" @close="closeReject" />
  </div>
</template>
