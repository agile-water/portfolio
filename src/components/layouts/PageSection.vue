<template>
  <section class="page-section" :class="{ 'page-section--no-padding': noPadding }">
    <slot />
  </section>
</template>

<script setup lang="ts">
interface Props {
  noPadding?: boolean
}

withDefaults(defineProps<Props>(), {
  noPadding: false,
})
</script>

<style scoped lang="scss">
.page-section {
  display: flex;
  flex-direction: column;
  gap: $spacing-lg;
  padding: $spacing-lg;
  background: $color-bg;
  border-radius: $radius-sm;

  &--no-padding {
    padding: 0;
    background: transparent;
    border-radius: 0;
  }
}
</style>
