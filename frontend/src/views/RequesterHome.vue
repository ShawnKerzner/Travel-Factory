<script setup lang="ts">
import { onMounted, computed, ref } from "vue";
import { useStore } from "vuex";
import AppHeader from "../components/AppHeader.vue";
import SubmitRequestForm from "../components/SubmitRequestForm.vue";
import RequestTable from "../components/RequestTable.vue";
import Pagination from "../components/Pagination.vue";
import LoadingSpinner from "../components/LoadingSpinner.vue";
import EmptyState from "../components/EmptyState.vue";
import ErrorMessage from "../components/ErrorMessage.vue";
import BaseButton from "../components/BaseButton.vue";
import CancelRequestModal from "../components/CancelRequestModal.vue";
import type { RequestRow } from "../components/RequestTable.vue";

const store = useStore();

const myRequests = computed(() => store.state.requests.myRequests);
const myRequestsTotal = computed(() => store.state.requests.myRequestsTotal);
const myRequestsPage = computed(() => store.state.requests.myRequestsPage);
const myRequestsLimit = computed(() => store.state.requests.myRequestsLimit);
const loading = computed(() => store.state.requests.loading);
const loadError = ref("");

const cancelModalOpen = ref(false);
const cancelTarget = ref<RequestRow | null>(null);

async function loadPage(page: number) {
	loadError.value = "";
	try {
		await store.dispatch("requests/fetchMyRequests", { page, limit: myRequestsLimit.value });
	} catch (error: any) {
		loadError.value = error.response?.data?.error ?? "Could not load your requests. Please try again.";
	}
}

function openCancel(request: RequestRow) {
	cancelTarget.value = request;
	cancelModalOpen.value = true;
}

function closeCancel() {
	cancelModalOpen.value = false;
	cancelTarget.value = null;
}

onMounted(() => loadPage(1));
</script>

<template>
  <div>
    <AppHeader />
    <main class="mx-auto max-w-3xl space-y-8 px-6 py-8">
      <section>
        <h1 class="mb-4 text-xl font-semibold text-gray-800">Submit a Vacation Request</h1>
        <SubmitRequestForm />
      </section>

      <section>
        <h2 class="mb-4 text-xl font-semibold text-gray-800">My Requests</h2>
        <LoadingSpinner v-if="loading" />
        <ErrorMessage v-else-if="loadError" :message="loadError" />
        <EmptyState v-else-if="myRequests.length === 0" message="You haven't submitted any vacation requests yet." />
        <template v-else>
          <RequestTable :requests="myRequests">
            <template #actions="{ request }">
              <BaseButton v-if="request.status === 'pending'" type="button" @click="openCancel(request)">
                Cancel
              </BaseButton>
            </template>
          </RequestTable>
          <div class="mt-4">
            <Pagination
              :page="myRequestsPage"
              :total="myRequestsTotal"
              :limit="myRequestsLimit"
              @update:page="loadPage"
            />
          </div>
        </template>
      </section>
    </main>

    <CancelRequestModal :open="cancelModalOpen" :request="cancelTarget" @close="closeCancel" />
  </div>
</template>
