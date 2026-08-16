<template>
  <div class="metric-trend-card-group" role="tablist">
    <MetricTrendCard
      v-for="item in items"
      :key="item.id"
      :label="item.label"
      :icon="item.icon"
      :value="item.value"
      :unit="item.unit"
      :variant="item.variant"
      :trend="item.trend"
      :selected="item.id === modelValue"
      @click="select(item.id)"
    />
  </div>
</template>

<script setup lang="ts">
// 카드들이 탭처럼 동작합니다. 클릭한 카드가 선택되어 테두리가 primary 색으로 바뀌고,
// 다른 카드의 선택은 해제됩니다.
import MetricTrendCard, { type MetricTrend, type MetricTrendCardVariant } from './MetricTrendCard.vue'

export interface MetricTrendCardItem {
  id: string
  label: string
  icon: string
  value: string | number
  unit?: string
  variant?: MetricTrendCardVariant
  trend?: MetricTrend
}

interface Props {
  items: MetricTrendCardItem[]
  modelValue?: string
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: '',
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
}>()

function select(id: string): void {
  if (id === props.modelValue) return
  emit('update:modelValue', id)
}
</script>

<style scoped lang="scss">
.metric-trend-card-group {
  display: flex;
  gap: $spacing-lg;
  flex-wrap: wrap;
}
</style>
