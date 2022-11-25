<template>
  <div class="afex-text-field">
    <input
      :value="modelValue"
      @input="$emit('update:modelValue', $event.target.value)"
      type="text"
      :required="required"
      :placeholder="props.placeholder"
    />
    <label for="error" v-if="error">{{ error }}</label>
  </div>
</template>

<script setup>
const props = defineProps({
  required: Boolean,
  placeholder: String,
  error: String,
  modelValue: {
    type: String,
    default: "",
    required: true,
  },
});
</script>
