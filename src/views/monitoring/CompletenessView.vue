<template>
  <DefaultLayout title="Completeness">
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

    <PageSection class="completeness__summary">
      <div class="completeness__gauge-block">
        <GaugeChart :value="totalCompleted" :max="totalCount" />
        <div class="completeness__gauge-caption">
          <p class="completeness__gauge-caption-label">Total</p>
          <p class="completeness__gauge-caption-value">
            {{ totalCompleted }}
            <span class="completeness__gauge-caption-value-muted">/{{ totalCount }}</span>
          </p>
        </div>
      </div>

      <ModeSummaryCardGroup v-model="selectedMode" :items="modeCards" />
    </PageSection>

    <PageSection no-padding>
      <DataTable
        :columns="columns"
        :rows="filteredRows"
        :row-class="rowToneClass"
        show-add-column
        @add-column="handleAddColumn"
      >
        <template #toolbar-left>
          <div class="completeness__toggle-field">
            <ToggleSwitch v-model="showAllResults" label="Show all results" @update:modelValue="handleToggleShowAll" />
            <span>Show all results</span>
          </div>
          <InfoTooltipButton message="검사 대상 컬럼의 값이 모두 채워졌는지를 기준으로 완성도를 계산합니다." />
        </template>

        <template #export>
          <ExcelExportButton :data="filteredRows" file-name="completeness" />
        </template>

        <template #cell-completeness="{ row }">
          <span class="completeness__cell-completeness">
            <StatusDot :tone="rowOf(row).tone" />
            <span
              class="completeness__cell-completeness-text"
              :class="`completeness__cell-completeness-text--${rowOf(row).tone}`"
            >
              {{ rowOf(row).completenessNum }}/{{ rowOf(row).completenessDen }}
            </span>
          </span>
        </template>

        <template #cell-errorColumn="{ value }">
          <span class="completeness__cell-errors">
            <template v-if="errorsOf(value).length">
              <Badge v-for="(err, index) in errorsOf(value)" :key="index" :tone="err.tone">
                {{ err.label }}
              </Badge>
            </template>
            <span v-else class="completeness__cell-errors-empty">-</span>
          </span>
        </template>
      </DataTable>
    </PageSection>
  </DefaultLayout>
</template>

<script setup lang="ts">
// C/C ATA 기준 데이터 완성도(필수 컬럼이 얼마나 채워졌는지)를 보여주는 화면입니다.
// 상단 게이지 + Sea/Rail/Air 요약 카드는 항상 전체 기준으로 표시되고, 카드를 클릭하면
// 그 SHIP Mode에 해당하는 행만 아래 표에 필터링되어 보입니다.
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
import StatusDot, { type StatusDotTone } from '@/components/badges/StatusDot.vue'
import Badge, { type BadgeTone } from '@/components/badges/Badge.vue'
import ToggleSwitch from '@/components/inputs/ToggleSwitch.vue'
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
  console.log('search completeness', { ...filters })
}

/* --------------------------------- 상단 요약 --------------------------------- */
// TODO: 실제 데이터 연동 시 API 응답으로 교체
const totalCompleted = 950
const totalCount = 1000

const modeCards: ModeSummaryCardItem[] = [
  { mode: 'sea', label: 'Sea', value: 97, total: 100 },
  { mode: 'rail', label: 'Rail', value: 192, total: 200 },
  { mode: 'air', label: 'Air', value: 46, total: 50 },
]

const selectedMode = ref<TransportMode>('sea')

/* ------------------------------ Mock 표 데이터 ------------------------------ */
interface ErrorTag {
  label: string
  tone: BadgeTone
}

interface CompletenessRow {
  no: number
  customer: string
  cntrNo: string
  invoiceNo: string
  hblNo: string
  mblNo: string
  mode: TransportMode
  completenessNum: number
  completenessDen: number
  tone: StatusDotTone
  errorColumn: ErrorTag[]
}

// 0~1 사이 값을 결정적으로 만들어주는 간단한 pseudo-random(사인 기반) 함수.
// (PipelineInventoryStatusView 등 다른 화면과 동일한 관례)
function seededRandom(seed: number): number {
  const x = Math.sin(seed) * 43758.5453
  return x - Math.floor(x)
}

const MODES: TransportMode[] = ['sea', 'rail', 'air']
const CUSTOMERS = ['HMMA', 'HMMC', 'KaGA', 'KaSK']
const COMPLETENESS_DEN = 15
const ROW_COUNT = 42

const ERROR_POOL: ErrorTag[] = [
  { label: 'POL-ATA', tone: 'warning' },
  { label: 'ODCY-ATD', tone: 'warning' },
  { label: 'ODCY-ATA', tone: 'warning' },
  { label: 'KD-ATD', tone: 'danger' },
  { label: 'HB/L No', tone: 'danger' },
  { label: 'MB/L No', tone: 'danger' },
  { label: 'Invoice Date', tone: 'warning' },
]

function toneOf(num: number): StatusDotTone {
  if (num >= COMPLETENESS_DEN) return 'good'
  if (num >= 12) return 'warning'
  return 'danger'
}

function buildRow(index: number): CompletenessRow {
  const seed = index * 13.7 + 1
  const num = Math.max(8, COMPLETENESS_DEN - Math.floor(seededRandom(seed) * 7))
  const tone = toneOf(num)
  const mode = MODES[index % MODES.length] ?? 'sea'
  const customer = CUSTOMERS[Math.floor(seededRandom(seed + 3) * CUSTOMERS.length)] ?? CUSTOMERS[0]!
  const errorCount = tone === 'good' ? 0 : tone === 'warning' ? 1 : 2
  const errorColumn = Array.from({ length: errorCount }, (_, i) => {
    const poolIndex = Math.floor(seededRandom(seed + 10 + i * 4) * ERROR_POOL.length)
    return ERROR_POOL[poolIndex] ?? ERROR_POOL[0]!
  })

  return {
    no: index + 1,
    customer,
    cntrNo: `TCLU${String(1000000 + Math.floor(seededRandom(seed + 20) * 8999999)).slice(0, 7)}`,
    invoiceNo: `INV-2025-${String(index + 1).padStart(4, '0')}`,
    hblNo: `HBL2025${String(900000 + index).slice(-6)}`,
    mblNo: `MBL2025${String(900000 + index).slice(-6)}`,
    mode,
    completenessNum: num,
    completenessDen: COMPLETENESS_DEN,
    tone,
    errorColumn,
  }
}

const completenessRows = Array.from({ length: ROW_COUNT }, (_, index) =>
  buildRow(index),
) as unknown as Record<string, unknown>[]

const filteredRows = computed(() =>
  completenessRows.filter((row) => (row as unknown as CompletenessRow).mode === selectedMode.value),
)

function rowOf(row: Record<string, unknown>): CompletenessRow {
  return row as unknown as CompletenessRow
}

function errorsOf(value: unknown): ErrorTag[] {
  return (value as ErrorTag[] | undefined) ?? []
}

function rowToneClass(row: Record<string, unknown>): string | undefined {
  const tone = rowOf(row).tone
  if (tone === 'warning') return 'completeness__row--warning'
  if (tone === 'danger') return 'completeness__row--danger'
  return undefined
}

/* --------------------------------- 표 컬럼 --------------------------------- */
const columns: DataTableColumn[] = [
  { id: 'no', label: 'NO', hasFilter: false },
  { id: 'customer', label: 'Customer' },
  { id: 'cntrNo', label: 'CNTR No' },
  { id: 'invoiceNo', label: 'Invoice No' },
  { id: 'hblNo', label: 'HB/L No.' },
  { id: 'mblNo', label: 'MB/L No.' },
  { id: 'completeness', label: 'Completeness' },
  { id: 'errorColumn', label: 'Error Column' },
]

/* --------------------------------- 표 툴바 --------------------------------- */
const showAllResults = ref(false)

function handleToggleShowAll(value: boolean): void {
  // TODO: 실제로는 표시 행 수(페이지네이션 해제)를 조절
  console.log('toggle show all results', value)
}

function handleAddColumn(): void {
  // TODO: 사용자 정의 컬럼 추가 UI 연동
  console.log('add column clicked')
}
</script>

<style scoped lang="scss">
.completeness__summary {
  flex-direction: row;
  align-items: center;
  gap: $spacing-xl;
}

.completeness__gauge-block {
  display: flex;
  align-items: center;
  gap: $spacing-lg;
  flex-shrink: 0;
}

.completeness__gauge-caption-label {
  margin: 0 0 4px;
  font-size: $font-size-sm;
  color: $color-text-muted;
}

.completeness__gauge-caption-value {
  margin: 0;
  font-size: $font-size-xl;
  font-weight: $font-weight-extrabold;
  color: $color-text;
  white-space: nowrap;
}

.completeness__gauge-caption-value-muted {
  font-size: $font-size-base;
  font-weight: $font-weight-bold;
  color: $color-text-muted;
}

.completeness__toggle-field {
  display: flex;
  align-items: center;
  gap: $spacing-xs;
  font-size: $font-size-sm;
  color: $color-text;
}

.completeness__cell-completeness {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.completeness__cell-completeness-text {
  font-weight: $font-weight-bold;

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

.completeness__cell-errors {
  display: inline-flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 4px;
}

.completeness__cell-errors-empty {
  color: $color-text-muted;
}

:deep(.completeness__row--warning) .data-table__td {
  background: rgba($color-warning, 0.08);
}

:deep(.completeness__row--danger) .data-table__td {
  background: rgba($color-danger, 0.08);
}
</style>
