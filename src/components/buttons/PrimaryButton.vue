<template>
  <button type="button" class="primary-button" :disabled="disabled">
    <slot />
  </button>
</template>

<script setup lang="ts">
interface Props {
  disabled?: boolean
}

withDefaults(defineProps<Props>(), {
  disabled: false,
})
</script>

<style scoped lang="scss">
.primary-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 44px;
  padding: 0 20px;
  border: none;
  border-radius: $radius-sm;
  background: $color-primary;
  color: $color-bg;
  font-family: inherit;
  font-size: $font-size-sm;
  font-weight: $font-weight-bold;
  cursor: pointer;
  transition: opacity 0.15s ease;

  &:hover:not(:disabled) {
    opacity: 0.9;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
}
</style>
