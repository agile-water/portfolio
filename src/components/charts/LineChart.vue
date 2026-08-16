<template>
  <div class="line-chart-group">
    <div class="line-chart" :style="{ height }">
      <canvas ref="canvasEl"></canvas>
    </div>

    <ul class="line-chart__legend">
      <li v-for="dataset in datasets" :key="dataset.label" class="line-chart__legend-item">
        <span class="line-chart__legend-dot" :style="{ background: dataset.color }"></span>
        {{ dataset.label }}
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
// Chart.js(꺾은선 차트) 얇은 래퍼 컴포넌트입니다. BarChart/DonutChart와 동일한 관례로,
// 처음 렌더링될 때는 defaultActive 포인트가 미리 선택되어 "계열명 : 값" 형태의 단일 툴팁이
// 떠 있고, 가장 가까운 포인트에 hover하면 그쪽으로 옮겨가며, hover가 끝나면(차트 밖으로
// 나가면) 다시 아무것도 선택되지 않은 상태로 돌아갑니다. 범례는 차트 아래 별도로 그립니다.
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
import {
  Chart,
  LineController,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  type ActiveElement,
  type ChartData,
  type ChartEvent,
  type ChartOptions,
  type TooltipItem,
} from 'chart.js'

Chart.register(LineController, LineElement, PointElement, CategoryScale, LinearScale, Tooltip)

export interface LineChartDataset {
  label: string
  data: number[]
  color: string
}

interface ActivePoint {
  datasetIndex: number
  index: number
}

interface Props {
  labels: string[]
  datasets: LineChartDataset[]
  /** 값/툴팁 뒤에 붙는 단위 텍스트. 기본 없음 */
  unit?: string
  /** y축 최댓값. 생략하면 데이터 최댓값 기준으로 Chart.js가 자동 계산합니다. */
  max?: number
  /** y축 눈금 간격 */
  tickStepSize?: number
  /** 차트 영역 높이(CSS 값). 기본 '240px' */
  height?: string
  /** 처음 렌더링될 때 미리 선택해서 툴팁을 띄워둘 포인트. null이면 강조 없이 시작합니다. 기본 첫 계열의 첫 포인트 */
  defaultActive?: ActivePoint | null
}

const props = withDefaults(defineProps<Props>(), {
  unit: '',
  max: undefined,
  tickStepSize: undefined,
  height: '240px',
  defaultActive: () => ({ datasetIndex: 0, index: 0 }),
})

const canvasEl = ref<HTMLCanvasElement | null>(null)
let chart: Chart | null = null
let activePoint: ActivePoint | null = props.defaultActive

function formatValue(value: number): string {
  return `${value.toLocaleString()}${props.unit}`
}

function buildData(): ChartData<'line'> {
  return {
    labels: props.labels,
    datasets: props.datasets.map((dataset) => ({
      label: dataset.label,
      data: dataset.data,
      borderColor: dataset.color,
      backgroundColor: dataset.color,
      pointBackgroundColor: dataset.color,
      pointBorderColor: '#fff',
      pointBorderWidth: 2,
      pointRadius: 5,
      pointHoverRadius: 6,
      borderWidth: 2,
      tension: 0.35,
      fill: false,
    })),
  }
}

function buildOptions(): ChartOptions<'line'> {
  return {
    responsive: true,
    maintainAspectRatio: false,
    animation: { duration: 300 },
    interaction: { mode: 'nearest', intersect: false },
    // 실제 hover 중인 포인트에 맞춰 툴팁을 옮깁니다. 차트 밖으로 나가면(mouseleave)
    // BarChart와 동일하게 아무것도 선택되지 않은 상태로 돌아갑니다(아래 clearActive 참고).
    onHover: (_event: ChartEvent, elements: ActiveElement[]) => {
      if (elements.length === 0) return
      const first = elements[0]
      if (!first) return
      const next: ActivePoint = { datasetIndex: first.datasetIndex, index: first.index }
      if (activePoint && activePoint.datasetIndex === next.datasetIndex && activePoint.index === next.index) return
      activePoint = next
      chart?.update('none')
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: '#9aa0a8', font: { size: 12 } },
      },
      y: {
        min: 0,
        max: props.max,
        ticks: { stepSize: props.tickStepSize, color: '#9aa0a8', font: { size: 12 } },
        grid: { color: '#eef0f2' },
      },
    },
    plugins: {
      legend: { display: false },
      tooltip: {
        mode: 'nearest',
        intersect: false,
        displayColors: false,
        backgroundColor: '#1a1a1a',
        cornerRadius: 8,
        padding: 12,
        titleFont: { size: 14, weight: 'bold' },
        bodyFont: { size: 12 },
        callbacks: {
          title: (items: TooltipItem<'line'>[]) => {
            const first = items[0]
            if (!first) return ''
            return `${first.dataset.label ?? ''} : ${formatValue(first.parsed.y ?? 0)}`
          },
          label: () => '',
        },
      },
    },
  }
}

// 지정한 포인트의 툴팁을 강제로 열어둡니다. hover 없이도 기본 포인트 수치가 보이게(마운트 시) 씁니다.
function showTooltipFor(point: ActivePoint | null): void {
  if (!chart || !point) return
  chart.setActiveElements([point])
  chart.tooltip?.setActiveElements([point], { x: 0, y: 0 })
  chart.update()
}

function clearActive(): void {
  if (activePoint === null) return
  activePoint = null
  chart?.setActiveElements([])
  chart?.tooltip?.setActiveElements([], { x: 0, y: 0 })
  chart?.update()
}

function render(): void {
  if (!canvasEl.value) return
  chart?.destroy()
  activePoint = props.defaultActive
  chart = new Chart(canvasEl.value, {
    type: 'line',
    data: buildData(),
    options: buildOptions(),
  })
  showTooltipFor(props.defaultActive)
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

watch(
  () => [props.labels, props.datasets, props.max, props.tickStepSize, props.unit, props.defaultActive],
  render,
  { deep: true },
)
</script>

<style scoped lang="scss">
.line-chart-group {
  display: flex;
  flex-direction: column;
  gap: $spacing-md;
  width: 100%;
  // 카드가 옆 컬럼(예: 도넛 차트 카드)에 맞춰 늘어나 있을 때, 차트+범례 묶음이 남는
  // 세로 공간을 위/아래에 똑같이 나눠 가지도록(가운데 정렬) auto 마진을 씁니다.
  margin-top: auto;
  margin-bottom: auto;
}

.line-chart {
  position: relative;
  width: 100%;
}

.line-chart__legend {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  gap: $spacing-md;
  margin: 0;
  padding: 0;
  list-style: none;
}

.line-chart__legend-item {
  display: inline-flex;
  align-items: center;
  gap: $spacing-xs;
  font-size: $font-size-sm;
  color: $color-text;
  white-space: nowrap;
}

.line-chart__legend-dot {
  width: 10px;
  height: 10px;
  flex-shrink: 0;
  border-radius: $radius-full;
}
</style>
