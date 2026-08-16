<template>
  <button type="button" class="excel-export-button" @click="handleClick">
    <span class="excel-export-button__icon" v-html="excelIcon"></span>
    <span class="excel-export-button__label">Export to Excel</span>
  </button>
</template>

<script setup lang="ts">
// ExcelExportDropdown과 달리 Current/History 선택 없이, 누르면 바로 현재 조회된
// 데이터를 엑셀로 내려받는 단순 버튼입니다.
import * as XLSX from 'xlsx'
import excelIcon from '@/assets/icons/excel-icon.svg?raw'

interface Props {
  /** Data Table에 표시 중인 현재 데이터 (row 배열) */
  data: Record<string, unknown>[]
  /** 다운로드 파일명 */
  fileName?: string
}

const props = withDefaults(defineProps<Props>(), {
  fileName: 'export',
})

const emit = defineEmits<{
  (e: 'export', rows: Record<string, unknown>[]): void
}>()

function handleClick(): void {
  if (!props.data.length) return

  const worksheet = XLSX.utils.json_to_sheet(props.data)
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1')
  XLSX.writeFile(workbook, `${props.fileName}.xlsx`)

  emit('export', props.data)
}
</script>

<style scoped lang="scss">
.excel-export-button {
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
    background-color 0.15s ease;

  &:hover {
    background: $color-bg-secondary;
  }

  &:focus {
    outline: none;
    border-color: $color-primary;
  }
}

.excel-export-button__icon {
  display: flex;
  width: 16px;
  height: 16px;
  flex-shrink: 0;
}

.excel-export-button__label {
  font-size: $font-size-sm;
  font-weight: $font-weight-bold;
  color: $color-text;
  white-space: nowrap;
}
</style>
