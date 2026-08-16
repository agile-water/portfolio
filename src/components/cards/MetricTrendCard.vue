<template>
  <button
    type="button"
    role="tab"
    class="metric-trend-card"
    :class="{ 'metric-trend-card--selected': selected }"
    :aria-selected="selected"
    @click="emit('click')"
  >
    <div class="metric-trend-card__info">
      <p class="metric-trend-card__label">{{ label }}</p>
      <p class="metric-trend-card__value">
        {{ value }}<span v-if="unit" class="metric-trend-card__unit">{{ unit }}</span>
      </p>
      <p
        v-if="trend"
        class="metric-trend-card__trend"
        :class="`metric-trend-card__trend--${trend.direction}`"
      >
        <span class="metric-trend-card__trend-icon" v-html="trendIcon"></span>
        {{ trend.text }}
      </p>
    </div>

    <span class="metric-trend-card__badge" :class="`metric-trend-card__badge--${variant}`">
      <span class="metric-trend-card__badge-icon" v-html="icon"></span>
    </span>
  </button>
</template>

<script setup lang="ts">
// StatCard와 달리 값 변화 추이(전주 대비 증감)를 함께 보여주고, 탭처럼 클릭해서
// 선택할 수 있는 요약 카드입니다. 선택된 카드는 테두리가 primary 색으로 바뀝니다.
// 색상은 StatCard와 동일한 sea/rail/air 팔레트를 재사용합니다.
import { computed } from 'vue'
import trendingUpIcon from '@/assets/icons/trending-up.svg?raw'
import trendingDownIcon from '@/assets/icons/trending-down.svg?raw'

export type MetricTrendCardVariant = 'sea' | 'rail' | 'air'

export interface MetricTrend {
  direction: 'up' | 'down'
  /** 예: "+89 vs Last week" */
  text: string
}

interface Props {
  label: string
  icon: string
  value: string | number
  unit?: string
  variant?: MetricTrendCardVariant
  trend?: MetricTrend
  /** 선택된 카드 여부. 테두리를 강조색(primary)으로 표시합니다. */
  selected?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  unit: '',
  variant: 'sea',
  trend: undefined,
  selected: false,
})

const emit = defineEmits<{
  (e: 'click'): void
}>()

const trendIcon = computed(() => (props.trend?.direction === 'down' ? trendingDownIcon : trendingUpIcon))
</script>

<style scoped lang="scss">
.metric-trend-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: $spacing-lg;
  flex: 1;
  min-width: 260px;
  padding: $spacing-lg;
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

.metric-trend-card__label {
  margin: 0 0 6px;
  font-size: $font-size-sm;
  color: $color-text-muted;
}

.metric-trend-card__value {
  margin: 0;
  font-size: $font-size-2xl;
  font-weight: $font-weight-extrabold;
  color: $color-text;
}

.metric-trend-card__unit {
  margin-left: 6px;
  font-size: $font-size-base;
  font-weight: $font-weight-bold;
  color: $color-text-muted;
}

.metric-trend-card__trend {
  display: flex;
  align-items: center;
  gap: 4px;
  margin: 6px 0 0;
  font-size: $font-size-sm;
  font-weight: $font-weight-bold;

  &--up {
    color: #1a9c5b;
  }

  &--down {
    color: #e5484d;
  }
}

.metric-trend-card__trend-icon {
  display: flex;
  width: 14px;
  height: 14px;
}

.metric-trend-card__badge {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 56px;
  height: 56px;
  flex-shrink: 0;
  border-radius: $radius-full;
  color: $color-bg;

  &--sea {
    background: $color-sea;
  }

  &--rail {
    background: $color-rail;
  }

  &--air {
    background: $color-air;
  }
}

.metric-trend-card__badge-icon {
  display: flex;
  width: 26px;
  height: 26px;
}
</style>
