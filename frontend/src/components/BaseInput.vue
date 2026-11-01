<script setup lang="ts">
defineOptions({ inheritAttrs: false });

defineProps<{
	modelValue: string;
	type?: string;
	label?: string;
	error?: string;
}>();

defineEmits<{
	"update:modelValue": [value: string];
}>();
</script>

<template>
  <label class="block">
    <span v-if="label" class="mb-1 block text-sm font-medium text-gray-700">{{ label }}</span>
    <input
      v-bind="$attrs"
      :type="type ?? 'text'"
      :value="modelValue"
      @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
      class="w-full rounded border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
      :class="error ? 'border-red-400' : 'border-gray-300'"
    />
    <span v-if="error" class="mt-1 block text-sm text-red-600">{{ error }}</span>
  </label>
</template>
