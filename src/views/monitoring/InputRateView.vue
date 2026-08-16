<template>
  <DefaultLayout title="Input Rate">
    <FilterBar>
      <DropdownSelect
        v-model="filters.customer"
        label="Customer"
        placeholder="Select Customer"
        :options="customerOptions"
      />
      <DateRangeField v-model="filters.ccAta" label="C/C ATA" width="260px" />

      <template #actions>
        <SecondaryButton @click="handleReset">Reset</SecondaryButton>
        <PrimaryButton @click="handleSearch">Search</PrimaryButton>
      </template>
    </FilterBar>

    <PageSection class="input-rate__summary">
      <div class="input-rate__gauge-block">
        <GaugeChart :value="totalConsistent" :max="totalCount" />
        <div class="input-rate__gauge-caption">
          <p class="input-rate__gauge-caption-label">Total</p>
          <p class="input-rate__gauge-caption-value">
            {{ totalConsistent }}
            <span class="input-rate__gauge-caption-value-muted">/{{ totalCount }}</span>
          </p>
        </div>
      </div>

      <ModeSummaryCardGroup v-model="selectedMode" :items="modeCards" />
    </PageSection>

    <PageSection no-padding>
      <DataTable :columns="columns" :rows="filteredRows">
        <template #toolbar-left>
          <InfoTooltipButton message="시스템/인터페이스로부터 값이 정상적으로 입력된 비율(Input Rate)과 그중 이상치 비율(Outlier Rate)을 보여줍니다." />
        </template>

        <template #export>
          <ExcelExportButton :data="filteredRows" file-name="input-rate" />
        </template>

        <template #cell-inputRate="{ row }">
          <span class="input-rate__cell-rate" :class="`input-rate__cell-rate--${inputRateTone(rowOf(row).inputRate)}`">
            {{ rowOf(row).inputRate }}%
          </span>
        </template>

        <template #cell-outlierRate="{ row }">
          <span
            class="input-rate__cell-rate"
            :class="`input-rate__cell-rate--${outlierRateTone(rowOf(row).outlierRate)}`"
          >
            {{ rowOf(row).outlierRate }}%
          </span>
        </template>
      </DataTable>
    </PageSection>
  </DefaultLayout>
</template>

<script setup lang="ts">
// C/C ATA 기준으로 각 단계(Node)·SHIP Mode별 데이터가 시스템에 얼마나 정상적으로 입력되는지
// (Input Rate)와, 그중 이상치 비율(Outlier Rate)을 보여주는 화면입니다. Completeness/Consistency
// 화면과 상단 게이지·요약 카드 구성이 동일해서 GaugeChart/ModeSummaryCardGroup을 그대로
// 재사용합니다. 표는 행 배경 강조나 배지 없이, Input/Outlier Rate 값 자체를 색+밑줄로
// 강조하는 정도라 DataTable을 확장 없이(#cell-* 슬롯만 사용) 그대로 씁니다.
import { computed, reactive, ref } from 'vue'

import DefaultLayout from '@/components/layouts/DefaultLayout.vue'
import PageSection from '@/components/layouts/PageSection.vue'
import FilterBar from '@/components/filters/FilterBar.vue'
import DropdownSelect from '@/components/inputs/DropdownSelect.vue'
import DateRangeField, { type DateRange } from '@/components/inputs/DateRangeField.vue'
import SecondaryButton from '@/components/buttons/SecondaryButton.vue'
import PrimaryButton from '@/components/buttons/PrimaryButton.vue'
import ExcelExportButton from '@/components/buttons/ExcelExportButton.vue'
import InfoTooltipButton from '@/components/buttons/InfoTooltipButton.vue'
import GaugeChart from '@/components/charts/GaugeChart.vue'
import ModeSummaryCardGroup, {
  type ModeSummaryCardItem,
} from '@/components/cards/ModeSummaryCardGroup.vue'
import DataTable, { type DataTableColumn } from '@/components/table/DataTable.vue'
import type { TransportMode } from '@/components/badges/TransportModeIcon.vue'

/* --------------------------------- Filters --------------------------------- */
// TODO: 실제 데이터 연동 시 옵션들을 API 응답으로 교체
const customerOptions = ['[HB] HMMA', '[HC] HMMC', '[KG] KaGA', '[KS] KaSK']

const filters = reactive({
  customer: '[HC] HMMC',
  ccAta: { from: new Date(2025, 8, 1), to: new Date(2026, 1, 28) } as DateRange,
})

function handleReset(): void {
  filters.customer = ''
  filters.ccAta = { from: null, to: null }
}

function handleSearch(): void {
  // TODO: 실제 검색 API 연동. Customer/C·C ATA 기준으로 게이지·요약 카드·표 갱신
  console.log('search input rate', { ...filters })
}

/* --------------------------------- 상단 요약 --------------------------------- */
// TODO: 실제 데이터 연동 시 API 응답으로 교체
const totalConsistent = 950
const totalCount = 1000

const modeCards: ModeSummaryCardItem[] = [
  { mode: 'sea', label: 'Sea', value: 97, total: 100 },
  { mode: 'rail', label: 'Rail', value: 192, total: 200 },
  { mode: 'air', label: 'Air', value: 46, total: 50 },
]

const selectedMode = ref<TransportMode>('sea')

/* ------------------------------ Mock 표 데이터 ------------------------------ */
interface InputRateRow {
  no: number
  customer: string
  node: string
  mode: TransportMode
  shipmode: string
  dbColumn: string
  platformColumn: string
  inputRate: number
  outlierRate: number
  system: string
  dataSource: string
}

// 0~1 사이 값을 결정적으로 만들어주는 간단한 pseudo-random(사인 기반) 함수.
// (PipelineInventoryStatusView 등 다른 화면과 동일한 관례)
function seededRandom(seed: number): number {
  const x = Math.sin(seed) * 43758.5453
  return x - Math.floor(x)
}

const MODES: TransportMode[] = ['sea', 'rail', 'air']
const MODE_LABELS: Record<TransportMode, string> = { sea: 'Sea', rail: 'Rail', air: 'Air' }
const NODES = ['KD Center', 'ODCY', 'POL', 'POD', 'C/C', 'Origin Stn.', 'Dest. Stn.']
const DB_COLUMNS = ['ATD', 'ATA', 'ETA']
const SYSTEMS = ['KD System', 'Platform', 'GLOVE', 'GENISYS', 'GCS']
const DATA_SOURCES = ['I/F', 'Computation', 'Parsing']
const ROW_COUNT = 49

function pick<T>(list: T[], seed: number): T {
  const index = Math.floor(seededRandom(seed) * list.length)
  return list[index] ?? list[0]!
}

function inputRateTone(rate: number): 'good' | 'warning' | 'danger' {
  if (rate >= 90) return 'good'
  if (rate >= 80) return 'warning'
  return 'danger'
}

function outlierRateTone(rate: number): 'good' | 'warning' | 'danger' {
  if (rate < 5) return 'good'
  if (rate < 10) return 'warning'
  return 'danger'
}

function buildRow(index: number): InputRateRow {
  const seed = index * 17.3 + 7001
  const node = NODES[index % NODES.length] ?? NODES[0]!
  const mode = MODES[(index + Math.floor(index / NODES.length)) % MODES.length] ?? 'sea'
  const dbColumn = pick(DB_COLUMNS, seed + 3)
  const system = pick(SYSTEMS, seed + 6)
  const dataSource = pick(DATA_SOURCES, seed + 9)
  const inputRate = Math.min(100, 75 + Math.floor(seededRandom(seed) * 26))
  const outlierRate = Math.min(15, Math.floor(seededRandom(seed + 12) * 13))

  return {
    no: index + 1,
    customer: 'HMMC',
    node,
    mode,
    shipmode: MODE_LABELS[mode],
    dbColumn,
    platformColumn: dbColumn,
    inputRate,
    outlierRate,
    system,
    dataSource,
  }
}

const inputRateRows = Array.from({ length: ROW_COUNT }, (_, index) =>
  buildRow(index),
) as unknown as Record<string, unknown>[]

const filteredRows = computed(() =>
  inputRateRows.filter((row) => (row as unknown as InputRateRow).mode === selectedMode.value),
)

function rowOf(row: Record<string, unknown>): InputRateRow {
  return row as unknown as InputRateRow
}

/* --------------------------------- 표 컬럼 --------------------------------- */
const columns: DataTableColumn[] = [
  { id: 'no', label: 'NO' },
  { id: 'customer', label: 'Customer' },
  { id: 'node', label: 'Node' },
  { id: 'shipmode', label: 'Shipmode' },
  { id: 'dbColumn', label: 'DB Column' },
  { id: 'platformColumn', label: 'Platform Column' },
  { id: 'inputRate', label: 'Input Rate' },
  { id: 'outlierRate', label: 'Outlier Rate' },
  { id: 'system', label: 'System' },
  { id: 'dataSource', label: 'Data Source' },
]
</script>

<style scoped lang="scss">
.input-rate__summary {
  flex-direction: row;
  align-items: center;
  gap: $spacing-xl;
}

.input-rate__gauge-block {
  display: flex;
  align-items: center;
  gap: $spacing-lg;
  flex-shrink: 0;
}

.input-rate__gauge-caption-label {
  margin: 0 0 4px;
  font-size: $font-size-sm;
  color: $color-text-muted;
}

.input-rate__gauge-caption-value {
  margin: 0;
  font-size: $font-size-xl;
  font-weight: $font-weight-extrabold;
  color: $color-text;
  white-space: nowrap;
}

.input-rate__gauge-caption-value-muted {
  font-size: $font-size-base;
  font-weight: $font-weight-bold;
  color: $color-text-muted;
}

.input-rate__cell-rate {
  font-weight: $font-weight-bold;
  text-decoration: underline;
  text-underline-offset: 2px;

  &--good {
    color: $color-success;
  }

  &--warning {
    color: $color-warning;
  }

  &--danger {
    color: $color-danger;
  }
}
</style>
