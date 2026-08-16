<template>
  <div class="location-lead-time-bar">
    <div class="location-lead-time-bar__legend">
      <span v-for="segment in segments" :key="segment.label" class="location-lead-time-bar__legend-item">
        <span class="location-lead-time-bar__legend-dot" :style="{ background: segment.color }"></span>
        {{ segment.label }}
      </span>
    </div>

    <div class="location-lead-time-bar__row">
      <div class="location-lead-time-bar__track-wrap" :style="{ height }">
        <div class="location-lead-time-bar__track">
          <div
            v-for="(layout, index) in segmentLayout"
            :key="layout.segment.label"
            class="location-lead-time-bar__segment"
            :style="{ width: `${layout.widthPercent}%`, background: layout.segment.color }"
            @mouseenter="hoveredIndex = index"
            @mouseleave="hoveredIndex = null"
          >
            {{ formatValue(layout.segment.value) }}
          </div>
        </div>

        <Transition name="location-lead-time-bar__tooltip-fade">
          <div
            v-if="hoveredLayout"
            class="location-lead-time-bar__tooltip"
            :style="{ left: `${hoveredLayout.leftPercent + hoveredLayout.widthPercent / 2}%` }"
          >
            <div class="location-lead-time-bar__tooltip-title">
              {{ hoveredLayout.segment.tooltipLabel ?? hoveredLayout.segment.label }}
            </div>
          </div>
        </Transition>
      </div>

      <span class="location-lead-time-bar__total">{{ formatValue(resolvedTotal) }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
// 구간(Origin Inland/POL/Int'l Shipping/POD/Dest. Inland)별 평균 리드타임을 하나의
// 누적 가로 막대로 보여줍니다. 각 구간은 값(value) 비율만큼 너비를 차지하고, 그 안에
// 자기 값을 표시합니다. 막대 오른쪽에는 전체 합계를 별도로 표시합니다.
// 각 구간에 마우스를 올리면 BarChart(Chart.js)의 다크 툴팁과 같은 스타일로
// 이름/값을 보여주는 툴팁이 막대 위에 뜹니다. 아래 트렌드 차트(BarChart)와 동일하게,
// 처음 렌더링될 때는 defaultActiveIndex 구간이 미리 선택되어 툴팁이 떠 있고,
// hover가 끝나면(막대 밖으로 나가면) 다시 아무것도 선택되지 않은 상태로 돌아갑니다.
import { computed, ref, watch } from 'vue'

export interface LocationLeadTimeSegment {
  /** 범례에 표시되는 구간 이름(예: 'Origin Inland') */
  label: string
  value: number
  color: string
  /** 툴팁에 표시할 텍스트. 생략하면 label을 그대로 씁니다(예: 실제 지점명 'BUSAN-KOPER'). */
  tooltipLabel?: string
}

interface Props {
  segments: LocationLeadTimeSegment[]
  /** 값 뒤에 붙는 단위. 기본 없음 */
  unit?: string
  /** 합계를 직접 지정하고 싶을 때. 생략하면 segments 값의 합을 사용합니다. */
  total?: number
  /** 막대 높이(CSS 값). 옆에 나란히 오는 다른 차트 카드와 전체 카드 높이를 맞출 때 씁니다. 기본 '48px' */
  height?: string
  /** 처음 렌더링될 때 미리 선택해서 툴팁을 띄워둘 구간 인덱스. null이면 강조 없이 시작합니다. 기본 0 */
  defaultActiveIndex?: number | null
}

const props = withDefaults(defineProps<Props>(), {
  unit: '',
  total: undefined,
  height: '48px',
  defaultActiveIndex: 0,
})

const hoveredIndex = ref<number | null>(props.defaultActiveIndex)

// segments가 통째로 바뀌면(예: 다른 route 선택) 다시 기본 구간이 선택된 상태로 되돌립니다.
watch(
  () => props.segments,
  () => {
    hoveredIndex.value = props.defaultActiveIndex
  },
)

const resolvedTotal = computed(() =>
  props.total ?? props.segments.reduce((sum, segment) => sum + segment.value, 0),
)

// 각 구간이 전체 막대에서 차지하는 폭(%)과 시작 위치(%)를 미리 계산해둡니다.
// 이 값을 막대 폭(width)에도, 툴팁의 가로 위치(left)를 그 구간 가운데에 맞추는 데도 그대로 씁니다.
const segmentLayout = computed(() => {
  const total = resolvedTotal.value || 1
  let cursor = 0
  return props.segments.map((segment) => {
    const widthPercent = (segment.value / total) * 100
    const leftPercent = cursor
    cursor += widthPercent
    return { segment, widthPercent, leftPercent }
  })
})

const hoveredLayout = computed(() =>
  hoveredIndex.value !== null ? (segmentLayout.value[hoveredIndex.value] ?? null) : null,
)

function formatValue(value: number): string {
  return `${Math.round(value * 10) / 10}${props.unit}`
}
</script>

<style scoped lang="scss">
.location-lead-time-bar {
  display: flex;
  flex-direction: column;
  gap: $spacing-md;
}

.location-lead-time-bar__legend {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  min-height: 24px;
  gap: $spacing-md;
}

.location-lead-time-bar__legend-item {
  display: inline-flex;
  align-items: center;
  gap: $spacing-xs;
  font-size: $font-size-sm;
  color: $color-text;
  white-space: nowrap;
}

.location-lead-time-bar__legend-dot {
  width: 10px;
  height: 10px;
  flex-shrink: 0;
  border-radius: $radius-full;
}

.location-lead-time-bar__row {
  display: flex;
  align-items: center;
  gap: $spacing-md;
}

// 상하 마진($spacing-lg)만큼 자리를 띄우고, 실제 막대 높이(height prop)는 이 안에서
// 꽉 채웁니다. 툴팁은 이 wrap 기준으로 위치를 잡아서 막대 바로 위에 뜨게 합니다.
.location-lead-time-bar__track-wrap {
  position: relative;
  flex: 1;
  min-width: 0;
  margin: $spacing-lg 0;
}

.location-lead-time-bar__track {
  display: flex;
  width: 100%;
  height: 100%;
  overflow: hidden;
  border-radius: $radius-sm;
}

.location-lead-time-bar__segment {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  min-width: 0;
  overflow: hidden;
  font-size: $font-size-sm;
  font-weight: $font-weight-bold;
  color: $color-bg;
  white-space: nowrap;
  cursor: pointer;

  &:not(:last-child) {
    border-right: 1px solid rgba(255, 255, 255, 0.35);
  }
}

// BarChart(Chart.js)의 다크 라운드 툴팁과 동일한 톤(#1a1a1a, radius 8px, padding 12px)으로
// 맞춘 커스텀 툴팁. 해당 구간의 가로 중앙(left) 위, 막대 바로 위(bottom: 100%)에 띄웁니다.
.location-lead-time-bar__tooltip {
  position: absolute;
  bottom: calc(100% + 8px);
  z-index: 5;
  padding: 12px;
  background: #1a1a1a;
  border-radius: 8px;
  white-space: nowrap;
  pointer-events: none;
  transform: translateX(-50%);
}

.location-lead-time-bar__tooltip-title {
  font-size: 16px;
  font-weight: $font-weight-bold;
  color: $color-bg;
}

.location-lead-time-bar__tooltip-fade-enter-active,
.location-lead-time-bar__tooltip-fade-leave-active {
  transition: opacity 0.1s ease;
}

.location-lead-time-bar__tooltip-fade-enter-from,
.location-lead-time-bar__tooltip-fade-leave-to {
  opacity: 0;
}

.location-lead-time-bar__total {
  flex-shrink: 0;
  font-size: $font-size-lg;
  font-weight: $font-weight-extrabold;
  color: $color-text;
}
</style>
