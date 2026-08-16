<template>
  <div class="filter-bar" :class="{ 'filter-bar--full-bleed': fullBleed }">
    <div class="filter-bar__fields">
      <slot />
    </div>
    <div class="filter-bar__actions">
      <slot name="actions" />
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  /** true면 모서리를 각지게 하고, 화면 가장자리까지 꽉 채우는 툴바 형태로 표시합니다. */
  fullBleed?: boolean
}

withDefaults(defineProps<Props>(), {
  fullBleed: false,
})
</script>

<style scoped lang="scss">
.filter-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: $spacing-lg;
  padding: $spacing-md;
  background: $color-bg-muted;
  border-radius: $radius-sm;

  &--full-bleed {
    padding: $spacing-md $spacing-lg;
    border-radius: 0;
  }
}

.filter-bar__fields {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: $spacing-lg;
  min-width: 0;
}

.filter-bar__actions {
  display: flex;
  align-items: center;
  flex-shrink: 0;
  gap: $spacing-sm;
}
</style>
