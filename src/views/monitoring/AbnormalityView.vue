<template>
  <DefaultLayout title="Abnormality">
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

    <PageSection no-padding>
      <DataTable :columns="columns" :rows="rows">
        <template #toolbar-left>
          <InfoTooltipButton message="단계별로 입력된 날짜/코드 값 중 형식이나 범위가 비정상적인 항목을 자동으로 탐지해 보여줍니다." />
        </template>

        <template #export>
          <ExcelExportButton :data="rows" file-name="abnormality" />
        </template>
      </DataTable>
    </PageSection>
  </DefaultLayout>
</template>

<script setup lang="ts">
// C/C ATA 기준으로 단계별(Node)로 입력된 날짜/코드 값 중 형식이나 범위가 비정상적인 항목을
// 자동으로 탐지해 목록으로 보여주는 화면입니다. 다른 Data Monitoring 화면들과 달리 상단
// 게이지·요약 카드가 없고, 표 값도 색상 강조나 배지 없이 일반 텍스트로만 표시돼서
// DataTable을 확장·커스텀 슬롯 없이 그대로 씁니다.
import { reactive } from 'vue'

import DefaultLayout from '@/components/layouts/DefaultLayout.vue'
import PageSection from '@/components/layouts/PageSection.vue'
import FilterBar from '@/components/filters/FilterBar.vue'
import DropdownSelect from '@/components/inputs/DropdownSelect.vue'
import DateRangeField, { type DateRange } from '@/components/inputs/DateRangeField.vue'
import SecondaryButton from '@/components/buttons/SecondaryButton.vue'
import PrimaryButton from '@/components/buttons/PrimaryButton.vue'
import ExcelExportButton from '@/components/buttons/ExcelExportButton.vue'
import InfoTooltipButton from '@/components/buttons/InfoTooltipButton.vue'
import DataTable, { type DataTableColumn } from '@/components/table/DataTable.vue'

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
  // TODO: 실제 검색 API 연동. Customer/C·C ATA 기준으로 표 갱신
  console.log('search abnormality', { ...filters })
}

/* ------------------------------ Mock 표 데이터 ------------------------------ */
// 0~1 사이 값을 결정적으로 만들어주는 간단한 pseudo-random(사인 기반) 함수.
// (다른 Data Monitoring 화면들과 동일한 관례)
function seededRandom(seed: number): number {
  const x = Math.sin(seed) * 43758.5453
  return x - Math.floor(x)
}

const SHIPMODES = ['Sea', 'Rail', 'Air']
const ROW_COUNT = 27
const ABNORMAL_COUNT = 10

interface AbnormalityDetail {
  node: string
  item: string
  abnormalityType: string
  description: string
}

// 실제 탐지 로직 대신, 화면에서 보이는 것과 같은 유형의 이상치 몇 가지를 순환시켜 씁니다.
const ABNORMALITY_TEMPLATES: AbnormalityDetail[] = [
  { node: 'POL', item: 'ATD', abnormalityType: 'Invalid Date Value', description: 'ATD는 1901-01-01일 수 없음' },
  { node: 'POL', item: 'ATD', abnormalityType: 'Invalid Data Format', description: 'ATD 컬럼에 POD Code가 입력됨' },
  { node: 'POD', item: 'ATA', abnormalityType: 'Invalid Date Value', description: 'Actual Date가 미래 시점으로 입력됨' },
  { node: 'ODCY', item: 'ATD', abnormalityType: 'Invalid Data Format', description: 'ATD 컬럼에 CNTR No가 입력됨' },
  {
    node: 'POD',
    item: 'ATA',
    abnormalityType: 'Invalid Date Value',
    description: "Int'l Shipping Transit Time이 비정상적으로 짧음",
  },
  { node: 'C/C', item: 'ATA', abnormalityType: 'Invalid Date Value', description: 'ATA는 2099-12-31일 수 없음' },
]

interface AbnormalityRow {
  no: number
  customer: string
  shipmode: string
  cntrNo: string
  invoiceNo: string
  hblNo: string
  mblNo: string
  node: string
  item: string
  abnormalityType: string
  description: string
}

const EMPTY_DETAIL: AbnormalityDetail = {
  node: '-',
  item: '-',
  abnormalityType: '-',
  description: '-',
}

function buildRow(index: number): AbnormalityRow {
  const seed = index * 19.1 + 9001
  const shipmode = SHIPMODES[Math.floor(seededRandom(seed) * SHIPMODES.length)] ?? SHIPMODES[0]!
  const detail =
    index < ABNORMAL_COUNT
      ? ABNORMALITY_TEMPLATES[index % ABNORMALITY_TEMPLATES.length] ?? EMPTY_DETAIL
      : EMPTY_DETAIL

  return {
    no: index + 1,
    customer: 'HMMC',
    shipmode,
    cntrNo: `${String.fromCharCode(65 + (index % 26))}${String.fromCharCode(
      65 + ((index * 3) % 26),
    )}AU${String(1000000 + Math.floor(seededRandom(seed + 4) * 8999999)).slice(0, 7)}`,
    invoiceNo: `KKP${String(8000 + Math.floor(seededRandom(seed + 8) * 999)).slice(0, 4)}${
      seededRandom(seed + 9) > 0.5 ? 'KMS' : 'YRS'
    }`,
    hblNo: `SEL${String(1900000 + Math.floor(seededRandom(seed + 12) * 99999)).slice(0, 7)}`,
    mblNo: `SEL${String(1900000 + Math.floor(seededRandom(seed + 12) * 99999)).slice(0, 7)}`,
    node: detail.node,
    item: detail.item,
    abnormalityType: detail.abnormalityType,
    description: detail.description,
  }
}

const rows = Array.from({ length: ROW_COUNT }, (_, index) => buildRow(index)) as unknown as Record<
  string,
  unknown
>[]

/* --------------------------------- 표 컬럼 --------------------------------- */
const columns: DataTableColumn[] = [
  { id: 'no', label: 'NO' },
  { id: 'customer', label: 'Customer' },
  { id: 'shipmode', label: 'Shipmode' },
  { id: 'cntrNo', label: 'CNTR No' },
  { id: 'invoiceNo', label: 'Invoice No' },
  { id: 'hblNo', label: 'HB/L No.' },
  { id: 'mblNo', label: 'MB/L No.' },
  { id: 'node', label: 'Node' },
  { id: 'item', label: 'Item' },
  { id: 'abnormalityType', label: 'Abnormality Type' },
  { id: 'description', label: 'Description' },
]
</script>
