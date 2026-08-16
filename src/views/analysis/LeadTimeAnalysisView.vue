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
      <DateRangeField v-model="filters.ccAta" label="C/C ATA" granularity="month" width="220px" />
      <DropdownSelect
        v-model="filters.linkNode"
        label="Link/Node"
        placeholder="All"
        :options="linkNodeOptions"
        :searchable="false"
        width="160px"
      />

      <template #actions>
        <SecondaryButton @click="handleReset">Reset</SecondaryButton>
        <PrimaryButton @click="handleSearch">Search</PrimaryButton>
      </template>
    </FilterBar>

    <TwoColumnSection left-width="1.4fr" right-width="1fr">
      <template #left>
        <PageSection class="lead-time-analysis__table-card">
          <div class="lead-time-analysis__table-header">
            <h2 class="lead-time-analysis__table-title">Lead Time by Route</h2>
          </div>

          <LeadTimeRouteTable :rows="routeRows" :selected-id="selectedRouteId" @select="handleRowSelect" />
        </PageSection>
      </template>

      <template #right>
        <!--
          두 차트 카드는 세로로 나란히 쌓이므로(플렉스 방향), 아래 BarChart의 고정 높이(240px)에
          맞춰 위 막대(LocationLeadTimeBar) 쪽 높이를 조정해서 카드 두 개의 전체 높이를 맞춥니다.
          두 카드 모두 헤더(제목+단위) 마크업과 PageSection 패딩/간격이 동일하므로, 실제로
          맞춰야 하는 건 "헤더 아래 콘텐츠 높이"뿐입니다: 아래 카드는 BarChart 240px 그대로,
          위 카드는 범례(24px) + 카드 내부 간격(16px) + 막대 상하 마진($spacing-lg 24px×2) +
          막대 높이를 합쳐 240px이 되도록 막대 높이를 152px로 지정했습니다.
        -->
        <ChartCard title="Avg. Lead Time by Location" unit="Day">
          <LocationLeadTimeBar :segments="legSegments" height="152px" />
        </ChartCard>

        <ChartCard title="Avg. Lead Time Trend" unit="Day">
          <BarChart :labels="trendLabels" :datasets="trendDatasets" unit="" height="240px" />
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
import SecondaryButton from '@/components/buttons/SecondaryButton.vue'
import PrimaryButton from '@/components/buttons/PrimaryButton.vue'
import LeadTimeRouteTable, { type LeadTimeRouteRow } from '@/components/table/LeadTimeRouteTable.vue'
import ChartCard from '@/components/charts/ChartCard.vue'
import LocationLeadTimeBar, { type LocationLeadTimeSegment } from '@/components/charts/LocationLeadTimeBar.vue'
import BarChart, { type BarChartDataset } from '@/components/charts/BarChart.vue'

/* --------------------------------- Filters --------------------------------- */
// TODO: 실제 데이터 연동 시 옵션들을 API 응답으로 교체
const customerOptions = ['[HB] HMMA', '[HC] HMMC', '[KG] KaGA', '[KS] KaSK']
const shipModeOptions = ['All', 'Sea', 'Rail', 'Air']
const linkNodeOptions = ['All', 'Node', 'Link']

const filters = reactive({
  customer: '[HC] HMMC',
  shipMode: 'All',
  ccAta: { from: new Date(2025, 7, 1), to: new Date(2026, 0, 1) } as DateRange,
  linkNode: 'All',
})

function handleReset(): void {
  filters.customer = ''
  filters.shipMode = 'All'
  filters.ccAta = { from: null, to: null }
  filters.linkNode = 'All'
}

function handleSearch(): void {
  // TODO: 실제 검색 API 연동. Customer/SHIP Mode/C·C ATA(월)/Link·Node 기준으로 하단 리스트·차트 갱신
  console.log('search lead time analysis', { ...filters })
}

/* -------------------------------- Route 리스트 -------------------------------- */
// TODO: 실제 데이터 연동 시 API 응답으로 교체
const routeRows: LeadTimeRouteRow[] = [
  {
    id: 'busan-koper-sea',
    route: 'KD Center Korea-BUSAN-KOPER-HMMC',
    mode: 'sea',
    min: 45.0,
    avg: 56.8,
    max: 75.0,
    containers: 800,
    cases: 2000,
  },
  {
    id: 'hongkong-koper-sea',
    route: 'KD Center China-HONGKONG-KOPER-HMMC',
    mode: 'sea',
    min: 60.0,
    avg: 70.0,
    max: 80.0,
    containers: 640,
    cases: 1600,
  },
  {
    id: 'shanghai-koper-sea',
    route: 'KD Center China-SHANGHAI-KOPER-HMMC',
    mode: 'sea',
    min: 60.0,
    avg: 70.0,
    max: 80.0,
    containers: 300,
    cases: 1200,
  },
  {
    id: 'ennore-hamburg-sea',
    route: 'KD Center India-ENNORE-HAMBURG-HMMC',
    mode: 'sea',
    min: 60.0,
    avg: 70.0,
    max: 80.0,
    containers: 200,
    cases: 800,
  },
  {
    id: 'incheon-malaszewicze-rail',
    route: 'KD Center Korea-INCHEON-MALASZEWICZE-HMMC',
    mode: 'rail',
    min: 60.0,
    avg: 70.0,
    max: 80.0,
    containers: 200,
    cases: 800,
  },
  {
    id: 'chengdu-malaszewicze-rail',
    route: 'KD Center China-Chengdu-MALASZEWICZE-HMMC',
    mode: 'rail',
    min: 60.0,
    avg: 70.0,
    max: 80.0,
    containers: 100,
    cases: 400,
  },
  {
    id: 'incheon-vienna-air',
    route: 'KD Center Korea-INCHEON-VIENNA-HMMC',
    mode: 'air',
    min: 60.0,
    avg: 70.0,
    max: 80.0,
    containers: null,
    cases: 100,
  },
  {
    id: 'incheon-warsaw-air',
    route: 'KD Center Korea-INCHEON-WARSAW-HMMC',
    mode: 'air',
    min: 60.0,
    avg: 70.0,
    max: 80.0,
    containers: null,
    cases: 50,
  },
  {
    id: 'guangzhou-vienna-air',
    route: 'KD Center China-Guangzhou-VIENNA-HMMC',
    mode: 'air',
    min: 60.0,
    avg: 70.0,
    max: 80.0,
    containers: null,
    cases: 50,
  },
  {
    id: 'pudong-vienna-air',
    route: 'KD Center China-PUDONG-VIENNA-HMMC',
    mode: 'air',
    min: 60.0,
    avg: 70.0,
    max: 80.0,
    containers: null,
    cases: 50,
  },
]

/* ---------------------------- 행 선택 ↔ 우측 패널 연동 ---------------------------- */
// 왼쪽 리스트에서 행을 클릭하면 그 라우트의 "구간별 리드타임 breakdown"과 "월별 트렌드"로
// 오른쪽 두 패널이 바뀝니다. 처음 진입 시에는 첫 번째 라우트가 기본 선택됩니다.
const selectedRouteId = ref(routeRows[0]?.id ?? '')

function handleRowSelect(rowId: string): void {
  selectedRouteId.value = rowId
}

/* ---------------------------------- Charts ---------------------------------- */
// TODO: 실제 데이터 연동 시 API 응답(라우트+기간 기준 구간별/월별 집계)으로 교체
const trendLabels = ['25.08', '25.09', '25.10', '25.11', '25.12', '26.01']

const ACTIVE_BLUE = '#1230c7'

const LEG_LABELS = ['Origin Inland', 'POL', "Int'l Shipping", 'POD', 'Dest. Inland']
// 옅은 파랑 → 짙은 남색 순서의 5단계 팔레트. Int'l Shipping 구간이 리드타임 대부분을 차지합니다.
const LEG_COLORS = ['#cfe0fb', '#8fb6f3', '#3366cc', '#1a3b91', '#0a1f52']
const LEG_WEIGHTS = [0.12, 0.1, 0.62, 0.12, 0.04]

// 0~1 사이 값을 결정적으로 만들어주는 간단한 pseudo-random(사인 기반) 함수.
// 매번 랜덤하게 바뀌지 않으면서도 라우트/구간마다 자연스럽게 다른 값을 만들어냅니다.
function seededRandom(seed: number): number {
  const x = Math.sin(seed) * 43758.5453
  return x - Math.floor(x)
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value))
}

// 리스트에 표시된 평균값(avg)을 기준으로, 달마다 ±amplitude 범위에서 흔들리는 시리즈를 만듭니다.
function buildMonthlySeries(seedBase: number, base: number, amplitude: number): number[] {
  return trendLabels.map((_, monthIndex) => {
    const offset = (seededRandom(seedBase + monthIndex * 7.13) - 0.5) * 2 * amplitude
    return Math.round(clamp(base + offset, 0, 100) * 10) / 10
  })
}

// route 문자열("KD Center Korea-BUSAN-KOPER-HMMC")을 '-'로 나눈 4개 지점
// [출발지, POL, POD, 도착지]을 이용해, 5개 구간의 툴팁 문구를 만듭니다.
// 규칙: 1번째=출발지-POL, 2번째=POL, 3번째=POL-POD, 4번째=POD, 5번째=POD-도착지.
function buildRouteLegTooltipLabels(route: string): string[] {
  const points = route.split('-').map((point) => point.trim())
  const origin = points[0] ?? ''
  const pol = points[1] ?? ''
  const pod = points[2] ?? ''
  const dest = points[3] ?? ''

  return [`${origin}-${pol}`, pol, `${pol}-${pod}`, pod, `${pod}-${dest}`]
}

// avg(평균 리드타임)를 5개 구간 비중(LEG_WEIGHTS)에 따라 나눠서, 구간 값의 합이 avg와
// 정확히 일치하도록 만듭니다(반올림 오차는 마지막 구간에서 보정).
function buildLegBreakdown(seedBase: number, avg: number, route: string): LocationLeadTimeSegment[] {
  const jittered = LEG_WEIGHTS.map((weight, index) => {
    const jitter = (seededRandom(seedBase + index * 11.7) - 0.5) * 0.08
    return Math.max(0.02, weight + jitter)
  })
  const weightSum = jittered.reduce((sum, weight) => sum + weight, 0)
  const rounded = jittered.map((weight) => Math.round(((weight / weightSum) * avg) * 10) / 10)

  const roundedSum = rounded.reduce((sum, value) => sum + value, 0)
  const lastIndex = rounded.length - 1
  const last = rounded[lastIndex] ?? 0
  rounded[lastIndex] = Math.max(0, Math.round((last + (avg - roundedSum)) * 10) / 10)

  const tooltipLabels = buildRouteLegTooltipLabels(route)

  return LEG_LABELS.map((label, index) => ({
    label,
    value: rounded[index] ?? 0,
    color: LEG_COLORS[index] ?? ACTIVE_BLUE,
    tooltipLabel: tooltipLabels[index] ?? label,
  }))
}

interface RouteInsights {
  legs: LocationLeadTimeSegment[]
  trend: number[]
}

// 라우트별 mock 구간 breakdown + 월별 트렌드. 실제로는 API에서 "라우트 + 조회기간" 기준으로
// 내려주는 집계 데이터로 교체합니다.
const routeInsights: Record<string, RouteInsights> = Object.fromEntries(
  routeRows.map((row, index) => {
    const seedBase = (index + 1) * 131
    const insights: RouteInsights = {
      legs: buildLegBreakdown(seedBase, row.avg, row.route),
      trend: buildMonthlySeries(seedBase + 500, row.avg, 12),
    }
    return [row.id, insights]
  }),
)

const legSegments = computed<LocationLeadTimeSegment[]>(() => routeInsights[selectedRouteId.value]?.legs ?? [])

const trendDatasets = computed<BarChartDataset[]>(() => [
  {
    data: routeInsights[selectedRouteId.value]?.trend ?? [],
    color: ACTIVE_BLUE,
  },
])
</script>

<style scoped lang="scss">
// PageSection 기본 gap($spacing-lg)은 다른 화면과 공유되므로 전역을 건드리지 않고
// 이 카드(Lead Time by Route)에서만 헤더-테이블 사이 간격을 0으로 좁힙니다.
.lead-time-analysis__table-card {
  gap: 0;
}

.lead-time-analysis__table-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: $spacing-md;
  padding-bottom: $spacing-md;
  border-bottom: 1px solid $color-border;
}

.lead-time-analysis__table-title {
  margin: 0;
  font-size: $font-size-lg;
  font-weight: $font-weight-extrabold;
  color: $color-text;
}
</style>
