<template>
  <section
    class="page-section"
    :class="{ 'page-section--no-padding': noPadding, 'page-section--muted': muted }"
  >
    <slot />
  </section>
</template>

<script setup lang="ts">
interface Props {
  noPadding?: boolean
  /** true면 흰 배경 대신 $color-bg-secondary(연한 회색) 배경의 "중첩 카드" 톤으로 표시합니다. */
  muted?: boolean
}

withDefaults(defineProps<Props>(), {
  noPadding: false,
  muted: false,
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

  &--muted {
    background: $color-bg-secondary;
  }
}
</style>
