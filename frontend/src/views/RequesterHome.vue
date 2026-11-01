<script setup lang="ts">
import { onMounted, computed } from "vue";
import { useStore } from "vuex";
import AppHeader from "../components/AppHeader.vue";
import SubmitRequestForm from "../components/SubmitRequestForm.vue";
import RequestTable from "../components/RequestTable.vue";
import Pagination from "../components/Pagination.vue";
import LoadingSpinner from "../components/LoadingSpinner.vue";
import EmptyState from "../components/EmptyState.vue";

const store = useStore();

const myRequests = computed(() => store.state.requests.myRequests);
const myRequestsTotal = computed(() => store.state.requests.myRequestsTotal);
const myRequestsPage = computed(() => store.state.requests.myRequestsPage);
const myRequestsLimit = computed(() => store.state.requests.myRequestsLimit);
const loading = computed(() => store.state.requests.loading);

function loadPage(page: number) {
	store.dispatch("requests/fetchMyRequests", { page, limit: myRequestsLimit.value });
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
        <EmptyState v-else-if="myRequests.length === 0" message="You haven't submitted any vacation requests yet." />
        <template v-else>
          <RequestTable :requests="myRequests" />
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
  </div>
</template>
