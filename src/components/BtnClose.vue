<template>
  <button
    :class="{
      'btn-close': !props.text,
      'btn-close-text': props.text,
    }"
  >
    <span class="material-symbols-outlined"> close </span>
  </button>
</template>
<script setup>
const props = defineProps({
  text: {
    type: Boolean,
  },
});
</script>
