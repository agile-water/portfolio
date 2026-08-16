<template>
  <button
    type="button"
    role="tab"
    class="mode-summary-card"
    :class="{ 'mode-summary-card--selected': selected }"
    :aria-selected="selected"
    @click="emit('click')"
  >
    <TransportModeIcon :mode="mode" size="40px" />

    <div class="mode-summary-card__body">
      <div class="mode-summary-card__header">
        <span class="mode-summary-card__label">{{ label }}</span>
        <span class="mode-summary-card__value">
          {{ percent }}%
          <span class="mode-summary-card__fraction">({{ value }}/{{ total }})</span>
        </span>
      </div>
      <ProgressBar :percent="percent" :color="resolvedColor" height="6px" />
    </div>
  </button>
</template>

<script setup lang="ts">
// SHIP Mode(Sea/Rail/Air)별 요약 카드입니다. Completeness/Consistency 등 여러 Data Monitoring
// 화면에서 공통으로 쓰는 범용 컴포넌트입니다. MetricTrendCard와 같은 관례로 탭처럼 클릭해서
// 선택할 수 있고, 선택된 카드는 테두리가 primary 색으로 바뀝니다. 값 자체는 진행률 바
// (ProgressBar)로 함께 보여줍니다.
import { computed } from 'vue'
import TransportModeIcon, { type TransportMode } from '@/components/badges/TransportModeIcon.vue'
import ProgressBar from '@/components/indicators/ProgressBar.vue'

interface Props {
  mode: TransportMode
  label: string
  value: number
  total: number
  /** 진행률 바/텍스트 강조 색상. 기본은 mode에 맞는 sea/rail/air 색 */
  color?: string
  selected?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  color: undefined,
  selected: false,
})

const emit = defineEmits<{
  (e: 'click'): void
}>()

const MODE_COLORS: Record<TransportMode, string> = {
  sea: '#3cafaf',
  rail: '#1e90ff',
  air: '#7a45c6',
}

const resolvedColor = computed(() => props.color ?? MODE_COLORS[props.mode])
const percent = computed(() => (props.total ? Math.round((props.value / props.total) * 1000) / 10 : 0))
</script>

<style scoped lang="scss">
.mode-summary-card {
  display: flex;
  align-items: center;
  gap: $spacing-md;
  flex: 1;
  min-width: 260px;
  padding: $spacing-md $spacing-lg;
  border: 1px solid transparent;
  border-radius: $radius-sm;
  background: $color-bg-secondary;
  font-family: inherit;
  text-align: left;
  cursor: pointer;
  transition: border-color 0.15s ease;

  &:hover:not(&--selected) {
    border-color: $color-border;
  }

  &--selected {
    border-color: $color-primary;
  }
}

.mode-summary-card__body {
  display: flex;
  flex-direction: column;
  gap: $spacing-sm;
  min-width: 0;
  flex: 1;
}

.mode-summary-card__header {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: $spacing-sm;
}

.mode-summary-card__label {
  font-size: $font-size-base;
  font-weight: $font-weight-extrabold;
  color: $color-text;
}

.mode-summary-card__value {
  font-size: $font-size-base;
  font-weight: $font-weight-extrabold;
  color: $color-text;
  white-space: nowrap;
}

.mode-summary-card__fraction {
  margin-left: 2px;
  font-size: $font-size-xs;
  font-weight: $font-weight-normal;
  color: $color-text-muted;
}
</style>
