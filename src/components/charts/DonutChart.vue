<template>
  <div class="donut-chart">
    <div class="donut-chart__ring-wrap">
      <canvas ref="canvasEl"></canvas>

      <Transition name="donut-chart__callout-fade">
        <div
          v-if="hoveredItem"
          class="donut-chart__callout"
          :style="{ left: `${calloutPosition.left}%`, top: `${calloutPosition.top}%` }"
        >
          <span class="donut-chart__callout-dot" :style="{ background: hoveredItem.color }"></span>
          {{ hoveredItem.label }}, {{ hoveredPercent }}%
        </div>
      </Transition>
    </div>

    <ul class="donut-chart__legend">
      <li v-for="item in items" :key="item.label" class="donut-chart__legend-row">
        <span class="donut-chart__legend-label">
          <span class="donut-chart__legend-dot" :style="{ background: item.color }"></span>
          {{ item.label }}
        </span>
        <span class="donut-chart__legend-value">{{ formatNumber(item.value) }}</span>
        <span class="donut-chart__legend-percent" :style="{ color: item.color }">{{ percentOf(item) }}%</span>
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
// 항목별 비율을 도넛(ring) 차트 + 하단 범례 리스트로 보여줍니다. BarChart와 동일한 관례로,
// 처음 렌더링될 때는 defaultActiveIndex 항목이 미리 선택되어 링 위에 "라벨, 비율%" 말풍선이
// 떠 있고, 다른 조각에 hover하면 그쪽으로 옮겨가며, hover가 끝나면 다시 아무것도
// 선택되지 않은 상태로 돌아갑니다. 말풍선 위치는 각 조각의 중간 각도를 직접 계산해서
// 링 바로 위(원 둘레 상)에 뜨도록 배치합니다(Chart.js 기본 툴팁 대신 커스텀 구현).
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { Chart, ArcElement, DoughnutController, type ActiveElement, type ChartEvent } from 'chart.js'

Chart.register(ArcElement, DoughnutController)

export interface DonutChartItem {
  label: string
  value: number
  color: string
}

interface Props {
  items: DonutChartItem[]
  /** 도넛 구멍 비율(작을수록 링이 두꺼워짐). 기본 '40%'(링 두께 60%) */
  cutout?: string
  /** 처음 렌더링될 때 미리 선택해서 말풍선을 띄워둘 항목 인덱스. null이면 강조 없이 시작합니다. 기본 0 */
  defaultActiveIndex?: number | null
}

const props = withDefaults(defineProps<Props>(), {
  cutout: '40%',
  defaultActiveIndex: 0,
})

const canvasEl = ref<HTMLCanvasElement | null>(null)
let chart: Chart | null = null

const hoveredIndex = ref<number | null>(props.defaultActiveIndex)

const total = computed(() => props.items.reduce((sum, item) => sum + item.value, 0))

function percentOf(item: DonutChartItem): string {
  const totalValue = total.value || 1
  return `${Math.round((item.value / totalValue) * 1000) / 10}`
}

const hoveredItem = computed(() =>
  hoveredIndex.value !== null ? (props.items[hoveredIndex.value] ?? null) : null,
)

const hoveredPercent = computed(() => (hoveredItem.value ? percentOf(hoveredItem.value) : ''))

function formatNumber(value: number): string {
  return value.toLocaleString()
}

// Chart.js의 doughnut/pie는 항상 "options.rotation - 90"을 실제 시작 각도(표준 캔버스 기준,
// 0deg=3시 방향, 시계방향이 +)로 사용합니다(라이브러리 내부 고정 동작). 아래 buildData의
// rotation:0과 반드시 같은 값을 써야 말풍선 위치가 실제 그려진 조각과 어긋나지 않습니다.
const CHART_ROTATION_OPTION = 0
const START_ANGLE_DEG = CHART_ROTATION_OPTION - 90

// hover 중인 항목의 중간 각도를 계산해서, 링 둘레(반지름 38%) 위의 좌표(%)로 변환합니다.
const calloutPosition = computed(() => {
  if (hoveredIndex.value === null) return { left: 50, top: 50 }

  const totalValue = total.value || 1
  let cumulative = 0
  for (let i = 0; i < hoveredIndex.value; i += 1) {
    cumulative += (props.items[i]?.value ?? 0) / totalValue
  }
  const sliceShare = (props.items[hoveredIndex.value]?.value ?? 0) / totalValue
  const midAngleDeg = START_ANGLE_DEG + (cumulative + sliceShare / 2) * 360
  const midAngleRad = (midAngleDeg * Math.PI) / 180

  const radiusPercent = 38
  // 해당 구간 중심 좌표에서 오른쪽 아래로 살짝 떨어진 위치에 말풍선을 띄웁니다.
  const offsetPercent = 6
  return {
    left: 50 + radiusPercent * Math.cos(midAngleRad) + offsetPercent,
    top: 50 + radiusPercent * Math.sin(midAngleRad) + offsetPercent,
  }
})

function buildData() {
  return {
    labels: props.items.map((item) => item.label),
    datasets: [
      {
        data: props.items.map((item) => item.value),
        backgroundColor: props.items.map((item) => item.color),
        borderColor: '#fff',
        borderWidth: 2,
      },
    ],
  }
}

function clearActive(): void {
  if (hoveredIndex.value === null) return
  hoveredIndex.value = null
  chart?.setActiveElements([])
  chart?.update()
}

function render(): void {
  if (!canvasEl.value) return
  chart?.destroy()
  hoveredIndex.value = props.defaultActiveIndex

  chart = new Chart(canvasEl.value, {
    type: 'doughnut',
    data: buildData(),
    options: {
      responsive: true,
      maintainAspectRatio: false,
      cutout: props.cutout,
      rotation: CHART_ROTATION_OPTION,
      circumference: 360,
      animation: { duration: 300 },
      // 말풍선은 직접 구현하므로 Chart.js 내장 툴팁/범례는 끕니다.
      plugins: { legend: { display: false }, tooltip: { enabled: false } },
      onHover: (_event: ChartEvent, elements: ActiveElement[]) => {
        if (elements.length === 0) return
        const nextIndex = elements[0]?.index ?? null
        if (nextIndex === hoveredIndex.value) return
        hoveredIndex.value = nextIndex
        chart?.update('none')
      },
    },
  })

  if (props.defaultActiveIndex !== null) {
    chart.setActiveElements([{ datasetIndex: 0, index: props.defaultActiveIndex }])
    chart.update()
  }
}

onMounted(() => {
  render()
  canvasEl.value?.addEventListener('mouseleave', clearActive)
})
onBeforeUnmount(() => {
  canvasEl.value?.removeEventListener('mouseleave', clearActive)
  chart?.destroy()
  chart = null
})

watch(() => [props.items, props.cutout, props.defaultActiveIndex], render, { deep: true })
</script>

<style scoped lang="scss">
.donut-chart {
  display: flex;
  flex-direction: column;
  gap: $spacing-lg;
}

.donut-chart__ring-wrap {
  position: relative;
  width: 100%;
  max-width: 220px;
  margin: 0 auto;
  aspect-ratio: 1 / 1;
}

.donut-chart__callout {
  position: absolute;
  display: inline-flex;
  align-items: center;
  gap: $spacing-xs;
  padding: $spacing-xs $spacing-sm;
  transform: translate(-50%, -50%);
  background: #1a1a1a;
  border-radius: $radius-full;
  white-space: nowrap;
  font-size: $font-size-xs;
  font-weight: $font-weight-bold;
  color: $color-bg;
  pointer-events: none;
}

.donut-chart__callout-dot {
  width: 8px;
  height: 8px;
  flex-shrink: 0;
  border-radius: $radius-full;
}

.donut-chart__callout-fade-enter-active,
.donut-chart__callout-fade-leave-active {
  transition: opacity 0.1s ease;
}

.donut-chart__callout-fade-enter-from,
.donut-chart__callout-fade-leave-to {
  opacity: 0;
}

.donut-chart__legend {
  display: flex;
  flex-direction: column;
  gap: $spacing-sm;
  margin: 0;
  padding: 0;
  list-style: none;
}

.donut-chart__legend-row {
  display: grid;
  grid-template-columns: 1fr auto auto;
  align-items: center;
  gap: $spacing-md;
  font-size: $font-size-sm;
}

.donut-chart__legend-label {
  display: inline-flex;
  align-items: center;
  gap: $spacing-xs;
  min-width: 0;
  color: $color-text;
  white-space: nowrap;
}

.donut-chart__legend-dot {
  width: 10px;
  height: 10px;
  flex-shrink: 0;
  border-radius: $radius-full;
}

.donut-chart__legend-value {
  color: $color-text;
  font-variant-numeric: tabular-nums;
}

.donut-chart__legend-percent {
  min-width: 44px;
  font-weight: $font-weight-extrabold;
  text-align: right;
  font-variant-numeric: tabular-nums;
}
</style>
