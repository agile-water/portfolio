<template>
  <div class="gauge-chart" :style="{ width }">
    <svg viewBox="0 0 200 110" class="gauge-chart__svg">
      <path class="gauge-chart__track" d="M20 100 A 80 80 0 0 1 180 100" pathLength="100" />
      <path
        class="gauge-chart__value"
        d="M20 100 A 80 80 0 0 1 180 100"
        pathLength="100"
        :style="{ strokeDashoffset: 100 - percent, stroke: color }"
      />
      <text x="100" y="92" text-anchor="middle" class="gauge-chart__label">{{ Math.round(percent) }}%</text>
    </svg>
  </div>
</template>

<script setup lang="ts">
// 값 하나를 반원 게이지로 보여줍니다. Chart.js의 doughnut으로 반원을 만들면 차트 영역이
// 항상 "완전한 원"의 바운딩 박스로 계산돼 아래쪽에 빈 여백이 크게 남는 문제가 있어서,
// hover/툴팁이 필요 없는 이 용도는 가벼운 SVG로 직접 그렸습니다.
// SVG2의 pathLength="100" 속성으로 실제 호의 길이를 신경 쓰지 않고 0~100 값을 그대로
// stroke-dashoffset에 써서 퍼센트를 표현합니다.
import { computed } from 'vue'

interface Props {
  value: number
  max?: number
  /** 값 호(arc)의 색상. 기본 $color-primary와 동일한 값 */
  color?: string
  /** 게이지 너비(CSS 값). 기본 200px (SVG viewBox와 같은 비율 유지) */
  width?: string
}

const props = withDefaults(defineProps<Props>(), {
  max: 100,
  color: '#007aff',
  width: '200px',
})

const percent = computed(() => {
  if (!props.max) return 0
  return Math.min(100, Math.max(0, (props.value / props.max) * 100))
})
</script>

<style scoped lang="scss">
.gauge-chart {
  flex-shrink: 0;
}

.gauge-chart__svg {
  display: block;
  width: 100%;
  height: auto;
}

.gauge-chart__track {
  fill: none;
  stroke: $color-bg-muted;
  stroke-width: 16;
  stroke-linecap: round;
}

.gauge-chart__value {
  fill: none;
  stroke-width: 16;
  stroke-linecap: round;
  stroke-dasharray: 100;
  transition: stroke-dashoffset 0.3s ease;
}

.gauge-chart__label {
  font-size: 30px;
  font-weight: $font-weight-extrabold;
  fill: $color-text;
}
</style>
