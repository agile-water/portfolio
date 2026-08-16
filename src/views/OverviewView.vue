<template>
  <DefaultLayout title="Overview">
    <FilterBar>
      <DropdownSelect
        v-model="filters.customer"
        label="Customer"
        placeholder="Select Customer"
        :options="customerOptions"
      />
      <SearchBox v-model="filters.partNumber" label="P/N" placeholder="Search P/N" />
      <RadioButton v-model="filters.asn" label="ASN" :options="asnOptions" />

      <template #actions>
        <SecondaryButton @click="handleReset">Reset</SecondaryButton>
        <PrimaryButton @click="handleSearch">Search</PrimaryButton>
      </template>
    </FilterBar>

    <PageSection v-show="!isTableExpanded">
      <StatCardGroup :items="statCards" />
      <ProcessFlow :steps="processSteps" />
    </PageSection>

    <PageSection no-padding>
      <DataTable :columns="tableColumns" :rows="tableRows">
        <template #actions>
          <ExpandCollapseButton v-model="isTableExpanded" />
          <InfoTooltipButton />
        </template>
      </DataTable>
    </PageSection>
  </DefaultLayout>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'

import DefaultLayout from '@/components/layouts/DefaultLayout.vue'
import PageSection from '@/components/layouts/PageSection.vue'
import FilterBar from '@/components/filters/FilterBar.vue'
import DropdownSelect from '@/components/inputs/DropdownSelect.vue'
import SearchBox from '@/components/inputs/SearchBox.vue'
import RadioButton from '@/components/inputs/RadioButton.vue'
import SecondaryButton from '@/components/buttons/SecondaryButton.vue'
import PrimaryButton from '@/components/buttons/PrimaryButton.vue'
import ExpandCollapseButton from '@/components/buttons/ExpandCollapseButton.vue'
import InfoTooltipButton from '@/components/buttons/InfoTooltipButton.vue'
import StatCardGroup, { type StatCardItem } from '@/components/cards/StatCardGroup.vue'
import ProcessFlow, { type ProcessFlowStep } from '@/components/flow/ProcessFlow.vue'
import DataTable, { type DataTableColumn } from '@/components/table/DataTable.vue'
import shipIcon from '@/assets/icons/sea-filled.svg?raw'
import shipOutlinedIcon from '@/assets/icons/sea-outlined.svg?raw'
import railIcon from '@/assets/icons/rail-filled.svg?raw'
import railOutlinedIcon from '@/assets/icons/rail-outlined.svg?raw'
import airIcon from '@/assets/icons/air.svg?raw'

/* ------------------------------ Table expand ------------------------------ */
// true면 상단 StatCard/ProcessFlow 영역을 숨기고 테이블을 확장
const isTableExpanded = ref(false)

/* ------------------------------- Stat cards ------------------------------- */
// TODO: 실제 데이터 연동 시 value를 API 응답으로 교체
const statCards: StatCardItem[] = [
  { id: 'sea', label: 'SEA', icon: shipIcon, value: 0, unit: 'FEUs', variant: 'sea' },
  { id: 'rail', label: 'RAIL', icon: railIcon, value: 0, unit: 'FEUs', variant: 'rail' },
  { id: 'air', label: 'AIR', icon: airIcon, value: 0, unit: 'kg(CW)', variant: 'air' },
]

/* ------------------------------ Process flow ------------------------------ */
// TODO: 실제 데이터 연동 시 각 단계 row의 value를 API 응답으로 교체
function makeProcessRows() {
  return [
    { id: 'sea', icon: shipOutlinedIcon, value: 0, unit: 'FEUs', variant: 'sea' as const },
    { id: 'rail', icon: railOutlinedIcon, value: 0, unit: 'FEUs', variant: 'rail' as const },
    { id: 'air', icon: airIcon, value: 0, unit: 'kg(CW)', variant: 'air' as const },
  ]
}

const processSteps: ProcessFlowStep[] = [
  { id: 'origin-inland', label: 'Origin Inland', rows: makeProcessRows() },
  { id: 'pol', label: 'POL', rows: makeProcessRows() },
  { id: 'intl-shipping', label: "Int'l Shipping", rows: makeProcessRows() },
  { id: 'pod', label: 'POD', rows: makeProcessRows() },
  { id: 'dest-inland', label: 'Dest. Inland', rows: makeProcessRows() },
]

/* -------------------------------- Data table ------------------------------- */
// TODO: 실제 데이터 연동 시 tableRows를 API 응답으로 교체
const tableColumns: DataTableColumn[] = [
  { id: 'no', label: 'NO', hasMenu: false, hasFilter: false },
  { id: 'customer', label: 'Customer' },
  { id: 'pn', label: 'P/N' },
  { id: 'pname', label: 'P/NAME' },
  { id: 'openPo', label: 'Open PO' },
  {
    id: 'kdCenter',
    label: 'KD Center',
    children: [
      { id: 'receipt', label: 'Receipt' },
      { id: 'packing', label: 'Packing' },
    ],
  },
  { id: 'originInland', label: 'Origin Inland' },
  { id: 'pol', label: 'POL' },
  {
    id: 'intlShipping',
    label: "Int'l Shipping",
    children: [
      { id: 'sea', label: 'Sea' },
      { id: 'air', label: 'Air' },
    ],
  },
]

const tableRows: Record<string, unknown>[] = []

const customerOptions = ['Customer A', 'Customer B', 'Customer C']

const asnOptions = [
  { label: 'All', value: 'all' },
  { label: 'Sent', value: 'sent' },
  { label: 'Not Sent', value: 'not-sent' },
]

const filters = reactive({
  customer: '',
  partNumber: '',
  asn: 'all',
})

function handleReset(): void {
  filters.customer = ''
  filters.partNumber = ''
  filters.asn = 'all'
}

function handleSearch(): void {
  // TODO: 실제 검색 API 연동
  console.log('search filters', { ...filters })
}
</script>
