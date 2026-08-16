<template>
  <div class="bar-chart" :style="{ height }">
    <canvas ref="canvasEl"></canvas>
  </div>
</template>

<script setup lang="ts">
// Chart.js(막대 차트) 얇은 래퍼 컴포넌트입니다.
// - 여러 dataset을 같은 stack 값으로 넘기면 누적 막대(stacked bar)가 됩니다.
// - 각 dataset은 "강조 색상(color)"과 "비활성 색상(mutedColor)"을 가지며, 그 순간 활성화된
//   막대 하나만 강조 색으로 그려지고 나머지는 모두 muted 색으로 그려집니다(동시에 두 개가
//   강조되지 않도록 활성 인덱스를 하나만 유지합니다).
//   처음엔 defaultActiveIndex가 활성 상태로 시작하고, 다른 막대에 hover하면 그쪽으로 활성이
//   옮겨가면서 이전 막대는 자동으로 비활성(muted)이 됩니다. hover가 끝나면 다시
//   defaultActiveIndex로 돌아갑니다.
// - 툴팁은 다크 라운드 박스 스타일로 공통 커스터마이징되어 있습니다.
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
import {
  Chart,
  BarController,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  type ActiveElement,
  type ChartData,
  type ChartEvent,
  type ChartOptions,
  type ScriptableContext,
  type TooltipItem,
} from 'chart.js'

Chart.register(BarController, BarElement, CategoryScale, LinearScale, Tooltip)

export interface BarChartDataset {
  /** 툴팁에 표시할 계열 이름. dataset이 2개 이상일 때(스택형) 사용합니다. */
  label?: string
  data: number[]
  /** 강조(활성) 상태일 때 막대 색상 */
  color: string
  /** 비활성 상태일 때 막대 색상. 생략하면 옅은 파란색을 사용합니다. */
  mutedColor?: string
  /** 같은 stack 값을 가진 dataset끼리 쌓여서 하나의 막대로 그려집니다. */
  stack?: string
}

interface Props {
  labels: string[]
  datasets: BarChartDataset[]
  /** 값/툴팁 뒤에 붙는 단위 텍스트. 기본 '%' */
  unit?: string
  /** y축 최댓값. 기본 100. autoScale이 true면 무시됩니다. */
  max?: number
  /** y축 눈금 간격. 생략하면 max/4 (눈금 5개)를 씁니다. autoScale이 true면 무시됩니다. */
  tickStepSize?: number
  /**
   * true면 max/tickStepSize를 고정하지 않고, 실제 데이터 범위에 맞춰 Chart.js가
   * 눈금을 자동으로("nice number" 간격으로) 계산하게 둡니다. 데이터 규모가 화면마다
   * 달라질 수 있는 차트(예: 합계가 매번 달라지는 누적 막대)에 적합합니다. 기본 false
   */
  autoScale?: boolean
  /** 차트 영역 높이(CSS 값). 기본 '240px' */
  height?: string
  /** 막대 최대 두께(px). 기본 32 */
  maxBarThickness?: number
  /** 처음 렌더링될 때 강조 표시하고 툴팁을 미리 띄워둘 막대 인덱스. null이면 강조 없이 시작합니다. 기본 0 */
  defaultActiveIndex?: number | null
  /** 툴팁 굵은 글씨(제목) 값을 직접 지정하고 싶을 때. 생략하면 같은 인덱스의 dataset 값 합계를 사용합니다. */
  totals?: number[]
  /**
   * 누적 막대의 시각적 쌓임 순서만 datasets 배열의 반대로 그립니다(막대 안에서 어느 계열이
   * 위/아래에 오는지). 툴팁에 표시되는 계열 순서는 이 값과 무관하게 항상 datasets prop
   * 순서를 그대로 따릅니다.
   */
  reverseStackOrder?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  unit: '%',
  max: 100,
  tickStepSize: undefined,
  autoScale: false,
  height: '240px',
  maxBarThickness: 32,
  defaultActiveIndex: 0,
  totals: undefined,
  reverseStackOrder: false,
})

const DEFAULT_MUTED_COLOR = '#c7d6ef'
const DEFAULT_STACK = 'default'

const canvasEl = ref<HTMLCanvasElement | null>(null)
let chart: Chart | null = null

// 지금 강조(활성) 상태인 막대 인덱스. Vue 반응형이 아니라 차트를 직접 다시 그릴 때만
// 참조하는 값이라 일반 변수로 둡니다.
let activeIndex: number | null = props.defaultActiveIndex

function formatValue(value: number): string {
  return `${value}${props.unit}`
}

function barColor(dataset: BarChartDataset, ctx: ScriptableContext<'bar'>): string {
  const isActive = activeIndex !== null && ctx.dataIndex === activeIndex
  return isActive ? dataset.color : (dataset.mutedColor ?? DEFAULT_MUTED_COLOR)
}

function buildData(): ChartData<'bar'> {
  // 누적 막대는 datasets 배열의 앞쪽이 아래(축과 가까운 쪽), 뒤쪽이 위에 그려집니다.
  // reverseStackOrder가 true면 이 배열만 뒤집어서 쌓이는 위치를 반대로 만들되,
  // 각 dataset 객체 자체(label 등)는 그대로 재사용하므로 툴팁 순서에는 영향을 주지 않습니다.
  const orderedDatasets = props.reverseStackOrder ? [...props.datasets].reverse() : props.datasets

  return {
    labels: props.labels,
    datasets: orderedDatasets.map((dataset) => ({
      label: dataset.label,
      data: dataset.data,
      stack: dataset.stack ?? DEFAULT_STACK,
      borderRadius: 4,
      maxBarThickness: props.maxBarThickness,
      backgroundColor: (ctx: ScriptableContext<'bar'>) => barColor(dataset, ctx),
      hoverBackgroundColor: dataset.color,
    })),
  }
}

function buildOptions(): ChartOptions<'bar'> {
  const isSingleSeries = props.datasets.length === 1

  return {
    responsive: true,
    maintainAspectRatio: false,
    animation: { duration: 300 },
    interaction: { mode: 'index', intersect: false },
    // 실제 마우스 hover에 맞춰 활성 막대를 옮깁니다(hover-out으로 인한 해제는
    // Chart.js의 onHover가 아니라 canvas의 mouseleave 이벤트로 별도 처리합니다.
    // 아래 clearActive 참고 — mode:'index' 상태에서 onHover만으로는 마우스가
    // 차트를 완전히 벗어난 순간을 놓치는 경우가 있었습니다).
    onHover: (_event: ChartEvent, elements: ActiveElement[]) => {
      if (elements.length === 0) return
      const nextIndex = elements[0]?.index ?? null
      if (nextIndex === activeIndex) return
      activeIndex = nextIndex
      chart?.update('none')
    },
    scales: {
      x: {
        stacked: true,
        grid: { display: false },
        ticks: { color: '#9aa0a8', font: { size: 12 } },
      },
      y: {
        stacked: true,
        min: 0,
        // autoScale이면 max/눈금 간격을 아예 지정하지 않아, Chart.js가 실제 데이터 범위에
        // 맞는 "nice number" 최댓값/간격을 알아서 계산합니다.
        max: props.autoScale ? undefined : props.max,
        ticks: {
          stepSize: props.autoScale ? undefined : (props.tickStepSize ?? props.max / 4),
          color: '#9aa0a8',
          font: { size: 12 },
        },
        grid: { color: '#eef0f2' },
      },
    },
    plugins: {
      legend: { display: false },
      tooltip: {
        mode: 'index',
        intersect: false,
        backgroundColor: '#1a1a1a',
        cornerRadius: 8,
        padding: 12,
        displayColors: !isSingleSeries,
        boxWidth: 10,
        boxHeight: 10,
        boxPadding: 4,
        titleFont: { size: 16, weight: 'bold' },
        titleMarginBottom: isSingleSeries ? 0 : 8,
        bodyFont: { size: 12 },
        bodySpacing: 4,
        // 툴팁에 표시되는 계열 순서는 막대의 시각적 쌓임 순서(reverseStackOrder)와 무관하게
        // 항상 datasets prop에 넘겨준 순서를 그대로 따르도록 고정합니다.
        itemSort: (a: TooltipItem<'bar'>, b: TooltipItem<'bar'>) => {
          const order = props.datasets.map((dataset) => dataset.label)
          return order.indexOf(a.dataset.label ?? '') - order.indexOf(b.dataset.label ?? '')
        },
        callbacks: {
          title: (items: TooltipItem<'bar'>[]) => {
            const first = items[0]
            if (!first) return ''
            if (props.totals) return formatValue(props.totals[first.dataIndex] ?? 0)
            if (isSingleSeries) return formatValue(first.parsed.y ?? 0)
            const sum = items.reduce((acc, item) => acc + (item.parsed.y ?? 0), 0)
            return formatValue(Math.round(sum * 10) / 10)
          },
          label: (item: TooltipItem<'bar'>) => {
            if (isSingleSeries) return ''
            return `${item.dataset.label ?? ''} : ${formatValue(item.parsed.y ?? 0)}`
          },
        },
      },
    },
  }
}

// index 막대의 툴팁을 강제로 열어둡니다. hover 없이도 기본 막대의 수치가 보이게 하거나
// (마운트 시), hover가 끝나 기본 막대로 복귀할 때 툴팁도 같이 되돌리는 데 씁니다.
function showTooltipFor(index: number | null): void {
  if (!chart || index === null) return

  // active element는 실제 Chart.js data.datasets 배열(쌓임 순서, reverseStackOrder 반영)의
  // 인덱스를 기준으로 지정해야 하므로 props.datasets 개수만큼만 만들면 됩니다(내용은 순서
  // 무관하게 전부 활성화하는 것이라 값 자체는 order에 영향받지 않습니다).
  const elements = props.datasets.map((_, datasetIndex) => ({ datasetIndex, index }))

  chart.setActiveElements(elements)
  chart.tooltip?.setActiveElements(elements, { x: 0, y: 0 })
  chart.update()
}

// 마우스가 차트(canvas) 밖으로 완전히 나갔을 때 강조 막대 + 툴팁을 모두 지웁니다.
// Chart.js의 onHover(elements=[])에만 의존하면 mode:'index' 설정 때문에 간헐적으로
// 해제 이벤트를 놓치는 경우가 있어, 브라우저 네이티브 mouseleave를 별도로 사용해
// 확실하게 처리합니다.
function clearActive(): void {
  if (activeIndex === null) return
  activeIndex = null
  chart?.setActiveElements([])
  chart?.tooltip?.setActiveElements([], { x: 0, y: 0 })
  chart?.update()
}

function render(): void {
  if (!canvasEl.value) return
  chart?.destroy()
  activeIndex = props.defaultActiveIndex
  chart = new Chart(canvasEl.value, {
    type: 'bar',
    data: buildData(),
    options: buildOptions(),
  })
  showTooltipFor(props.defaultActiveIndex)
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
  () => [
    props.labels,
    props.datasets,
    props.max,
    props.tickStepSize,
    props.autoScale,
    props.unit,
    props.maxBarThickness,
    props.defaultActiveIndex,
    props.totals,
  ],
  render,
  { deep: true },
)
</script>

<style scoped lang="scss">
.bar-chart {
  position: relative;
  width: 100%;
}
</style>
