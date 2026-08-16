<template>
  <div class="mode-summary-card-group" role="tablist">
    <ModeSummaryCard
      v-for="item in items"
      :key="item.mode"
      :mode="item.mode"
      :label="item.label"
      :value="item.value"
      :total="item.total"
      :color="item.color"
      :selected="item.mode === modelValue"
      @click="select(item.mode)"
    />
  </div>
</template>

<script setup lang="ts">
// MetricTrendCardGroup과 같은 관례: 카드들이 탭처럼 동작해서, 클릭한 카드만 선택되고
// 나머지 선택은 자동으로 해제됩니다. Completeness/Consistency 등 여러 Data Monitoring
// 화면에서 공통으로 쓰는 범용 컴포넌트입니다.
import ModeSummaryCard from './ModeSummaryCard.vue'
import type { TransportMode } from '@/components/badges/TransportModeIcon.vue'

export interface ModeSummaryCardItem {
  mode: TransportMode
  label: string
  value: number
  total: number
  color?: string
}

interface Props {
  items: ModeSummaryCardItem[]
  modelValue?: TransportMode | null
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: null,
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: TransportMode): void
}>()

function select(mode: TransportMode): void {
  if (mode === props.modelValue) return
  emit('update:modelValue', mode)
}
</script>

<style scoped lang="scss">
.mode-summary-card-group {
  display: flex;
  gap: $spacing-lg;
  flex: 1;
  flex-wrap: wrap;
}
</style>
