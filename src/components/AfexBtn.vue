<template>
  <button
    :class="{
      'afex-btn': !props.text,
      'afex-btn-text': props.text,
    }"
  >
    <slot />
  </button>
</template>
<script setup>
const props = defineProps({
  text: {
    type: Boolean,
  },
});
</script>
