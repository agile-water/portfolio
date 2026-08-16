<template>
  <div class="stacked-combo-chart">
    <div class="stacked-combo-chart__canvas-wrap" :style="{ height }">
      <canvas ref="canvasEl"></canvas>
    </div>

    <ul class="stacked-combo-chart__legend">
      <li v-for="dataset in datasets" :key="dataset.label" class="stacked-combo-chart__legend-item">
        <span class="stacked-combo-chart__legend-dot" :style="{ background: dataset.color }"></span>
        {{ dataset.label }}
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
// 누적 막대(단계별 구성) + 합계 라인을 한 차트에 겹쳐 그리는 조합 차트입니다.
// BarChart/LineChart와 달리 hover 툴팁 대신, 막대 구간 안/라인 포인트 위에 값을 항상
// 텍스트로 그려 넣습니다(Pipeline Inventory Status처럼 매 구간 값을 한눈에 봐야 하는 화면용).
// 값 라벨과 선택적 기준선(threshold line/band)은 별도 npm 패키지 없이 Chart.js의
// 커스텀 플러그인(afterDatasetsDraw/afterDraw)으로 직접 캔버스에 그립니다.
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { BarController, BarElement, CategoryScale, Chart, LinearScale, type ChartData, type ChartOptions, type Plugin } from 'chart.js'

Chart.register(BarController, BarElement, CategoryScale, LinearScale)

const LABEL_FONT_FAMILY = "'Pretendard', sans-serif"

export interface StackedComboDataset {
  /** 범례 및 라벨에 쓰이는 계열 이름(예: 'Open PO') */
  label: string
  data: number[]
  color: string
}

export interface StackedComboThresholdLine {
  value: number
  color: string
  /** 선 오른쪽 끝에 표시할 텍스트. 생략하면 라벨을 그리지 않습니다. */
  label?: string
  /** 기본 true(점선). false면 실선. */
  dashed?: boolean
}

interface Props {
  labels: string[]
  /** 아래(축과 가까운 쪽)부터 위 순서로 쌓이는 구간별 계열 */
  datasets: StackedComboDataset[]
  /** 막대 위에 겹쳐 그릴 합계 라인 값. 생략하면 datasets 값의 합을 매 구간마다 계산해서 씁니다. */
  lineData?: number[]
  lineColor?: string
  /** 값/라벨 뒤에 붙는 단위 텍스트 */
  unit?: string
  /** y축 최댓값. 생략하면 Chart.js가 데이터 범위에 맞춰 자동 계산 */
  max?: number
  tickStepSize?: number
  /** 상/하한 기준선 1~2개(예: 안전재고 상한). 값마다 오른쪽 끝에 라벨을 그릴 수 있습니다. */
  thresholdLines?: StackedComboThresholdLine[]
  /** 두 기준선 사이를 옅게 칠한 밴드(예: 안전재고 권장 범위) */
  thresholdBand?: { from: number; to: number; color?: string }
  /** 차트 영역 높이(CSS 값). 기본 '320px' */
  height?: string
  /**
   * 막대 구간의 최소 픽셀 높이. 값이 작아서 실제 계산된 높이가 이보다 낮으면 이 높이로
   * 끌어올려 그려서, 안의 값 라벨이 안 보이는 문제를 막습니다(Chart.js의 minBarLength).
   * 기본 14(11px 라벨 글자 + 여백이 겨우 들어가는 정도). 0으로 주면 끄기.
   */
  minSegmentHeight?: number
  /** false면 합계 라인의 선/포인트를 그리지 않고 숨깁니다(라벨은 그대로 표시). 기본 true */
  lineVisible?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  lineData: undefined,
  lineColor: '#ff8a00',
  unit: '',
  max: undefined,
  tickStepSize: undefined,
  thresholdLines: undefined,
  thresholdBand: undefined,
  height: '320px',
  minSegmentHeight: 14,
  lineVisible: true,
})

const canvasEl = ref<HTMLCanvasElement | null>(null)
let chart: Chart | null = null

function formatValue(value: number): string {
  return `${Math.round(value)}${props.unit}`
}

function resolvedLineData(): number[] {
  if (props.lineData) return props.lineData
  return props.labels.map((_, index) =>
    props.datasets.reduce((sum, dataset) => sum + (dataset.data[index] ?? 0), 0),
  )
}

// 합계 라인은 Chart.js의 'line' 데이터셋을 쓰지 않고, 아래 valueLabelsPlugin 안에서 막대
// 구간 좌표를 직접 읽어 캔버스에 그립니다(포인트를 "맨 위 구간의 중간"에 찍기 위해).
// Chart.js 기본 라인 렌더링은 라인 값(=합계) 자체를 y축에 그대로 매핑하기 때문에 항상
// 스택 맨 위 "경계"에 찍히고, 구간 중간으로 옮길 수 없습니다.
function buildData(): ChartData {
  return {
    labels: props.labels,
    datasets: props.datasets.map((dataset) => ({
      type: 'bar' as const,
      label: dataset.label,
      data: dataset.data,
      stack: 'pipeline',
      backgroundColor: dataset.color,
      borderRadius: 0,
      maxBarThickness: 40,
      minBarLength: props.minSegmentHeight || undefined,
    })),
  }
}

interface BarSegmentProps {
  x: number
  y: number
  base: number
}

function getBarSegmentProps(chartInstance: Chart, datasetIndex: number, index: number): BarSegmentProps | null {
  const element = chartInstance.getDatasetMeta(datasetIndex).data[index]
  if (!element) return null
  return element.getProps(['x', 'y', 'base'], true) as BarSegmentProps
}

// 각 구간(주)마다 "맨 위에 실제로 보이는(값 > 0) 막대 구간"을 datasets 배열의 뒤쪽부터
// 찾습니다(배열 뒤쪽 = 스택 위쪽). 합계 라인의 포인트를 그 구간 한가운데에 찍기 위함입니다.
function topVisibleSegment(chartInstance: Chart, index: number): BarSegmentProps | null {
  for (let datasetIndex = props.datasets.length - 1; datasetIndex >= 0; datasetIndex -= 1) {
    if ((props.datasets[datasetIndex]?.data[index] ?? 0) > 0) {
      return getBarSegmentProps(chartInstance, datasetIndex, index)
    }
  }
  // 그 주는 모든 구간이 0이면, 맨 아래 축(0) 위치를 그대로 씁니다.
  return getBarSegmentProps(chartInstance, 0, index)
}

// 막대 구간 안에는 흰 글씨로 자기 값을 그려 넣고, 그 위에 "합계" 라인을 직접 그립니다.
// (hover 툴팁 대신 상시 라벨 표시 — 이 화면은 매 구간의 수치를 한눈에 비교하는 게 목적)
// 라인은 Chart.js 라인 데이터셋을 쓰지 않고 커스텀으로 그리는데, 포인트를 "맨 위 구간의
// 값(=합계) 위치"가 아니라 "맨 위 구간의 세로 중앙"에 찍어 달라는 요청 때문입니다.
// 단, 합계 숫자 라벨은 포인트를 따라가지 않고 그 주의 스택 맨 꼭대기 위에 그려서, 포인트가
// 구간 중앙으로 내려와도 그 구간 자체의 값 라벨과 겹치지 않게 합니다.
const valueLabelsPlugin: Plugin = {
  id: 'stackedComboValueLabels',
  afterDatasetsDraw(chartInstance) {
    const { ctx } = chartInstance
    ctx.save()
    ctx.textAlign = 'center'

    // 1) 막대 구간 안 값 라벨
    props.datasets.forEach((dataset, datasetIndex) => {
      const meta = chartInstance.getDatasetMeta(datasetIndex)
      if (meta.hidden) return

      dataset.data.forEach((value, index) => {
        if (!value) return
        const segment = getBarSegmentProps(chartInstance, datasetIndex, index)
        if (!segment) return
        ctx.fillStyle = '#ffffff'
        ctx.font = `700 11px ${LABEL_FONT_FAMILY}`
        ctx.textBaseline = 'middle'
        ctx.fillText(formatValue(value), segment.x, (segment.y + segment.base) / 2)
      })
    })

    // 2) 합계 라인: 포인트는 맨 위 구간의 중앙, 라벨은 그 주 스택의 꼭대기 위
    const totals = resolvedLineData()
    const points = props.labels.map((_, index) => {
      const topSegment = topVisibleSegment(chartInstance, index)
      const stackTop = getStackTopY(chartInstance, index)
      return {
        x: topSegment?.x ?? 0,
        pointY: topSegment ? (topSegment.y + topSegment.base) / 2 : 0,
        labelY: stackTop,
      }
    })

    if (points.length) {
      // lineVisible=false면 선/포인트는 그리지 않고, 합계 라벨만 그대로 남깁니다.
      if (props.lineVisible) {
        ctx.beginPath()
        ctx.strokeStyle = props.lineColor
        ctx.lineWidth = 2
        points.forEach((point, index) => {
          if (index === 0) ctx.moveTo(point.x, point.pointY)
          else ctx.lineTo(point.x, point.pointY)
        })
        ctx.stroke()

        points.forEach((point) => {
          ctx.beginPath()
          ctx.fillStyle = props.lineColor
          ctx.arc(point.x, point.pointY, 3, 0, Math.PI * 2)
          ctx.fill()
        })
      }

      points.forEach((point, index) => {
        ctx.fillStyle = '#1a1a1a'
        ctx.font = `700 12px ${LABEL_FONT_FAMILY}`
        ctx.textAlign = 'center'
        ctx.textBaseline = 'bottom'
        ctx.fillText(formatValue(totals[index] ?? 0), point.x, point.labelY - 8)
      })
    }

    ctx.restore()
  },
}

// 그 주 스택의 맨 꼭대기(가장 위 구간의 top) y좌표. 모든 구간이 0이면 0값 위치(base)를 씁니다.
function getStackTopY(chartInstance: Chart, index: number): number {
  for (let datasetIndex = props.datasets.length - 1; datasetIndex >= 0; datasetIndex -= 1) {
    if ((props.datasets[datasetIndex]?.data[index] ?? 0) > 0) {
      return getBarSegmentProps(chartInstance, datasetIndex, index)?.y ?? 0
    }
  }
  return getBarSegmentProps(chartInstance, 0, index)?.base ?? 0
}

// 기준선(threshold line)과 그 사이 밴드를 y축 값 기준으로 계산해서 그립니다.
const thresholdPlugin: Plugin = {
  id: 'stackedComboThresholds',
  afterDraw(chartInstance) {
    if (!props.thresholdLines?.length && !props.thresholdBand) return
    const { ctx, chartArea, scales } = chartInstance
    const yScale = scales.y
    if (!yScale) return

    ctx.save()

    if (props.thresholdBand) {
      const yFrom = yScale.getPixelForValue(props.thresholdBand.from)
      const yTo = yScale.getPixelForValue(props.thresholdBand.to)
      ctx.fillStyle = props.thresholdBand.color ?? 'rgba(0, 138, 30, 0.1)'
      ctx.fillRect(chartArea.left, Math.min(yFrom, yTo), chartArea.right - chartArea.left, Math.abs(yTo - yFrom))
    }

    props.thresholdLines?.forEach((line) => {
      const y = yScale.getPixelForValue(line.value)
      ctx.beginPath()
      ctx.setLineDash(line.dashed === false ? [] : [4, 4])
      ctx.strokeStyle = line.color
      ctx.lineWidth = 1.5
      ctx.moveTo(chartArea.left, y)
      ctx.lineTo(chartArea.right, y)
      ctx.stroke()
      ctx.setLineDash([])

      if (line.label) {
        ctx.fillStyle = line.color
        ctx.font = `700 11px ${LABEL_FONT_FAMILY}`
        ctx.textAlign = 'left'
        ctx.textBaseline = 'middle'
        ctx.fillText(line.label, chartArea.right + 6, y)
      }
    })

    ctx.restore()
  },
}

// 기준선/밴드 값 중 가장 큰 값. max를 따로 안 주면(자동 스케일) 이 값을 suggestedMax로
// 넘겨서, 데이터가 적어 축이 낮게 잡히더라도 기준선이 차트 밖으로 잘리지 않게 합니다.
function highestThresholdValue(): number | undefined {
  const values = [
    ...(props.thresholdLines?.map((line) => line.value) ?? []),
    ...(props.thresholdBand ? [props.thresholdBand.from, props.thresholdBand.to] : []),
  ]
  return values.length ? Math.max(...values) : undefined
}

// 막대 총합(=라인 값)의 실제 최댓값. 라인 포인트/총합 라벨이 축의 맨 꼭대기에 바짝 붙어
// 맨 위 구간 라벨과 겹치지 않도록, 이 값보다 축을 더 높게 잡을 때 기준으로 씁니다.
function dataMaxValue(): number {
  const stackTotals = props.labels.map((_, index) =>
    props.datasets.reduce((sum, dataset) => sum + (dataset.data[index] ?? 0), 0),
  )
  return Math.max(0, ...stackTotals, ...resolvedLineData())
}

function buildOptions(): ChartOptions {
  const hasRightLabels = !!(props.thresholdLines?.some((line) => line.label) ?? false)

  // 자동 스케일일 때는 실제 데이터 최댓값보다 15% 여유를 두고, 기준선이 그보다 더 높으면
  // 기준선 값을 우선합니다. 그래야 라인의 총합 라벨이 축 꼭대기에 붙어 맨 위 막대 구간
  // 라벨과 겹치는 일 없이, 라인이 그려질 공간이 항상 확보됩니다.
  const suggestedMax =
    props.max === undefined ? Math.max(dataMaxValue() * 1.15, highestThresholdValue() ?? 0) : undefined

  return {
    responsive: true,
    maintainAspectRatio: false,
    animation: { duration: 300 },
    layout: {
      // top을 넉넉히 둬서 라인 위 총합 라벨이 카드 경계에 잘리지 않게 합니다.
      padding: { right: hasRightLabels ? 34 : 4, top: 32 },
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
        // max를 명시적으로 안 주면 Chart.js가 실제 데이터 범위에 맞춰("nice number" 간격으로)
        // 자동으로 계산합니다. 카드마다 값 규모가 다를 수 있는 이 화면(Days/Amount 토글,
        // 고객사별 물량 차이)에 적합합니다.
        max: props.max,
        suggestedMax,
        ticks: {
          stepSize: props.tickStepSize,
          color: '#9aa0a8',
          font: { size: 12 },
        },
        grid: { color: '#eef0f2' },
      },
    },
    plugins: {
      legend: { display: false },
      tooltip: { enabled: false },
    },
  }
}

function render(): void {
  if (!canvasEl.value) return
  chart?.destroy()
  chart = new Chart(canvasEl.value, {
    type: 'bar',
    data: buildData(),
    options: buildOptions(),
    plugins: [valueLabelsPlugin, thresholdPlugin],
  })
}

onMounted(render)
onBeforeUnmount(() => {
  chart?.destroy()
  chart = null
})

watch(
  () => [
    props.labels,
    props.datasets,
    props.lineData,
    props.max,
    props.tickStepSize,
    props.thresholdLines,
    props.thresholdBand,
    props.unit,
    props.minSegmentHeight,
    props.lineVisible,
  ],
  render,
  { deep: true },
)
</script>

<style scoped lang="scss">
.stacked-combo-chart {
  display: flex;
  flex-direction: column;
  gap: $spacing-md;
  width: 100%;
}

.stacked-combo-chart__canvas-wrap {
  position: relative;
  width: 100%;
}

.stacked-combo-chart__legend {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  gap: $spacing-md;
  margin: 0;
  padding: 0;
  list-style: none;
}

.stacked-combo-chart__legend-item {
  display: inline-flex;
  align-items: center;
  gap: $spacing-xs;
  font-size: $font-size-sm;
  color: $color-text;
  white-space: nowrap;
}

.stacked-combo-chart__legend-dot {
  width: 10px;
  height: 10px;
  flex-shrink: 0;
  border-radius: $radius-full;
}
</style>
