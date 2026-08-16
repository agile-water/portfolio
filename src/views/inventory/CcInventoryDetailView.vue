<template>
  <DefaultLayout title="C/C Inventory Detail">
    <FilterPanel>
      <template #row1>
        <DropdownSelect
          v-model="filters.customer"
          label="Customer"
          placeholder="Select Customer"
          :options="customerOptions"
          :searchable="false"
        />
        <SearchBox v-model="filters.partNumber" label="P/N" placeholder="Search P/N" />
      </template>

      <template #actions>
        <DetailedFilterButton v-model="isAdvancedFilterOpen" />
        <SecondaryButton @click="handleReset">Reset</SecondaryButton>
        <PrimaryButton @click="handleSearch">Search</PrimaryButton>
      </template>
    </FilterPanel>

    <PageSection>
      <MetricTrendCardGroup v-model="selectedMetricId" :items="metricCards" />
    </PageSection>

    <PageSection no-padding>
      <TwoColumnSection left-width="1fr" right-width="1.3fr">
        <template #left>
          <h2 class="cc-inventory-detail__panel-title">Summary</h2>
          <DataTable
            :columns="summaryColumns"
            :rows="summaryRows"
            selectable
            row-key="pn"
            :selected="summarySelected"
            :exportable="false"
            empty-message="Enter customer to search."
            @update:selected="summarySelected = $event"
          />
        </template>

        <template #right>
          <h2 class="cc-inventory-detail__panel-title">Detail</h2>
          <DataTable
            :columns="detailColumns"
            :rows="detailRows"
            empty-message="Select a row in Summary to see detail."
          >
            <template #export>
              <ExcelExportButton :data="detailRows" file-name="cc-inventory-detail" />
            </template>
            <template #actions>
              <InfoTooltipButton />
            </template>
          </DataTable>
        </template>
      </TwoColumnSection>
    </PageSection>
  </DefaultLayout>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'

import DefaultLayout from '@/components/layouts/DefaultLayout.vue'
import PageSection from '@/components/layouts/PageSection.vue'
import TwoColumnSection from '@/components/layouts/TwoColumnSection.vue'
import FilterPanel from '@/components/filters/FilterPanel.vue'
import DropdownSelect from '@/components/inputs/DropdownSelect.vue'
import SearchBox from '@/components/inputs/SearchBox.vue'
import SecondaryButton from '@/components/buttons/SecondaryButton.vue'
import PrimaryButton from '@/components/buttons/PrimaryButton.vue'
import DetailedFilterButton from '@/components/buttons/DetailedFilterButton.vue'
import ExcelExportButton from '@/components/buttons/ExcelExportButton.vue'
import InfoTooltipButton from '@/components/buttons/InfoTooltipButton.vue'
import MetricTrendCardGroup, {
  type MetricTrendCardItem,
} from '@/components/cards/MetricTrendCardGroup.vue'
import DataTable, { type DataTableColumn } from '@/components/table/DataTable.vue'

import containerIcon from '@/assets/icons/container.svg?raw'
import caseIcon from '@/assets/icons/case.svg?raw'
import settingsIcon from '@/assets/icons/settings.svg?raw'

/* --------------------------------- Filters --------------------------------- */
// TODO: 실제 데이터 연동 시 옵션들을 API 응답으로 교체
const customerOptions: string[] = []

const isAdvancedFilterOpen = ref(false)

const filters = reactive({
  customer: '',
  partNumber: '',
})

function handleReset(): void {
  filters.customer = ''
  filters.partNumber = ''
}

function handleSearch(): void {
  // TODO: 실제 검색 API 연동
  console.log('search filters', { ...filters })
}

/* -------------------------------- Metric cards ------------------------------ */
// TODO: 실제 데이터 연동 시 value/trend를 API 응답으로 교체
const metricCards: MetricTrendCardItem[] = [
  {
    id: 'cy',
    label: 'Total in CY',
    icon: containerIcon,
    value: 0,
    unit: 'FEUs',
    variant: 'sea',
  },
  {
    id: 'cc',
    label: 'Total in C/C',
    icon: caseIcon,
    value: 0,
    unit: 'Cases',
    variant: 'rail',
  },
  {
    id: 'cy-cc',
    label: 'Total in CY&C/C',
    icon: settingsIcon,
    value: 0,
    unit: 'Items',
    variant: 'air',
  },
]

// 탭처럼 동작하는 카드 중 현재 선택된 카드 id
const selectedMetricId = ref('cy-cc')

/* --------------------------- Summary / Detail tables ------------------------- */
// TODO: 실제 데이터 연동 시 rows를 API 응답으로 교체하고, Summary 선택 행에 따라
// Detail 목록을 다시 조회하도록 연결
const summaryColumns: DataTableColumn[] = [
  { id: 'pn', label: 'P/N' },
  { id: 'pname', label: 'P/NAME' },
  { id: 'materialGroup', label: 'Material Group' },
  { id: 'qty', label: 'Qty' },
]

const summaryRows: Record<string, unknown>[] = []

// Summary에서 체크된 행(P/N 기준)
const summarySelected = ref<(string | number)[]>([])

const detailColumns: DataTableColumn[] = [
  { id: 'pn', label: 'P/N' },
  { id: 'pname', label: 'P/NAME' },
  { id: 'location', label: 'Location' },
  { id: 'qty', label: 'Qty' },
  { id: 'caseNo', label: 'Case No' },
  { id: 'cntrNo', label: 'Cntr No' },
]

const detailRows: Record<string, unknown>[] = []
</script>

<style scoped lang="scss">
.cc-inventory-detail__panel-title {
  margin: 0;
  font-size: $font-size-base;
  font-weight: $font-weight-extrabold;
  color: $color-text;
}
</style>
