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
    <span class="font-semibold text-gray-800">Vacation Management</span>
    <BaseButton type="button" @click="handleLogout">Log out</BaseButton>
  </header>
</template>
