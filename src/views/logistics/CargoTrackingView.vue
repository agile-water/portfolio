<template>
  <DefaultLayout full-bleed>
    <MapCanvas>
      <MapboxMap style-url="mapbox://styles/mapbox/streets-v12" />

      <template #topBar>
        <FilterBar>
          <DropdownSelect
            v-model="filters.customer"
            label="Customer"
            placeholder="Select customer"
            :options="customerOptions"
          />

          <div class="cargo-tracking__combo-field">
            <CompactSelect v-model="filters.searchField" :options="searchFieldOptions" />
            <TextField v-model="filters.searchValue" placeholder="Search" />
          </div>

          <template #actions>
            <SecondaryButton @click="handleReset">Reset</SecondaryButton>
            <PrimaryButton @click="handleSearch">Search</PrimaryButton>
          </template>
        </FilterBar>
      </template>

      <template #controls>
        <InfoTooltipButton />
      </template>
    </MapCanvas>
  </DefaultLayout>
</template>

<script setup lang="ts">
import { reactive } from 'vue'

import DefaultLayout from '@/components/layouts/DefaultLayout.vue'
import MapCanvas from '@/components/layouts/MapCanvas.vue'
import MapboxMap from '@/components/map/MapboxMap.vue'
import FilterBar from '@/components/filters/FilterBar.vue'
import DropdownSelect from '@/components/inputs/DropdownSelect.vue'
import CompactSelect, { type CompactSelectOption } from '@/components/inputs/CompactSelect.vue'
import TextField from '@/components/inputs/TextField.vue'
import SecondaryButton from '@/components/buttons/SecondaryButton.vue'
import PrimaryButton from '@/components/buttons/PrimaryButton.vue'
import InfoTooltipButton from '@/components/buttons/InfoTooltipButton.vue'

/* --------------------------------- Filters --------------------------------- */
// TODO: 실제 데이터 연동 시 옵션들을 API 응답으로 교체
const customerOptions = ['[HB] HMMA', '[HC] HMMC', '[KG] KaGA', '[KS] KaSK']

const searchFieldOptions: CompactSelectOption[] = [
  { label: 'CNTR', value: 'cntr' },
  { label: 'Vessel', value: 'vessel' },
  { label: 'MHB/L', value: 'mhbl' },
  { label: 'Invoice', value: 'invoice' },
]

const filters = reactive({
  customer: '',
  searchField: 'cntr',
  searchValue: '',
})

function handleReset(): void {
  filters.customer = ''
  filters.searchField = 'cntr'
  filters.searchValue = ''
}

function handleSearch(): void {
  // TODO: 실제 검색 API 연동. searchField(CNTR/Vessel/MHB·L/Invoice) 기준으로 지도에 해당 화물 위치 표시
  console.log('search cargo tracking', { ...filters })
}
</script>

<style scoped lang="scss">
.cargo-tracking__combo-field {
  display: flex;
  align-items: center;
  gap: $spacing-sm;
  flex-shrink: 0;
}

// 지도 위에 떠 있는 필터바이므로, 다른 드롭다운/팝오버와 동일한 전역 그림자를 입혀
// 배경과 분리되어 보이도록 합니다.
:deep(.filter-bar) {
  box-shadow: $shadow-elevated;
}
</style>
