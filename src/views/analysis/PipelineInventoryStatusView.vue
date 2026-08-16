<template>
  <DefaultLayout title="Pipeline Inventory Status">
    <template #header-actions>
      <TabToggle v-model="metric" :options="metricOptions" segmented />
      <ExportImageButton target-id="pipeline-inventory-status-grid" />
      <IconButton :icon="settingsIcon" label="Settings" tone="muted" @click="handleSettingsClick" />
    </template>

    <FilterBar>
      <DateField
        v-model="baseDate"
        width="280px"
        :disabled-date="isNotMonday"
        :band-start="autoRangeStart"
        :band-end="autoRangeEnd"
      />

      <template #actions>
        <PrimaryButton @click="handleApply">Apply</PrimaryButton>
      </template>
    </FilterBar>

    <div id="pipeline-inventory-status-grid" class="pipeline-inventory-status__grid">
      <TwoColumnSection left-width="1fr" right-width="1fr" align-items="stretch">
        <template #left>
          <ChartCard
            :title="CUSTOMER_LABELS.hmma"
            :unit="unitLabel"
            class="pipeline-inventory-status__card pipeline-inventory-status__card--clickable"
            @click="openDetailModal('hmma')"
          >
            <StackedComboChart
              :labels="weekLabels"
              :datasets="chartDatasetsFor('hmma')"
              :line-visible="false"
            />
          </ChartCard>
        </template>

        <template #right>
          <ChartCard
            :title="CUSTOMER_LABELS.hmmc"
            :unit="unitLabel"
            class="pipeline-inventory-status__card pipeline-inventory-status__card--clickable"
            @click="openDetailModal('hmmc')"
          >
            <StackedComboChart
              :labels="weekLabels"
              :datasets="chartDatasetsFor('hmmc')"
              :line-visible="false"
            />
          </ChartCard>
        </template>
      </TwoColumnSection>

      <TwoColumnSection left-width="1fr" right-width="1fr" align-items="stretch">
        <template #left>
          <ChartCard
            :title="CUSTOMER_LABELS.kaga"
            :unit="unitLabel"
            class="pipeline-inventory-status__card pipeline-inventory-status__card--clickable"
            @click="openDetailModal('kaga')"
          >
            <StackedComboChart
              :labels="weekLabels"
              :datasets="chartDatasetsFor('kaga')"
              :line-visible="false"
            />
          </ChartCard>
        </template>

        <template #right>
          <ChartCard
            :title="CUSTOMER_LABELS.kask"
            :unit="unitLabel"
            class="pipeline-inventory-status__card pipeline-inventory-status__card--clickable"
            @click="openDetailModal('kask')"
          >
            <StackedComboChart
              :labels="weekLabels"
              :datasets="chartDatasetsFor('kask')"
              :line-visible="false"
            />
          </ChartCard>
        </template>
      </TwoColumnSection>
    </div>

    <BaseModal v-model="isDetailModalOpen" :title="activeModalTitle" width="760px">
      <PipelineStageEditTable
        :week-labels="weekLabels"
        :rows="activeModalRows"
        :unit="unitLabel"
        @update="handleStageEdit"
      />

      <template #footer>
        <SecondaryButton @click="isDetailModalOpen = false">Close</SecondaryButton>
        <PrimaryButton @click="handleConfirmEdit">Confirm</PrimaryButton>
      </template>
    </BaseModal>
  </DefaultLayout>
</template>

<script setup lang="ts">
// Open PO → KD Center → Before Onboard → In Transit → C/C, 5개 파이프라인 단계별 재고를
// 고객사(HMMA/HMMC/KaGA/KaSK)별 주간 누적 막대 + 합계 라인으로 보여주는 화면입니다.
// 상단 Days/Amount 토글로 "단계별 체류 일수" ↔ "단계별 수량(EA)" 두 관점을 전환합니다.
import { computed, reactive, ref } from 'vue'

import DefaultLayout from '@/components/layouts/DefaultLayout.vue'
import TwoColumnSection from '@/components/layouts/TwoColumnSection.vue'
import FilterBar from '@/components/filters/FilterBar.vue'
import DateField from '@/components/inputs/DateField.vue'
import PrimaryButton from '@/components/buttons/PrimaryButton.vue'
import SecondaryButton from '@/components/buttons/SecondaryButton.vue'
import ExportImageButton from '@/components/buttons/ExportImageButton.vue'
import IconButton from '@/components/buttons/IconButton.vue'
import TabToggle, { type TabToggleOption } from '@/components/tabs/TabToggle.vue'
import ChartCard from '@/components/charts/ChartCard.vue'
import StackedComboChart, { type StackedComboDataset } from '@/components/charts/StackedComboChart.vue'
import BaseModal from '@/components/modals/BaseModal.vue'
import PipelineStageEditTable, {
  type EditableStageRow,
} from '@/components/table/PipelineStageEditTable.vue'

import settingsIcon from '@/assets/icons/settings.svg?raw'

/* --------------------------------- Filters --------------------------------- */
// 기준일은 항상 월요일만 고를 수 있고(그 주의 시작), 나머지 요일은 달력에서 비활성화됩니다.
const baseDate = ref<Date | null>(new Date(2026, 2, 9)) // 2026-03-09, Monday

function isNotMonday(date: Date): boolean {
  return date.getDay() !== 1
}

function handleApply(): void {
  // TODO: 실제 검색 API 연동. 기준일(baseDate)과 그 기준으로 계산된 8주 구간(weekLabels)으로
  // 하단 4개 카드 갱신
  console.log('apply pipeline inventory status filters', { baseDate: baseDate.value, weekLabels: weekLabels.value })
}

function handleSettingsClick(): void {
  // TODO: 화면 설정(고객사 선택, 임계값 등) 패널 연동
  console.log('open pipeline inventory status settings')
}

/* --------------------------------- Days/Amount --------------------------------- */
const metricOptions: TabToggleOption[] = [
  { label: 'Days', value: 'days' },
  { label: 'Amount', value: 'amount' },
]
const metric = ref<'days' | 'amount'>('days')

const unitLabel = computed(() => (metric.value === 'days' ? 'Day' : 'EA'))
// y축은 카드마다 고정 범위를 두지 않고, 각 차트(StackedComboChart)가 실제 데이터 범위에
// 맞춰 자동으로 스케일을 계산하도록 둡니다(고객사/Days·Amount별로 값 규모가 다르므로).

/* ------------------------------ 공통 색상/시드 랜덤 ------------------------------ */
// variables.scss에 등록된 $color-pipeline-*와 동일한 값입니다(Chart.js는 JS 값이 필요해서
// SCSS 변수를 직접 못 쓰므로, 다른 화면들과 동일한 관례로 여기서 같은 값을 다시 선언해 둡니다).
const SEA_COLOR = '#3cafaf' // = $color-pipeline-open-po ($color-sea)
const RAIL_COLOR = '#1e90ff' // = $color-pipeline-before-onboard ($color-rail)
const AIR_COLOR = '#7a45c6' // = $color-pipeline-cc ($color-air)
const KD_CENTER_COLOR = '#e547e5' // = $color-pipeline-kd-center
const IN_TRANSIT_COLOR = '#4f58b5' // = $color-pipeline-in-transit

// 0~1 사이 값을 결정적으로 만들어주는 간단한 pseudo-random(사인 기반) 함수.
function seededRandom(seed: number): number {
  const x = Math.sin(seed) * 43758.5453
  return x - Math.floor(x)
}

/* ------------------------------ 파이프라인 단계 정의 ------------------------------ */
interface StageConfig {
  key: string
  label: string
  color: string
  /** Days 뷰 기준값/변동폭 */
  dayBase: number
  dayAmp: number
  /** Amount(EA) 뷰 값 = days 값 × eaPerDay(±지터) */
  eaPerDay: number
}

const STAGE_CONFIG: StageConfig[] = [
  { key: 'openPo', label: 'Open PO', color: SEA_COLOR, dayBase: 27, dayAmp: 6, eaPerDay: 18 },
  { key: 'kdCenter', label: 'KD Center', color: KD_CENTER_COLOR, dayBase: 4, dayAmp: 3, eaPerDay: 22 },
  { key: 'beforeOnboard', label: 'Before Onboard', color: RAIL_COLOR, dayBase: 6, dayAmp: 5, eaPerDay: 20 },
  { key: 'inTransit', label: 'In Transit', color: IN_TRANSIT_COLOR, dayBase: 44, dayAmp: 8, eaPerDay: 14 },
  { key: 'cc', label: 'C/C', color: AIR_COLOR, dayBase: 1.5, dayAmp: 1, eaPerDay: 26 },
]

// 기준일(월요일)의 "전주" 월요일부터 7주 더 전까지, 8개 주를 오래된 순으로 나열합니다.
// 즉 기준일이 속한 주는 포함하지 않고, 그 직전 주부터 과거 8주가 자동 선택됩니다.
// (예: 3/9 선택 → 3/2(전주)부터 7주 더 전인 1/12까지, 총 8주)
const WEEK_COUNT = 8

function buildPastMondays(baseMonday: Date, count: number): Date[] {
  // 기준일 자신의 주는 제외하고, 그 전주를 가장 최근 주로 삼습니다.
  const mostRecentMonday = new Date(baseMonday)
  mostRecentMonday.setDate(mostRecentMonday.getDate() - 7)

  return Array.from({ length: count }, (_, index) => {
    const date = new Date(mostRecentMonday)
    date.setDate(date.getDate() - (count - 1 - index) * 7)
    return date
  })
}

// ISO-8601 주차 계산(목요일이 속한 연도를 그 주의 연도로 봄). '26 W12"처럼 라벨을 만듭니다.
function getIsoWeekLabel(date: Date): string {
  const target = new Date(date.getFullYear(), date.getMonth(), date.getDate())
  const dayNumber = (target.getDay() + 6) % 7 // 월=0 ... 일=6
  target.setDate(target.getDate() - dayNumber + 3) // 그 주의 목요일로 이동

  const firstThursday = new Date(target.getFullYear(), 0, 4)
  const firstDayNumber = (firstThursday.getDay() + 6) % 7
  firstThursday.setDate(firstThursday.getDate() - firstDayNumber + 3)

  const weekNumber = 1 + Math.round((target.getTime() - firstThursday.getTime()) / (7 * 86400000))
  const yy = String(target.getFullYear()).slice(-2)
  return `'${yy} W${String(weekNumber).padStart(2, '0')}`
}

const DEFAULT_BASE_DATE = new Date(2026, 2, 9)

const weekMondays = computed(() => buildPastMondays(baseDate.value ?? DEFAULT_BASE_DATE, WEEK_COUNT))
const weekLabels = computed(() => weekMondays.value.map(getIsoWeekLabel))

// 달력 UI에도 "자동 선택된 8주 구간"을 옅은 밴드로 보여주기 위한 시작/끝 날짜.
// 끝은 가장 최근 주(전주)의 일요일까지로 잡아서, 기준일(월요일) 바로 앞날까지 꽉 채웁니다.
const autoRangeStart = computed<Date | null>(() => weekMondays.value[0] ?? null)
const autoRangeEnd = computed<Date | null>(() => {
  const mostRecentMonday = weekMondays.value[weekMondays.value.length - 1]
  if (!mostRecentMonday) return null
  const sunday = new Date(mostRecentMonday)
  sunday.setDate(sunday.getDate() + 6)
  return sunday
})

type CustomerKey = 'hmma' | 'hmmc' | 'kaga' | 'kask'

const CUSTOMER_LABELS: Record<CustomerKey, string> = {
  hmma: 'Company A',
  hmmc: 'Company B',
  kaga: 'Company C',
  kask: 'Company D',
}

const CUSTOMER_SEED_BASE: Record<CustomerKey, number> = {
  hmma: 100,
  hmmc: 300,
  kaga: 500,
  kask: 700,
}

interface StageSeries {
  key: string
  label: string
  color: string
  day: number[]
  amount: number[]
}

// 고객사 + 단계 조합마다 결정적으로 다른(그러나 매번 동일한) 주간 시리즈를 만듭니다.
function buildStageSeries(customerSeedBase: number, stageIndex: number, stage: StageConfig): StageSeries {
  const seedBase = customerSeedBase + stageIndex * 37

  const day = Array.from({ length: WEEK_COUNT }, (_, weekIndex) => {
    const offset = (seededRandom(seedBase + weekIndex * 8.3) - 0.5) * 2 * stage.dayAmp
    return Math.max(1, Math.round(stage.dayBase + offset))
  })

  const amount = day.map((dayValue, weekIndex) => {
    const jitter = 1 + (seededRandom(seedBase + 500 + weekIndex * 5.1) - 0.5) * 0.2
    return Math.max(1, Math.round(dayValue * stage.eaPerDay * jitter))
  })

  return { key: stage.key, label: stage.label, color: stage.color, day, amount }
}

// reactive로 감싸서, 모달의 편집 표(PipelineStageEditTable)에서 값을 바꾸면 그 값을 그대로
// 쓰는 차트(chartDatasetsFor)도 자동으로 다시 그려지도록 합니다.
const customerStageSeries = reactive<Record<CustomerKey, StageSeries[]>>({
  hmma: STAGE_CONFIG.map((stage, index) => buildStageSeries(CUSTOMER_SEED_BASE.hmma, index, stage)),
  hmmc: STAGE_CONFIG.map((stage, index) => buildStageSeries(CUSTOMER_SEED_BASE.hmmc, index, stage)),
  kaga: STAGE_CONFIG.map((stage, index) => buildStageSeries(CUSTOMER_SEED_BASE.kaga, index, stage)),
  kask: STAGE_CONFIG.map((stage, index) => buildStageSeries(CUSTOMER_SEED_BASE.kask, index, stage)),
})

function chartDatasetsFor(customer: CustomerKey): StackedComboDataset[] {
  return customerStageSeries[customer].map((series) => ({
    label: series.label,
    color: series.color,
    data: metric.value === 'days' ? series.day : series.amount,
  }))
}

/* ------------------------------ 상세 편집 모달 ------------------------------ */
// 카드를 클릭하면 그 고객사의 단계별(주간) 수치를 직접 고칠 수 있는 표가 모달로 뜹니다.
// 표는 지금 화면에 보이는 단위(Days/Amount)에 맞는 배열을 그대로 가리키므로, 셀 값을
// 바꾸면 customerStageSeries(reactive)가 바뀌고 카드의 누적 막대도 즉시 갱신됩니다.
const activeModalCustomer = ref<CustomerKey | null>(null)

const isDetailModalOpen = computed({
  get: () => activeModalCustomer.value !== null,
  set: (open: boolean) => {
    if (!open) activeModalCustomer.value = null
  },
})

function openDetailModal(customer: CustomerKey): void {
  activeModalCustomer.value = customer
}

const activeModalTitle = computed(() =>
  activeModalCustomer.value ? CUSTOMER_LABELS[activeModalCustomer.value] : '',
)

const activeModalRows = computed<EditableStageRow[]>(() => {
  const customer = activeModalCustomer.value
  if (!customer) return []
  return customerStageSeries[customer].map((series) => ({
    key: series.key,
    label: series.label,
    color: series.color,
    values: metric.value === 'days' ? series.day : series.amount,
  }))
})

function handleStageEdit(payload: { rowKey: string; weekIndex: number; value: number }): void {
  const customer = activeModalCustomer.value
  if (!customer) return
  const series = customerStageSeries[customer].find((item) => item.key === payload.rowKey)
  if (!series) return
  const target = metric.value === 'days' ? series.day : series.amount
  target[payload.weekIndex] = payload.value
}

function handleConfirmEdit(): void {
  const customer = activeModalCustomer.value
  if (!customer) return
  // TODO: 실제 저장 API 연동. 지금은 값이 이미 customerStageSeries(reactive)에 반영돼
  // 차트에 바로 보이는 상태라, Confirm은 그 값을 서버에 확정 저장하고 모달을 닫는 역할입니다.
  console.log('confirm pipeline inventory edit', { customer, rows: customerStageSeries[customer] })
  isDetailModalOpen.value = false
}
</script>

<style scoped lang="scss">
.pipeline-inventory-status__grid {
  display: flex;
  flex-direction: column;
  gap: $spacing-lg;
}

.pipeline-inventory-status__card {
  flex: 1;
}

.pipeline-inventory-status__card--clickable {
  cursor: pointer;
  transition:
    box-shadow 0.15s ease,
    border-color 0.15s ease;

  &:hover {
    box-shadow: $shadow-elevated;
  }
}
</style>
