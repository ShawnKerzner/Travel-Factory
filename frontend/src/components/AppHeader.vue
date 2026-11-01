<script setup lang="ts">
import { useStore } from "vuex";
import { useRouter } from "vue-router";
import BaseButton from "./BaseButton.vue";

const store = useStore();
const router = useRouter();

function handleLogout() {
	store.dispatch("auth/logout");
	router.push("/login");
}
</script>

<template>
  <header class="flex items-center justify-between border-b px-6 py-4">
    <div class="flex items-center gap-6">
      <span class="font-semibold text-gray-800">Vacation Management</span>
      <RouterLink to="/team-planning" class="text-sm text-blue-600 hover:underline">Team Planning</RouterLink>
    </div>
    <BaseButton type="button" @click="handleLogout">Log out</BaseButton>
  </header>
</template>
