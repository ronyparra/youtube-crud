<template>
  <dialog ref="dialog" class="afex-dialog">
    <BtnClose class="close" text @click="$emit('update:modelValue', false)" />
    <slot />
  </dialog>
</template>

<script setup>
import BtnClose from "./BtnClose.vue";
import { watch, ref } from "vue";
const emit = defineEmits(["update:modelValue"]);
const props = defineProps({
  modelValue: {
    type: Boolean,
    required: true,
  },
});

const dialog = ref(null);

watch(
  () => props.modelValue,
  (newValue) => {
    emit("update:modelValue", newValue);
    newValue ? dialog.value.showModal() : dialog.value.close();
  }
);
</script>
