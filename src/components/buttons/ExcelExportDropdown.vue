<template>
  <div ref="wrapperRef" class="excel-export">
    <button
      type="button"
      class="excel-export__trigger"
      :class="{ 'excel-export__trigger--active': isMenuOpen || isCalendarOpen }"
      @click="toggleMenu"
    >
      <span class="excel-export__icon" v-html="excelIcon"></span>
      <span class="excel-export__label">Export to Excel</span>
      <span
        class="excel-export__chevron"
        :class="{ 'excel-export__chevron--open': isMenuOpen || isCalendarOpen }"
        v-html="chevronIcon"
      ></span>
    </button>

    <!-- 2. Current Data / History Data 드롭다운 리스트 -->
    <Transition name="dropdown">
      <ul v-if="isMenuOpen" class="excel-export__menu" role="menu">
        <li role="menuitem">
          <button type="button" class="excel-export__menu-item" @click="handleCurrentData">
            Current Data
          </button>
        </li>
        <li role="menuitem">
          <button type="button" class="excel-export__menu-item" @click="openCalendar">
            History Data
          </button>
        </li>
      </ul>
    </Transition>

    <!-- 4. History Data 선택 시 뜨는 달력 UI (재사용 컴포넌트) -->
    <Transition name="dropdown">
      <div v-if="isCalendarOpen" class="excel-export__calendar">
        <CalendarPicker :model-value="selectedDate" :max-date="today" @select="handleHistorySelect" />
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'
import * as XLSX from 'xlsx'

import CalendarPicker from '@/components/inputs/CalendarPicker.vue'
import excelIcon from '@/assets/icons/excel-icon.svg?raw'
import chevronIcon from '@/assets/icons/chevron.svg?raw'

interface Props {
  /** Data Table에 표시 중인 현재 데이터 (row 배열) */
  data: Record<string, unknown>[]
  /** 다운로드 파일명 접두어 */
  fileName?: string
  /** History Data 필터링 기준이 되는 row의 날짜 필드명 (YYYY-MM-DD 문자열) */
  historyDateField?: string
  /**
   * 선택한 날짜의 history data를 서버에서 직접 가져오고 싶을 때 사용.
   * 넘기지 않으면 data 배열을 historyDateField 기준으로 필터링합니다.
   */
  fetchHistoryData?: (date: Date) => Record<string, unknown>[] | Promise<Record<string, unknown>[]>
}

const props = withDefaults(defineProps<Props>(), {
  fileName: 'export',
  historyDateField: 'date',
  fetchHistoryData: undefined,
})

const emit = defineEmits<{
  (e: 'export-current', rows: Record<string, unknown>[]): void
  (e: 'export-history', date: Date, rows: Record<string, unknown>[]): void
}>()

const wrapperRef = ref<HTMLElement | null>(null)
const isMenuOpen = ref(false)
const isCalendarOpen = ref(false)
const selectedDate = ref<Date | null>(null)
const today = new Date()

function toggleMenu(): void {
  if (isMenuOpen.value || isCalendarOpen.value) {
    closeAll()
  } else {
    isMenuOpen.value = true
  }
}

function closeAll(): void {
  isMenuOpen.value = false
  isCalendarOpen.value = false
}

function openCalendar(): void {
  isMenuOpen.value = false
  isCalendarOpen.value = true
}

function formatDate(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

function downloadExcel(targetRows: Record<string, unknown>[], suffix: string): void {
  if (!targetRows.length) return

  const worksheet = XLSX.utils.json_to_sheet(targetRows)
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1')
  XLSX.writeFile(workbook, `${props.fileName}_${suffix}.xlsx`)
}

// 3. Current Data -> Data Table에 표시된 현재 데이터를 그대로 엑셀로 다운로드
function handleCurrentData(): void {
  downloadExcel(props.data, 'current')
  emit('export-current', props.data)
  closeAll()
}

// 4. History Data -> 달력에서 선택한 날짜에 해당하는 데이터만 엑셀로 다운로드
async function handleHistorySelect(date: Date): Promise<void> {
  selectedDate.value = date

  const targetRows = props.fetchHistoryData
    ? await props.fetchHistoryData(date)
    : props.data.filter((row) => row[props.historyDateField] === formatDate(date))

  downloadExcel(targetRows, formatDate(date))
  emit('export-history', date, targetRows)
  closeAll()
}

function handleClickOutside(event: MouseEvent): void {
  if (wrapperRef.value && !wrapperRef.value.contains(event.target as Node)) {
    closeAll()
  }
}

onMounted(() => {
  document.addEventListener('mousedown', handleClickOutside)
})

onBeforeUnmount(() => {
  document.removeEventListener('mousedown', handleClickOutside)
})
</script>

<style scoped lang="scss">
.excel-export {
  position: relative;
  display: inline-block;

  &__trigger {
    display: inline-flex;
    align-items: center;
    gap: $spacing-xs;
    height: 36px;
    padding: 0 $spacing-md;
    border: 1px solid $color-border;
    border-radius: $radius-sm;
    background: $color-bg;
    cursor: pointer;
    transition:
      border-color 0.15s ease,
      color 0.15s ease,
      background-color 0.15s ease;

    &:hover {
      color: $color-text;
      background: $color-bg-secondary;
    }

    &--active {
      border-color: $color-primary;
    }
  }

  &__icon {
    display: flex;
    width: 16px;
    height: 16px;
    flex-shrink: 0;
  }

  &__label {
    font-size: $font-size-sm;
    font-weight: $font-weight-bold;
    color: $color-text;
    white-space: nowrap;
  }

  &__chevron {
    display: flex;
    width: 12px;
    height: 12px;
    flex-shrink: 0;
    color: $color-text;
    transform: rotate(90deg);
    transition: transform 0.2s ease;

    &--open {
      transform: rotate(-90deg);
    }
  }

  &__menu {
    position: absolute;
    top: calc(100% + $spacing-xs);
    right: 0;
    z-index: 10;
    width: 100%;
    margin: 0;
    padding: 0;
    list-style: none;
    background: $color-bg;
    border: 1px solid $color-border;
    border-radius: $radius-sm;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
  }

  &__menu-item {
    display: block;
    width: 100%;
    padding: 9px 10px;
    border: none;
    border-radius: $radius-sm;
    background: transparent;
    font-size: $font-size-sm;
    color: $color-text;
    text-align: left;
    cursor: pointer;

    &:hover {
      background: $hover-bg;
    }
  }

  &__calendar {
    position: absolute;
    top: calc(100% + 8px);
    right: 0;
    z-index: 10;
  }
}

.dropdown-enter-active,
.dropdown-leave-active {
  transition:
    opacity 0.15s ease,
    transform 0.15s ease;
}

.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}
</style>
