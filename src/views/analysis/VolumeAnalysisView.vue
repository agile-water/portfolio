<template>
  <DefaultLayout>
    <FilterPanel :expanded="filtersExpanded">
      <template #row1>
        <DropdownSelect
          v-model="filters.customer"
          label="Customer"
          placeholder="Select Customer"
          :options="customerOptions"
        />
        <div class="volume-analysis__combo-field">
          <CompactSelect v-model="filters.dateType" :options="dateTypeOptions" width="120px" />
          <DateRangeField v-model="filters.dateRange" granularity="month" width="298px" />
        </div>
      </template>

      <template #actions>
        <div ref="filterTriggerRef" class="volume-analysis__filter-trigger">
          <DetailedFilterButton v-model="filtersExpanded" />

          <FilterChecklistPanel
            v-if="filtersExpanded"
            v-model="selectedModels"
            class="volume-analysis__filter-panel"
            title="Model"
            :options="modelOptions"
            search-placeholder="Search Model"
            @apply="filtersExpanded = false"
          />
        </div>
        <PrimaryButton @click="handleApply">Apply</PrimaryButton>
      </template>
    </FilterPanel>

    <!-- 1. Volume by SHIP Mode -->
    <PageSection>
      <div class="volume-analysis__section-header">
        <h2 class="volume-analysis__section-title">Volume by SHIP Mode</h2>
        <CompactSelect v-model="currencyUnit" :options="currencyOptions" width="100px" compact />
      </div>

      <TwoColumnSection left-width="minmax(280px, 1fr)" right-width="2fr" align-items="stretch">
        <template #left>
          <PageSection muted class="volume-analysis__card volume-analysis__card--fill">
            <h3 class="volume-analysis__card-title">Volume Proportion</h3>
            <DonutChart :items="shipModeItems" />
          </PageSection>
        </template>

        <template #right>
          <PageSection muted class="volume-analysis__card volume-analysis__card--fill">
            <div class="volume-analysis__card-header">
              <h3 class="volume-analysis__card-title">Volume Trend</h3>
              <CompactSelect v-model="shipModeTrendPeriod" :options="periodOptions" width="130px" compact />
            </div>
            <BarChart
              :labels="shipModeTrendLabels"
              :datasets="shipModeTrendDatasets"
              unit=""
              auto-scale
              reverse-stack-order
              :max-bar-thickness="56"
              height="280px"
            />
          </PageSection>
        </template>
      </TwoColumnSection>
    </PageSection>

    <!-- 여전히 1번 영역: SHIP Mode별 개별 트렌드 -->
    <PageSection>
      <div class="volume-analysis__section-header">
        <h2 class="volume-analysis__section-title">Volume Trend by SHIP Mode</h2>
        <CompactSelect v-model="modeTrendPeriod" :options="periodOptions" width="130px" compact />
      </div>

      <div class="volume-analysis__mode-grid">
        <PageSection v-for="mode in modeTrendCards" :key="mode.key" muted class="volume-analysis__card">
          <div class="volume-analysis__card-header">
            <h3 class="volume-analysis__card-title">{{ mode.title }}</h3>
            <CompactSelect v-model="mode.unit.value" :options="mode.unitOptions" :width="mode.unitWidth ?? '100px'" compact />
          </div>
          <BarChart
            :labels="monthLabels"
            :datasets="[{ data: mode.data, color: mode.color, mutedColor: mode.mutedColor }]"
            unit=""
            :max="500"
            :tick-step-size="100"
            height="220px"
          />
        </PageSection>
      </div>
    </PageSection>

    <!-- 2. Heatmap by POL/POD -->
    <PageSection>
      <div class="volume-analysis__section-header">
        <h2 class="volume-analysis__section-title">Heatmap by POL/POD</h2>
        <div class="volume-analysis__section-header-controls">
          <TabToggle v-model="heatmapMode" :options="heatmapModeOptions" />
          <CompactSelect v-model="heatmapUnit" :options="heatmapUnitOptions" width="100px" compact />
        </div>
      </div>

      <HeatmapGrid
        :rows="heatmapRows"
        :cols="heatmapCols"
        :cells="heatmapCellsByMode[heatmapMode]"
        :base-color="heatmapBaseColor"
      />
    </PageSection>

    <!-- 3. Volume Distribution by Carrier -->
    <PageSection>
      <h2 class="volume-analysis__section-title">Volume Distribution by Carrier</h2>

      <TwoColumnSection left-width="minmax(280px, 1fr)" right-width="2fr" align-items="stretch">
        <template #left>
          <PageSection muted class="volume-analysis__card volume-analysis__card--fill">
            <div class="volume-analysis__card-header">
              <h3 class="volume-analysis__card-title">Volume Proportion</h3>
              <span class="volume-analysis__unit-label">Unit : FEU</span>
            </div>
            <DonutChart :items="carrierItems" />
          </PageSection>
        </template>

        <template #right>
          <PageSection muted class="volume-analysis__card volume-analysis__card--fill">
            <div class="volume-analysis__card-header">
              <h3 class="volume-analysis__card-title">Monthly Volume Trend by Carrier</h3>
              <span class="volume-analysis__unit-label">Unit : FEU</span>
            </div>
            <LineChart
              :labels="carrierTrendLabels"
              :datasets="carrierTrendDatasets"
              unit=""
              :max="60000"
              :tick-step-size="20000"
              height="320px"
            />
          </PageSection>
        </template>
      </TwoColumnSection>
    </PageSection>
  </DefaultLayout>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, reactive, ref, type Ref } from 'vue'

import DefaultLayout from '@/components/layouts/DefaultLayout.vue'
import PageSection from '@/components/layouts/PageSection.vue'
import TwoColumnSection from '@/components/layouts/TwoColumnSection.vue'
import FilterPanel from '@/components/filters/FilterPanel.vue'
import FilterChecklistPanel, { type FilterChecklistOption } from '@/components/filters/FilterChecklistPanel.vue'
import DropdownSelect from '@/components/inputs/DropdownSelect.vue'
import DateRangeField, { type DateRange } from '@/components/inputs/DateRangeField.vue'
import CompactSelect, { type CompactSelectOption } from '@/components/inputs/CompactSelect.vue'
import TabToggle, { type TabToggleOption } from '@/components/tabs/TabToggle.vue'
import DetailedFilterButton from '@/components/buttons/DetailedFilterButton.vue'
import PrimaryButton from '@/components/buttons/PrimaryButton.vue'
import DonutChart, { type DonutChartItem } from '@/components/charts/DonutChart.vue'
import BarChart, { type BarChartDataset } from '@/components/charts/BarChart.vue'
import LineChart, { type LineChartDataset } from '@/components/charts/LineChart.vue'
import HeatmapGrid, { type HeatmapCell } from '@/components/charts/HeatmapGrid.vue'

import seaIcon from '@/assets/icons/sea-filled.svg?raw'
import railIcon from '@/assets/icons/rail-filled.svg?raw'
import airIcon from '@/assets/icons/air.svg?raw'

/* --------------------------------- Filters --------------------------------- */
// TODO: 실제 데이터 연동 시 옵션들을 API 응답으로 교체
const customerOptions = ['[HB] HMMA', '[HC] HMMC', '[KG] KaGA', '[KS] KaSK']
const dateTypeOptions: CompactSelectOption[] = [
  { label: 'POD ATD', value: 'pod-atd' },
  { label: 'C/C ATA', value: 'cc-ata' },
]
const currencyOptions: CompactSelectOption[] = [
  { label: 'USD', value: 'usd' },
  { label: 'KG', value: 'kg' },
  { label: 'CBM', value: 'cbm' },
]
const periodOptions: CompactSelectOption[] = [
  { label: 'Monthly', value: 'monthly' },
  { label: 'Weekly', value: 'weekly' },
]

const filters = reactive({
  customer: '[HC] HMMC',
  dateType: 'pod-atd',
  dateRange: { from: new Date(2025, 7, 1), to: new Date(2026, 0, 1) } as DateRange,
})

const filtersExpanded = ref(false)
const currencyUnit = ref('usd')

function handleApply(): void {
  // TODO: 실제 검색 API 연동. Customer/날짜 유형/기간 기준으로 화면 전체 데이터 갱신
  console.log('apply volume analysis filters', { ...filters })
}

/* --------------------------- Filters 버튼 → Model 체크리스트 팝오버 --------------------------- */
// TODO: 실제 데이터 연동 시 옵션들을 API 응답으로 교체
const modelOptions: FilterChecklistOption[] = [
  { label: 'VD', value: 'vd' },
  { label: 'EU', value: 'eu' },
  { label: 'BC', value: 'bc' },
  { label: 'DN', value: 'dn' },
  { label: 'PD', value: 'pd' },
  { label: 'CD', value: 'cd' },
  { label: 'GD', value: 'gd' },
  { label: 'JD', value: 'jd' },
]
const selectedModels = ref(modelOptions.map((option) => option.value))

const filterTriggerRef = ref<HTMLElement | null>(null)

function handleFilterTriggerOutsideClick(event: MouseEvent): void {
  if (filterTriggerRef.value && !filterTriggerRef.value.contains(event.target as Node)) {
    filtersExpanded.value = false
  }
}

onMounted(() => {
  document.addEventListener('mousedown', handleFilterTriggerOutsideClick)
})
onBeforeUnmount(() => {
  document.removeEventListener('mousedown', handleFilterTriggerOutsideClick)
})

/* -------------------------- 공통: SHIP Mode 색상 팔레트 -------------------------- */
// TransportModeIcon/StatCard와 동일한 sea/rail/air 색상 언어를 그대로 씁니다(variables.scss와 동일 값).
const SEA_COLOR = '#3cafaf'
const SEA_MUTED = '#ceebeb'
const RAIL_COLOR = '#1e90ff'
const RAIL_MUTED = '#c7e3ff'
const AIR_COLOR = '#7a45c6'
const AIR_MUTED = '#ded1f1'

// 0~1 사이 값을 결정적으로 만들어주는 간단한 pseudo-random(사인 기반) 함수.
function seededRandom(seed: number): number {
  const x = Math.sin(seed) * 43758.5453
  return x - Math.floor(x)
}

/* ------------------------------ 1. Volume by SHIP Mode ------------------------------ */
const monthLabels = ['2025-08', '2025-09', '2025-10', '2025-11', '2025-12', '2026-01']

// monthLabels와 같은 기간(2025-08-01 ~ 2026-01-01)을 주 단위(월요일 기준)로 쪼갠 라벨.
function buildWeekLabels(start: Date, end: Date): string[] {
  const labels: string[] = []
  const cursor = new Date(start)

  while (cursor < end) {
    const y = cursor.getFullYear()
    const m = String(cursor.getMonth() + 1).padStart(2, '0')
    const d = String(cursor.getDate()).padStart(2, '0')
    labels.push(`${y}-${m}-${d}`)
    cursor.setDate(cursor.getDate() + 7)
  }

  return labels
}

const weekLabels = buildWeekLabels(new Date(2025, 7, 1), new Date(2026, 0, 1))

const shipModeItems: DonutChartItem[] = [
  { label: 'SEA', value: 54282, color: SEA_COLOR },
  { label: 'RAIL', value: 27385, color: RAIL_COLOR },
  { label: 'AIR', value: 22952, color: AIR_COLOR },
]

const shipModeTrendPeriod = ref('monthly')

// SHIP Mode 물동량 trend. mutedColor를 color와 동일하게 둬서(강조/비활성 구분 없이)
// 매 구간 항상 전체 색이 그대로 보이도록 합니다.
// 100으로 정규화하지 않고, 구간마다 전체 규모(totalScale) 자체를 크게 흔들어서 막대 합계도
// 확연히 달라지도록 만듭니다(SHIP Mode 간 비중도 함께 흔들림). autoScale이 y축을 매번
// 실제 합계에 맞춰 다시 계산해줍니다.
// scale로 주 단위 값이 월 단위보다 작게 나오도록 조정하고, seedOffset으로 월간/주간이 서로
// 다른(하지만 매번 동일한) 랜덤 패턴을 갖게 합니다.
function buildShipModeTrendDatasets(labels: string[], seedOffset: number, scale = 1): BarChartDataset[] {
  const sea: number[] = []
  const rail: number[] = []
  const air: number[] = []

  labels.forEach((_, index) => {
    // 0.3 ~ 2.5배 사이에서 구간마다 전체 물동량 규모 자체가 요동치게 합니다.
    const totalScale = 0.3 + seededRandom(901 + seedOffset + index * 13.1) * 2.2

    const seaValue = 47 * scale * totalScale * (0.5 + seededRandom(51 + seedOffset + index * 17.7) * 1.0)
    const railValue = 15 * scale * totalScale * (0.5 + seededRandom(151 + seedOffset + index * 17.7) * 1.0)
    const airValue = 32 * scale * totalScale * (0.5 + seededRandom(251 + seedOffset + index * 17.7) * 1.0)

    sea.push(Math.round(seaValue))
    rail.push(Math.round(railValue))
    air.push(Math.round(airValue))
  })

  return [
    { label: 'SEA', data: sea, color: SEA_COLOR, mutedColor: SEA_COLOR, stack: 'mode' },
    { label: 'RAIL', data: rail, color: RAIL_COLOR, mutedColor: RAIL_COLOR, stack: 'mode' },
    { label: 'AIR', data: air, color: AIR_COLOR, mutedColor: AIR_COLOR, stack: 'mode' },
  ]
}

const shipModeMonthlyDatasets: BarChartDataset[] = buildShipModeTrendDatasets(monthLabels, 0, 1)
// 주 단위는 월 단위보다 물량이 작으므로(대략 월 4~5주) 스케일을 1/4 정도로 낮춥니다.
const shipModeWeeklyDatasets: BarChartDataset[] = buildShipModeTrendDatasets(weekLabels, 500, 0.25)

const shipModeTrendLabels = computed(() => (shipModeTrendPeriod.value === 'weekly' ? weekLabels : monthLabels))
const shipModeTrendDatasets = computed(() =>
  shipModeTrendPeriod.value === 'weekly' ? shipModeWeeklyDatasets : shipModeMonthlyDatasets,
)

/* ------------------------- SHIP Mode별 개별 트렌드(mini 3열) ------------------------- */
const modeTrendPeriod = ref('monthly')

function buildTrendSeries(seed: number, base: number, amplitude: number): number[] {
  return monthLabels.map((_, index) => {
    const offset = (seededRandom(seed + index * 9.31) - 0.5) * 2 * amplitude
    return Math.round(Math.max(0, base + offset))
  })
}

interface ModeTrendCard {
  key: string
  title: string
  color: string
  mutedColor: string
  data: number[]
  unit: Ref<string>
  unitOptions: CompactSelectOption[]
  /** unitOptions 드롭다운 너비. 생략하면 기본 100px */
  unitWidth?: string
}

const seaUnitOptions: CompactSelectOption[] = [
  { label: 'FEU', value: 'feu' },
  { label: 'KG', value: 'kg' },
  { label: 'CBM', value: 'cbm' },
  { label: 'USD', value: 'usd' },
]
const airUnitOptions: CompactSelectOption[] = [
  { label: 'KG(CW)', value: 'kgcw' },
  { label: 'KG', value: 'kg' },
  { label: 'CBM', value: 'cbm' },
  { label: 'USD', value: 'usd' },
  { label: '# of Cases', value: 'cases' },
]

const modeTrendCards: ModeTrendCard[] = [
  {
    key: 'sea',
    title: 'Sea',
    color: SEA_COLOR,
    mutedColor: SEA_MUTED,
    data: buildTrendSeries(11, 300, 90),
    unit: ref('feu'),
    unitOptions: seaUnitOptions,
  },
  {
    key: 'rail',
    title: 'Rail',
    color: RAIL_COLOR,
    mutedColor: RAIL_MUTED,
    data: buildTrendSeries(211, 300, 90),
    unit: ref('feu'),
    unitOptions: seaUnitOptions,
  },
  {
    key: 'air',
    title: 'Air',
    color: AIR_COLOR,
    mutedColor: AIR_MUTED,
    data: buildTrendSeries(411, 320, 90),
    unit: ref('kgcw'),
    unitOptions: airUnitOptions,
    unitWidth: '150px',
  },
]

/* ------------------------------ 2. Heatmap by POL/POD ------------------------------ */
const heatmapModeOptions: TabToggleOption[] = [
  { label: 'SEA', value: 'sea', icon: seaIcon, color: SEA_COLOR },
  { label: 'RAIL', value: 'rail', icon: railIcon, color: RAIL_COLOR },
  { label: 'AIR', value: 'air', icon: airIcon, color: AIR_COLOR },
]
const heatmapMode = ref<'sea' | 'rail' | 'air'>('sea')
const heatmapUnitOptions: CompactSelectOption[] = [
  { label: 'FEU', value: 'feu' },
  { label: 'TEU', value: 'teu' },
]
const heatmapUnit = ref('feu')

// POL(행)/POD(열)은 세 모드가 공유하고, 실제 값이 있는 조합만 모드별로 다릅니다
// (SEA는 항만, RAIL은 MALASZEWICZE, AIR는 VIENNA/WARSAWA 목적지 위주).
const heatmapRows = ['BUSAN', 'INCHEON', 'XIAN', 'SHANGHAI']
const heatmapCols = ['KOPER', 'HAMBURG', 'GDANSK', 'MALASZEWICZE', 'VIENNA', 'WARSAWA']

const heatmapCellsByMode: Record<'sea' | 'rail' | 'air', HeatmapCell[]> = {
  sea: [
    { row: 'BUSAN', col: 'KOPER', value: 850 },
    { row: 'BUSAN', col: 'HAMBURG', value: 720 },
    { row: 'BUSAN', col: 'GDANSK', value: 540 },
    { row: 'SHANGHAI', col: 'KOPER', value: 320 },
    { row: 'SHANGHAI', col: 'HAMBURG', value: 200 },
    { row: 'SHANGHAI', col: 'GDANSK', value: 320 },
  ],
  rail: [
    { row: 'INCHEON', col: 'MALASZEWICZE', value: 680 },
    { row: 'XIAN', col: 'MALASZEWICZE', value: 410 },
  ],
  air: [
    { row: 'INCHEON', col: 'VIENNA', value: 260 },
    { row: 'INCHEON', col: 'WARSAWA', value: 150 },
    { row: 'XIAN', col: 'VIENNA', value: 90 },
  ],
}

const heatmapBaseColor = computed(
  () => ({ sea: SEA_COLOR, rail: RAIL_COLOR, air: AIR_COLOR })[heatmapMode.value],
)

/* --------------------------- 3. Volume Distribution by Carrier --------------------------- */
const CARRIER_PALETTE: Record<string, string> = {
  'CMA CGM': '#3cafaf',
  Evergreen: '#1e90ff',
  Maersk: '#3d2f8f',
  'Weidong Ferry': '#e0399e',
  Others: '#7a45c6',
}

const carrierItems: DonutChartItem[] = [
  { label: 'CMA CGM', value: 54282, color: CARRIER_PALETTE['CMA CGM'] ?? SEA_COLOR },
  { label: 'Evergreen', value: 27385, color: CARRIER_PALETTE.Evergreen ?? RAIL_COLOR },
  { label: 'Maersk', value: 22952, color: CARRIER_PALETTE.Maersk ?? AIR_COLOR },
  { label: 'Weidong Ferry', value: 12462, color: CARRIER_PALETTE['Weidong Ferry'] ?? '#e0399e' },
  { label: 'Others', value: 49274, color: CARRIER_PALETTE.Others ?? AIR_COLOR },
]

const carrierTrendLabels = [...monthLabels, '2026-02']

function buildCarrierSeries(seed: number, start: number, end: number, amplitude: number): number[] {
  return carrierTrendLabels.map((_, index) => {
    const progress = index / (carrierTrendLabels.length - 1)
    const trendBase = start + (end - start) * progress
    const offset = (seededRandom(seed + index * 5.77) - 0.5) * 2 * amplitude
    return Math.round(Math.max(0, trendBase + offset))
  })
}

const carrierTrendDatasets: LineChartDataset[] = [
  { label: 'CMA CGM', data: buildCarrierSeries(31, 500, 38000, 6000), color: CARRIER_PALETTE['CMA CGM'] ?? SEA_COLOR },
  { label: 'Evergreen', data: buildCarrierSeries(131, 9000, 40000, 5000), color: CARRIER_PALETTE.Evergreen ?? RAIL_COLOR },
  { label: 'Maersk', data: buildCarrierSeries(231, 10000, 22000, 4000), color: CARRIER_PALETTE.Maersk ?? AIR_COLOR },
  {
    label: 'Weidong Ferry',
    data: buildCarrierSeries(331, 5000, 15000, 5000),
    color: CARRIER_PALETTE['Weidong Ferry'] ?? '#e0399e',
  },
  { label: 'Others', data: buildCarrierSeries(431, 2000, 20000, 4500), color: CARRIER_PALETTE.Others ?? AIR_COLOR },
]
</script>

<style scoped lang="scss">
.volume-analysis__section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: $spacing-md;
}

.volume-analysis__section-header-controls {
  display: flex;
  align-items: center;
  gap: $spacing-md;
}

.volume-analysis__section-title {
  margin: 0;
  font-size: $font-size-lg;
  font-weight: $font-weight-extrabold;
  color: $color-text;
}

.volume-analysis__card {
  gap: $spacing-md;
}

// TwoColumnSection의 align-items="stretch"로 좌우 컬럼 높이는 이미 맞춰져 있고,
// 이 카드 자신도 그 늘어난 컬럼 높이를 그대로 채워야 "카드 전체 높이"가 실제로 맞습니다.
.volume-analysis__card--fill {
  flex: 1;
}

.volume-analysis__card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: $spacing-md;
}

.volume-analysis__card-title {
  margin: 0;
  font-size: $font-size-base;
  font-weight: $font-weight-extrabold;
  color: $color-text;
}

.volume-analysis__unit-label {
  font-size: $font-size-xs;
  color: $color-text-muted;
  white-space: nowrap;
}

.volume-analysis__mode-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: $spacing-lg;
}

.volume-analysis__combo-field {
  display: flex;
  align-items: center;
  gap: $spacing-sm;
  flex-shrink: 0;
}

.volume-analysis__filter-trigger {
  position: relative;
}

.volume-analysis__filter-panel {
  position: absolute;
  top: calc(100% + $spacing-sm);
  right: 0;
  z-index: 10;
}

@media (max-width: 1100px) {
  .volume-analysis__mode-grid {
    grid-template-columns: 1fr;
  }
}
</style>
