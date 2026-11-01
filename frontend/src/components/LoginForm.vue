<script setup lang="ts">
import { ref } from "vue";
import { useStore } from "vuex";
import { useRouter } from "vue-router";
import BaseInput from "./BaseInput.vue";
import BaseButton from "./BaseButton.vue";
import ErrorMessage from "./ErrorMessage.vue";

const store = useStore();
const router = useRouter();

const email = ref("");
const password = ref("");
const emailError = ref("");
const passwordError = ref("");
const submitError = ref("");
const submitting = ref(false);

async function handleSubmit() {
	emailError.value = email.value ? "" : "Email is required";
	passwordError.value = password.value ? "" : "Password is required";
	submitError.value = "";

	if (emailError.value || passwordError.value) {
		return;
	}

	submitting.value = true;
	try {
		await store.dispatch("auth/login", { email: email.value, password: password.value });
		const role = store.getters["auth/role"];
		router.push(role === "validator" ? "/validator" : "/requester");
	} catch (error: any) {
		submitError.value = error.response?.data?.error ?? "Login failed. Please try again.";
	} finally {
		submitting.value = false;
	}
}
</script>

<template>
  <form class="w-full max-w-sm space-y-4" @submit.prevent="handleSubmit">
    <BaseInput v-model="email" type="email" label="Email" :error="emailError" />
    <BaseInput v-model="password" type="password" label="Password" :error="passwordError" />
    <ErrorMessage v-if="submitError" :message="submitError" />
    <BaseButton type="submit" :disabled="submitting">Log in</BaseButton>
  </form>
</template>
