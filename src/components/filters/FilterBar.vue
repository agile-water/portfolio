<template>
  <div class="filter-bar">
    <div class="filter-bar__fields">
      <slot />
    </div>
    <div class="filter-bar__actions">
      <slot name="actions" />
    </div>
  </div>
</template>

<script setup lang="ts"></script>

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
