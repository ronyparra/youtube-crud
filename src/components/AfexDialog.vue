<template>
  <dialog ref="dialog" class="afex-dialog">
    <header>
      <BtnClose class="close" text @click="$emit('update:modelValue', false)" />
    </header>
    <div class="afex-dialog__body">
      <slot />
    </div>
  </dialog>
</template>

<script setup>
import BtnClose from "./BtnClose.vue";
import { watch, ref, onMounted } from "vue";
const emit = defineEmits(["update:modelValue"]);
const props = defineProps({
  modelValue: {
    type: Boolean,
    required: true,
  },
});

onMounted(() => {
  if (props.modelValue) dialog.value.showModal();
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
