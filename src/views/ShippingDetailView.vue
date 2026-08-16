<template>
  <DefaultLayout title="Shipping Detail">
    <FilterPanel :expanded="isAdvancedFilterOpen">
      <template #row1>
        <DropdownSelect
          v-model="filters.customer"
          label="Customer"
          placeholder="Select Customer"
          :options="customerOptions"
          label-width="100px"
          label-align="right"
        />
        <SearchBox
          v-model="filters.partNumber"
          label="P/N"
          placeholder="Search P/N"
          label-width="100px"
          label-align="right"
        />
        <RadioButton
          v-model="filters.status"
          label="Status"
          :options="statusOptions"
          label-width="100px"
          label-align="right"
        />
      </template>

      <template #row2>
        <DropdownSelect
          v-model="filters.shipMode"
          label="SHIP Mode"
          :options="shipModeOptions"
          :searchable="false"
          label-width="100px"
          label-align="right"
        />
        <DropdownSelect
          v-model="filters.location"
          label="Location"
          :options="locationOptions"
          :searchable="false"
          label-width="100px"
          label-align="right"
        />
        <DropdownSelect
          v-model="filters.plantSite"
          label="Plant Site"
          :options="plantSiteOptions"
          label-width="100px"
          label-align="right"
        />
        <RadioButton
          v-model="filters.asn"
          label="ASN"
          :options="asnOptions"
          label-width="100px"
          label-align="right"
        />
      </template>

      <template #row3>
        <DropdownSelect
          v-model="filters.pol"
          label="POL"
          :options="polOptions"
          label-width="100px"
          label-align="right"
        />
        <DropdownSelect
          v-model="filters.pod"
          label="POD"
          :options="podOptions"
          label-width="100px"
          label-align="right"
        />

        <div class="shipping-detail__combo-field">
          <CompactSelect v-model="filters.dateField" :options="dateFieldOptions" />
          <DateRangeField v-model="filters.dateRange" />
        </div>

        <div class="shipping-detail__combo-field">
          <CompactSelect v-model="filters.invoiceField" :options="invoiceFieldOptions" />
          <TextField v-model="filters.invoiceNo" placeholder="Search Invoice No" />
        </div>
      </template>

      <template #actions>
        <DetailedFilterButton v-model="isAdvancedFilterOpen" />
        <SecondaryButton @click="handleReset">Reset</SecondaryButton>
        <PrimaryButton @click="handleSearch">Search</PrimaryButton>
      </template>
    </FilterPanel>

    <PageSection no-padding>
      <div class="shipping-detail__tabs">
        <TabToggle v-model="viewMode" :options="viewModeOptions" />
      </div>

      <DataTable :columns="tableColumns" :rows="tableRows" empty-message="Enter customer to search.">
        <template #export>
          <ExcelExportButton :data="tableRows" file-name="shipping-detail" />
        </template>
        <template #actions>
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
import FilterPanel from '@/components/filters/FilterPanel.vue'
import DropdownSelect from '@/components/inputs/DropdownSelect.vue'
import SearchBox from '@/components/inputs/SearchBox.vue'
import RadioButton from '@/components/inputs/RadioButton.vue'
import CompactSelect from '@/components/inputs/CompactSelect.vue'
import DateRangeField, { type DateRange } from '@/components/inputs/DateRangeField.vue'
import TextField from '@/components/inputs/TextField.vue'
import SecondaryButton from '@/components/buttons/SecondaryButton.vue'
import PrimaryButton from '@/components/buttons/PrimaryButton.vue'
import DetailedFilterButton from '@/components/buttons/DetailedFilterButton.vue'
import ExcelExportButton from '@/components/buttons/ExcelExportButton.vue'
import InfoTooltipButton from '@/components/buttons/InfoTooltipButton.vue'
import TabToggle from '@/components/tabs/TabToggle.vue'
import DataTable, { type DataTableColumn } from '@/components/table/DataTable.vue'

/* -------------------------------- View mode -------------------------------- */
const viewModeOptions = [
  { label: 'By Shipment', value: 'shipment' },
  { label: 'By Vessel', value: 'vessel' },
]
const viewMode = ref('shipment')
const isAdvancedFilterOpen = ref(false)

/* --------------------------------- Filters --------------------------------- */
// TODO: 실제 데이터 연동 시 옵션들을 API 응답으로 교체
const customerOptions = ['Customer A', 'Customer B', 'Customer C']
const shipModeOptions = ['All', 'Sea', 'Air', 'Rail']
const locationOptions = ['All', 'Korea', 'USA', 'China', 'Vietnam']
const plantSiteOptions = ['All', 'Plant A', 'Plant B', 'Plant C']
const polOptions = ['All', 'Busan', 'Shanghai', 'Ningbo']
const podOptions = ['All', 'Los Angeles', 'Rotterdam', 'Long Beach']

const statusOptions = [
  { label: 'Shipping', value: 'shipping' },
  { label: 'Delivered', value: 'delivered' },
  { label: 'All', value: 'all' },
]

const asnOptions = [
  { label: 'ALL', value: 'all' },
  { label: 'Sent', value: 'sent' },
  { label: 'Not Sent', value: 'not-sent' },
]

const dateFieldOptions = [
  { label: 'POL ETD', value: 'pol-etd' },
  { label: 'POL ATD', value: 'pol-atd' },
  { label: 'POD ETA', value: 'pod-eta' },
  { label: 'POD ATA', value: 'pod-ata' },
]

const invoiceFieldOptions = [
  { label: 'Invoice No', value: 'invoice-no' },
  { label: 'PO No', value: 'po-no' },
]

const filters = reactive({
  customer: '',
  partNumber: '',
  status: 'shipping',
  shipMode: 'All',
  location: 'All',
  plantSite: 'All',
  asn: 'all',
  pol: 'All',
  pod: 'All',
  dateField: 'pol-etd',
  dateRange: { from: null, to: null } as DateRange,
  invoiceField: 'invoice-no',
  invoiceNo: '',
})

function handleReset(): void {
  filters.customer = ''
  filters.partNumber = ''
  filters.status = 'shipping'
  filters.shipMode = 'All'
  filters.location = 'All'
  filters.plantSite = 'All'
  filters.asn = 'all'
  filters.pol = 'All'
  filters.pod = 'All'
  filters.dateField = 'pol-etd'
  filters.dateRange = { from: null, to: null }
  filters.invoiceField = 'invoice-no'
  filters.invoiceNo = ''
}

function handleSearch(): void {
  // TODO: 실제 검색 API 연동
  console.log('search filters', { ...filters })
}

/* -------------------------------- Data table ------------------------------- */
// TODO: 실제 데이터 연동 시 tableRows를 API 응답으로 교체
const tableColumns: DataTableColumn[] = [
  { id: 'no', label: 'NO', hasMenu: false, hasFilter: false },
  { id: 'status', label: 'Status' },
  { id: 'location', label: 'Location' },
  { id: 'shipMode', label: 'SHIP Mode' },
  { id: 'customer', label: 'Customer' },
  { id: 'pn', label: 'P/N' },
  { id: 'pname', label: 'P/NAME' },
  { id: 'kdCenter', label: 'KD Center' },
  { id: 'vdrCode', label: 'VDR Code' },
  { id: 'vdrName', label: 'VDR Name' },
  { id: 'qty', label: 'Qty' },
  { id: 'invoiceNo', label: 'Invoice No' },
  { id: 'mblNo', label: 'MBL No' },
  { id: 'hblNo', label: 'HBL No' },
  { id: 'cntrNo', label: 'CNTR No' },
  { id: 'pol', label: 'POL' },
  { id: 'pod', label: 'POD' },
  { id: 'shippingLine', label: 'Shipping Line' },
  {
    id: 'onBoardVessel',
    label: 'On board Vessel',
    children: [
      { id: 'onBoardVesselName', label: 'Vessel Name' },
      { id: 'onBoardVoyage', label: 'Voyage' },
    ],
  },
  {
    id: 'currentVessel',
    label: 'Current Vessel',
    children: [
      { id: 'currentVesselName', label: 'Vessel Name' },
      { id: 'currentVoyage', label: 'Voyage' },
    ],
  },
  {
    id: 'scheduleOriginInland',
    label: 'Schedule - Origin Inland',
    children: [
      { id: 'atdKdCenter', label: 'ATD KD Center' },
      { id: 'etaPolOriginInland', label: 'ETA POL' },
      { id: 'ataPolOriginInland', label: 'ATA POL' },
      { id: 'otdOriginInland', label: 'OTD' },
    ],
  },
  {
    id: 'scheduleIntlShipping',
    label: "Schedule - Int'l Shipping",
    children: [
      { id: 'etdPol', label: 'ETD POL' },
      { id: 'atdPol', label: 'ATD POL' },
      { id: 'etaPodIntlShipping', label: 'ETA POD' },
      { id: 'ataPodIntlShipping', label: 'ATA POD' },
      { id: 'otdIntlShipping', label: 'OTD' },
    ],
  },
  {
    id: 'scheduleDestInland',
    label: 'Schedule - Dest. Inland',
    children: [
      { id: 'etdPodDestInland', label: 'ETD POD' },
      { id: 'etaCc', label: 'ETA C/C' },
      { id: 'ataCc', label: 'ATA C/C' },
      { id: 'otdDestInland', label: 'OTD' },
    ],
  },
]

const tableRows: Record<string, unknown>[] = []
</script>

<style scoped lang="scss">
.shipping-detail__combo-field {
  display: flex;
  align-items: center;
  gap: $spacing-sm;
  flex-shrink: 0;
}

</style>
