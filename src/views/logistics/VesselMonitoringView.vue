<template>
  <DefaultLayout full-bleed>
    <MapCanvas>
      <MapboxMap :show3DToggle="false" />

      <template #controls>
        <InfoTooltipButton />
      </template>

      <template #toolbar>
        <DropdownSelect
          v-model="filters.customer"
          label=""
          placeholder="Select customer"
          :options="customerOptions"
          width="380px"
        >
          <template #suffix>
            <span class="vessel-monitoring__suffix">
              <span class="vessel-monitoring__divider" />
              <IconButton
                bare
                size="sm"
                tone="muted"
                :icon="searchIcon"
                label="검색"
                @click="handleSearch"
              />
              <span class="vessel-monitoring__divider" />
              <IconButton
                bare
                size="sm"
                tone="muted"
                :icon="refreshIcon"
                label="초기화"
                @click="handleReset"
              />
            </span>
          </template>
        </DropdownSelect>

        <TabToggle v-model="transportMode" :options="transportModeOptions" />
      </template>
    </MapCanvas>
  </DefaultLayout>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'

import DefaultLayout from '@/components/layouts/DefaultLayout.vue'
import MapCanvas from '@/components/layouts/MapCanvas.vue'
import MapboxMap from '@/components/map/MapboxMap.vue'
import DropdownSelect from '@/components/inputs/DropdownSelect.vue'
import IconButton from '@/components/buttons/IconButton.vue'
import InfoTooltipButton from '@/components/buttons/InfoTooltipButton.vue'
import TabToggle, { type TabToggleOption } from '@/components/tabs/TabToggle.vue'

import searchIcon from '@/assets/icons/search-outline.svg?raw'
import refreshIcon from '@/assets/icons/refresh.svg?raw'
import seaIcon from '@/assets/icons/sea-filled.svg?raw'
import airIcon from '@/assets/icons/air.svg?raw'

/* --------------------------------- Filters --------------------------------- */
// TODO: 실제 데이터 연동 시 옵션들을 API 응답으로 교체
const customerOptions = ['[HB] HMMA', '[HC] HMMC', '[KG] KaGA', '[KS] KaSK']

const filters = reactive({
  customer: '',
})

const transportModeOptions: TabToggleOption[] = [
  { label: 'SEA', value: 'sea', icon: seaIcon },
  { label: 'AIR', value: 'air', icon: airIcon },
]
const transportMode = ref('sea')

function handleSearch(): void {
  // TODO: 실제 검색 API 연동. 선택한 Customer/운송 모드 기준으로 지도에 선박/항공편 마커 표시
  console.log('search vessel monitoring', {
    customer: filters.customer,
    transportMode: transportMode.value,
  })
}

function handleReset(): void {
  filters.customer = ''
  transportMode.value = 'sea'
}
</script>

<style scoped lang="scss">
.vessel-monitoring__suffix {
  display: flex;
  align-items: center;
  gap: $spacing-sm;
  margin-left: $spacing-sm;
  flex-shrink: 0;
}

.vessel-monitoring__divider {
  width: 1px;
  height: 22px;
  background: $color-border;
  flex-shrink: 0;
}
</style>
