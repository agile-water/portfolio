<template>
  <DefaultLayout>
    <FilterBar>
      <DropdownSelect
        v-model="filters.customer"
        label="Customer"
        placeholder="Select Customer"
        :options="customerOptions"
      />
      <DropdownSelect
        v-model="filters.shipMode"
        label="SHIP Mode"
        placeholder="All"
        :options="shipModeOptions"
        :searchable="false"
        width="160px"
      />
      <DateRangeField v-model="filters.ccAta" label="C/C ATA" width="260px" />

      <template #actions>
        <SecondaryButton @click="handleReset">Reset</SecondaryButton>
        <PrimaryButton @click="handleSearch">Search</PrimaryButton>
      </template>
    </FilterBar>

    <TwoColumnSection left-width="1.4fr" right-width="1fr">
      <template #left>
        <PageSection class="eta-accuracy__on-time-card">
          <div class="eta-accuracy__on-time-header">
            <h2 class="eta-accuracy__on-time-title">On-Time Delivery</h2>
            <CompactSelect v-model="shippingLeg" :options="shippingLegOptions" width="180px" />
          </div>

          <RouteDeliveryTable
            :rows="routeRows"
            :selected-id="selectedRouteId"
            @select="handleRowSelect"
            @metric-click="handleMetricClick"
          />
        </PageSection>
      </template>

      <template #right>
        <ChartCard title="Early & On-Time Arrival Trend" unit="%">
          <BarChart :labels="trendLabels" :datasets="earlyOnTimeDatasets" reverse-stack-order />
        </ChartCard>

        <ChartCard title="Late Arrival Trend" unit="%">
          <BarChart :labels="trendLabels" :datasets="lateDatasets" />
        </ChartCard>
      </template>
    </TwoColumnSection>
  </DefaultLayout>
</template>

<script setup lang="ts">
import { computed, reactive, ref } from 'vue'

import DefaultLayout from '@/components/layouts/DefaultLayout.vue'
import PageSection from '@/components/layouts/PageSection.vue'
import TwoColumnSection from '@/components/layouts/TwoColumnSection.vue'
import FilterBar from '@/components/filters/FilterBar.vue'
import DropdownSelect from '@/components/inputs/DropdownSelect.vue'
import DateRangeField, { type DateRange } from '@/components/inputs/DateRangeField.vue'
import CompactSelect, { type CompactSelectOption } from '@/components/inputs/CompactSelect.vue'
import SecondaryButton from '@/components/buttons/SecondaryButton.vue'
import PrimaryButton from '@/components/buttons/PrimaryButton.vue'
import RouteDeliveryTable, { type RouteDeliveryRow } from '@/components/table/RouteDeliveryTable.vue'
import ChartCard from '@/components/charts/ChartCard.vue'
import BarChart, { type BarChartDataset } from '@/components/charts/BarChart.vue'

/* --------------------------------- Filters --------------------------------- */
// TODO: 실제 데이터 연동 시 옵션들을 API 응답으로 교체
const customerOptions = ['[HB] HMMA', '[HC] HMMC', '[KG] KaGA', '[KS] KaSK']
const shipModeOptions = ['All', 'Sea', 'Rail', 'Air']

const filters = reactive({
  customer: '[HC] HMMC',
  shipMode: 'All',
  ccAta: { from: new Date(2025, 7, 1), to: new Date(2026, 0, 1) } as DateRange,
})

function handleReset(): void {
  filters.customer = ''
  filters.shipMode = 'All'
  filters.ccAta = { from: null, to: null }
}

function handleSearch(): void {
  // TODO: 실제 검색 API 연동. Customer/SHIP Mode/C·C ATA 기준으로 하단 리스트·차트 갱신
  console.log('search eta accuracy', { ...filters })
}

/* ------------------------------ On-Time Delivery ------------------------------ */
// Origin Inland ~ Dest. Inland 구간(OverviewView의 ProcessFlow 단계와 동일한 구간 체계) 중
// 어느 구간의 ETA 정확도를 볼지 고르는 셀렉트입니다.
const shippingLegOptions: CompactSelectOption[] = [
  { label: 'Origin Inland', value: 'origin-inland' },
  { label: 'POL', value: 'pol' },
  { label: "Int'l Shipping", value: 'intl-shipping' },
  { label: 'POD', value: 'pod' },
  { label: 'Dest. Inland', value: 'dest-inland' },
]
const shippingLeg = ref('intl-shipping')

// TODO: 실제 데이터 연동 시 API 응답으로 교체
const routeRows: RouteDeliveryRow[] = [
  {
    id: 'busan-sea',
    route: 'KD Center Korea-BUSAN',
    mode: 'sea',
    early: 20.5,
    onTime: 45.5,
    late: 34.0,
    status: 'danger',
    containers: 5000,
    cases: 5000,
  },
  {
    id: 'busan-odcy-sea',
    route: 'KD Center Korea-(ODCY)-BUSAN',
    mode: 'sea',
    early: 15.5,
    onTime: 50.5,
    late: 34.0,
    status: 'good',
    containers: 5000,
    cases: 5000,
  },
  {
    id: 'incheon-rail',
    route: 'KD Center Korea-INCHEON',
    mode: 'rail',
    early: 15.5,
    onTime: 50.5,
    late: 89.5,
    status: 'warning',
    containers: 5000,
    cases: 5000,
  },
  {
    id: 'pudong-air',
    route: 'KD Center China-PUDONG',
    mode: 'air',
    early: 15.5,
    onTime: 50.5,
    late: 34.0,
    status: 'good',
    containers: null,
    cases: 5000,
  },
  {
    id: 'incheon-air',
    route: 'KD Center Korea-INCHEON',
    mode: 'air',
    early: 15.5,
    onTime: 50.5,
    late: 34.0,
    status: 'warning',
    containers: null,
    cases: 5000,
  },
  {
    id: 'shanghai-sea',
    route: 'KD Center China-SHANGHAI',
    mode: 'sea',
    early: 15.5,
    onTime: 50.5,
    late: 34.0,
    status: 'good',
    containers: 5000,
    cases: 5000,
  },
  {
    id: 'chengdu-rail',
    route: 'KD Center China-Chengdu',
    mode: 'rail',
    early: 15.5,
    onTime: 50.5,
    late: 34.0,
    status: 'warning',
    containers: 5000,
    cases: 5000,
  },
  {
    id: 'xian-rail',
    route: 'KD Center China-XIAN',
    mode: 'rail',
    early: 15.5,
    onTime: 50.5,
    late: 34.0,
    status: 'danger',
    containers: 5000,
    cases: 5000,
  },
  {
    id: 'guangzhou-air',
    route: 'KD Center China-Guangzhou',
    mode: 'air',
    early: 15.5,
    onTime: 50.5,
    late: 34.0,
    status: 'danger',
    containers: null,
    cases: 5000,
  },
  {
    id: 'ennore-cfs-sea',
    route: 'KD Center India-(CFS)-ENNORE',
    mode: 'sea',
    early: 15.5,
    onTime: 50.5,
    late: 34.0,
    status: 'danger',
    containers: 5000,
    cases: 5000,
  },
]

function handleMetricClick(payload: { rowId: string; metric: 'early' | 'onTime' | 'late' }): void {
  // TODO: Early/On-Time/Late 수치 클릭 시 상세(케이스 리스트 등)로 드릴다운 연동
  console.log('metric click', payload)
}

/* ---------------------------- 행 선택 ↔ 차트 연동 ---------------------------- */
// 왼쪽 리스트에서 행을 클릭하면 그 라우트의 월별 트렌드로 오른쪽 두 차트가 바뀝니다.
// 처음 진입 시에는 첫 번째 라우트가 기본 선택됩니다.
const selectedRouteId = ref(routeRows[0]?.id ?? '')

function handleRowSelect(rowId: string): void {
  selectedRouteId.value = rowId
}

/* ---------------------------------- Charts ---------------------------------- */
// TODO: 실제 데이터 연동 시 API 응답(라우트+기간 기준 월별 집계)으로 교체
const trendLabels = ['25.08', '25.09', '25.10', '25.11', '25.12', '26.01']

const ACTIVE_BLUE = '#1230c7'
const ACTIVE_CYAN = '#00c2ff'

interface RouteTrend {
  early: number[]
  onTime: number[]
  late: number[]
}

// 0~1 사이 값을 결정적으로 만들어주는 간단한 pseudo-random(사인 기반) 함수.
// 매번 랜덤하게 바뀌지 않으면서도 라우트/월마다 자연스럽게 다른 값을 만들어냅니다.
function seededRandom(seed: number): number {
  const x = Math.sin(seed) * 43758.5453
  return x - Math.floor(x)
}

function clampPercent(value: number): number {
  return Math.min(100, Math.max(0, value))
}

// 리스트에 표시된 요약 수치(base)를 기준으로, 달마다 ±amplitude 범위에서 흔들리는 시리즈를 만듭니다.
function buildMonthlySeries(seedBase: number, base: number, amplitude: number): number[] {
  return trendLabels.map((_, monthIndex) => {
    const offset = (seededRandom(seedBase + monthIndex * 7.13) - 0.5) * 2 * amplitude
    return Math.round(clampPercent(base + offset) * 10) / 10
  })
}

// 라우트별 mock 월별 트렌드 데이터. 실제로는 API에서 "라우트 + 조회기간" 기준으로 내려주는
// 월별 집계로 교체합니다.
const routeTrendData: Record<string, RouteTrend> = Object.fromEntries(
  routeRows.map((row, index) => {
    const seedBase = (index + 1) * 97
    const trend: RouteTrend = {
      early: buildMonthlySeries(seedBase, row.early, 8),
      onTime: buildMonthlySeries(seedBase + 1000, row.onTime, 12),
      late: buildMonthlySeries(seedBase + 2000, row.late, 10),
    }
    return [row.id, trend]
  }),
)

const earlyOnTimeDatasets = computed<BarChartDataset[]>(() => {
  const trend = routeTrendData[selectedRouteId.value]
  return [
    { label: 'Early', data: trend?.early ?? [], color: ACTIVE_BLUE, stack: 'trend' },
    { label: 'On-Time', data: trend?.onTime ?? [], color: ACTIVE_CYAN, stack: 'trend' },
  ]
})

const lateDatasets = computed<BarChartDataset[]>(() => {
  const trend = routeTrendData[selectedRouteId.value]
  return [{ data: trend?.late ?? [], color: ACTIVE_BLUE, stack: 'late' }]
})
</script>

<style scoped lang="scss">
// PageSection 기본 gap($spacing-lg)은 다른 화면과 공유되므로 전역을 건드리지 않고
// 이 카드(On-Time Delivery)에서만 헤더-테이블 사이 간격을 0으로 좁힙니다.
.eta-accuracy__on-time-card {
  gap: 0;
}

.eta-accuracy__on-time-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: $spacing-md;
  padding-bottom: $spacing-md;
  border-bottom: 1px solid $color-border;
}

.eta-accuracy__on-time-title {
  margin: 0;
  font-size: $font-size-lg;
  font-weight: $font-weight-extrabold;
  color: $color-text;
}
</style>
