<template>
  <div class="stat-card-group">
    <StatCard
      v-for="item in items"
      :key="item.id"
      :label="item.label"
      :icon="item.icon"
      :value="item.value"
      :unit="item.unit"
      :variant="item.variant"
    />
  </div>
</template>

<script setup lang="ts">
import StatCard, { type StatCardVariant } from './StatCard.vue'

export interface StatCardItem {
  id: string
  label: string
  icon: string
  value: string | number
  unit?: string
  variant?: StatCardVariant
}

interface Props {
  items: StatCardItem[]
}

defineProps<Props>()
</script>

<style scoped lang="scss">
.stat-card-group {
  display: flex;
  gap: $spacing-lg;
  flex-wrap: wrap;
}
</style>
