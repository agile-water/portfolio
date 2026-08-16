<template>
  <div class="data-table">
    <div class="data-table__toolbar">
      <div class="data-table__toolbar-left">
        <p class="data-table__total">
          Total <span class="data-table__total-count">{{ rows.length }}</span> Row(s)
        </p>
        <slot name="toolbar-left" />
      </div>
      <div class="data-table__toolbar-actions">
        <slot v-if="exportable" name="export">
          <ExcelExportDropdown :data="rows" file-name="data-table" />
        </slot>
        <slot name="actions" />
      </div>
    </div>

    <div class="data-table__scroll">
      <table class="data-table__table">
        <thead>
          <tr>
            <th v-if="selectable" rowspan="3" class="data-table__th data-table__th--checkbox">
              <input
                type="checkbox"
                class="data-table__checkbox"
                aria-label="전체 선택"
                :checked="isAllSelected"
                @change="toggleSelectAll"
              />
            </th>
            <th
              v-for="column in columns"
              :key="column.id"
              :colspan="column.children ? column.children.length : 1"
              :rowspan="column.children ? 1 : 2"
              class="data-table__th"
            >
              <span class="data-table__th-content">
                <span>{{ column.label }}</span>
                <button
                  v-if="column.hasMenu !== false"
                  type="button"
                  class="data-table__menu-btn"
                  aria-label="열 옵션"
                >
                  <span v-html="moreIcon"></span>
                </button>
              </span>
            </th>
            <th v-if="showAddColumn" rowspan="3" class="data-table__th data-table__th--add">
              <IconButton :icon="addIcon" label="열 추가" size="sm" tone="muted" @click="emit('add-column')" />
            </th>
          </tr>
          <tr>
            <template v-for="column in columns" :key="`${column.id}-sub`">
              <th
                v-for="child in column.children"
                :key="child.id"
                class="data-table__th data-table__th--child"
              >
                <span class="data-table__th-content">
                  <span>{{ child.label }}</span>
                  <button
                    v-if="child.hasMenu !== false"
                    type="button"
                    class="data-table__menu-btn"
                    aria-label="열 옵션"
                  >
                    <span v-html="moreIcon"></span>
                  </button>
                </span>
              </th>
            </template>
          </tr>
          <tr>
            <th
              v-for="column in leafColumns"
              :key="`${column.id}-filter`"
              class="data-table__filter-cell"
            >
              <span v-if="column.hasFilter !== false" class="data-table__filter-box">
                <input type="text" class="data-table__filter-input" />
                <span class="data-table__filter-icon" v-html="filterIcon"></span>
              </span>
            </th>
          </tr>
        </thead>

        <tbody v-if="rows.length">
          <tr
            v-for="(row, index) in rows"
            :key="index"
            :class="[
              { 'data-table__tr--selected': selectable && isRowSelected(row, index) },
              rowClass?.(row, index),
            ]"
          >
            <td v-if="selectable" class="data-table__td data-table__td--checkbox">
              <input
                type="checkbox"
                class="data-table__checkbox"
                :aria-label="`${index + 1}번째 행 선택`"
                :checked="isRowSelected(row, index)"
                @change="toggleRow(row, index)"
              />
            </td>
            <td v-for="column in leafColumns" :key="column.id" class="data-table__td">
              <slot :name="`cell-${column.id}`" :row="row" :value="row[column.id]">
                {{ row[column.id] }}
              </slot>
            </td>
            <td v-if="showAddColumn" class="data-table__td data-table__td--add"></td>
          </tr>
        </tbody>
        <tbody v-else>
          <tr>
            <td
              :colspan="leafColumns.length + (selectable ? 1 : 0) + (showAddColumn ? 1 : 0)"
              class="data-table__empty"
            >
              <slot name="empty">
                <EmptyState :message="emptyMessage" />
              </slot>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

import EmptyState from '@/components/feedback/EmptyState.vue'
import ExcelExportDropdown from '../buttons/ExcelExportDropdown.vue'
import IconButton from '../buttons/IconButton.vue'
import addIcon from '@/assets/icons/add.svg?raw'

export interface DataTableLeafColumn {
  id: string
  label: string
  hasMenu?: boolean
  /** false면 해당 컬럼의 필터 입력창을 숨깁니다. (예: NO처럼 필터링 의미가 없는 컬럼) */
  hasFilter?: boolean
}

export interface DataTableColumn extends DataTableLeafColumn {
  children?: DataTableLeafColumn[]
}

interface Props {
  columns: DataTableColumn[]
  rows?: Record<string, unknown>[]
  emptyMessage?: string
  /** true면 각 행 앞에 체크박스 컬럼을 표시하고 행 선택을 지원합니다. */
  selectable?: boolean
  /** 선택된 행의 key 목록 (v-model:selected). rowKey를 지정하면 해당 필드 값, 아니면 행 index를 사용합니다. */
  selected?: (string | number)[]
  /** 행을 식별할 필드명. 지정하지 않으면 배열 index로 선택 상태를 관리합니다. */
  rowKey?: string
  /** false면 기본 Export 버튼(ExcelExportDropdown)과 #export 슬롯을 아예 표시하지 않습니다. */
  exportable?: boolean
  /** 행마다 추가로 적용할 클래스명을 반환합니다. (예: 경고/위험 행 배경 강조) */
  rowClass?: (row: Record<string, unknown>, index: number) => string | undefined
  /** true면 헤더 맨 끝에 컬럼 추가(+) 버튼을 표시합니다. */
  showAddColumn?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  rows: () => [],
  emptyMessage: 'No results found.',
  selectable: false,
  selected: () => [],
  rowKey: undefined,
  exportable: true,
  rowClass: undefined,
  showAddColumn: false,
})

const emit = defineEmits<{
  (e: 'update:selected', value: (string | number)[]): void
  (e: 'add-column'): void
}>()

const leafColumns = computed<DataTableLeafColumn[]>(() =>
  props.columns.flatMap((column) => column.children ?? [column]),
)

function rowKeyOf(row: Record<string, unknown>, index: number): string | number {
  if (props.rowKey && row[props.rowKey] !== undefined) {
    return row[props.rowKey] as string | number
  }
  return index
}

function isRowSelected(row: Record<string, unknown>, index: number): boolean {
  return props.selected.includes(rowKeyOf(row, index))
}

const isAllSelected = computed(
  () => props.rows.length > 0 && props.rows.every((row, index) => isRowSelected(row, index)),
)

function toggleRow(row: Record<string, unknown>, index: number): void {
  const key = rowKeyOf(row, index)
  const next = isRowSelected(row, index)
    ? props.selected.filter((selectedKey) => selectedKey !== key)
    : [...props.selected, key]
  emit('update:selected', next)
}

function toggleSelectAll(): void {
  const next = isAllSelected.value ? [] : props.rows.map((row, index) => rowKeyOf(row, index))
  emit('update:selected', next)
}

const moreIcon = `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
  <circle cx="12" cy="5" r="1.6" fill="currentColor"/>
  <circle cx="12" cy="12" r="1.6" fill="currentColor"/>
  <circle cx="12" cy="19" r="1.6" fill="currentColor"/>
</svg>`

const filterIcon = `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M4 6H20" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
  <path d="M7 12H17" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
  <path d="M10 18H14" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
</svg>`
</script>

<style scoped lang="scss">
.data-table {
  display: flex;
  flex-direction: column;
  gap: $spacing-md;
}

.data-table__toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: $spacing-md;
}

.data-table__toolbar-left {
  display: flex;
  align-items: center;
  gap: $spacing-md;
  min-width: 0;
}

.data-table__total {
  margin: 0;
  font-size: $font-size-sm;
  color: $color-text;
  white-space: nowrap;
}

.data-table__total-count {
  color: $color-primary;
  font-weight: $font-weight-bold;
}

.data-table__toolbar-actions {
  display: flex;
  align-items: center;
  gap: $spacing-sm;
  flex-shrink: 0;
}

.data-table__scroll {
  overflow-x: auto;
}

.data-table__table {
  width: 100%;
  border-collapse: collapse;

  thead tr:first-child th {
    border-top: none;
  }

  tr th:first-child,
  tr td:first-child {
    border-left: none;
  }

  tr th:last-child,
  tr td:last-child {
    border-right: none;
  }

  tbody tr:last-child td {
    border-bottom: none;
  }
}

.data-table__th {
  padding: 10px 14px;
  background: $color-bg-muted;
  border: 1px solid $color-border;
  font-size: $font-size-sm;
  font-weight: $font-weight-bold;
  color: $color-text;
  text-align: left;
  white-space: nowrap;
}

.data-table__th--child {
  background: $color-bg-muted;
}

.data-table__th-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: $spacing-sm;
}

.data-table__menu-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 18px;
  height: 18px;
  padding: 0;
  border: none;
  background: transparent;
  color: $color-text-muted;
  cursor: pointer;
  flex-shrink: 0;

  &:hover {
    color: $color-text;
  }
}

.data-table__filter-cell {
  padding: 8px 10px;
  border: 1px solid $color-border;
}

.data-table__filter-box {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 8px;
  border: 1px solid $color-border;
  border-radius: $radius-sm;
}

.data-table__filter-input {
  flex: 1;
  min-width: 0;
  border: none;
  outline: none;
  font-size: $font-size-sm;
  color: $color-text;
  background: transparent;
}

.data-table__filter-icon {
  display: flex;
  width: 14px;
  height: 14px;
  flex-shrink: 0;
  color: $color-text-muted;
}

.data-table__td {
  padding: 10px 14px;
  border: 1px solid $color-border;
  background: $color-bg;
  font-size: $font-size-sm;
  color: $color-text;
}

.data-table__th--checkbox,
.data-table__td--checkbox {
  width: 44px;
  padding: 10px;
  text-align: center;
}

.data-table__checkbox {
  width: 18px;
  height: 18px;
  accent-color: $color-text;
  cursor: pointer;
}

.data-table__tr--selected .data-table__td {
  background: $color-bg-muted;
}

.data-table__th--add,
.data-table__td--add {
  width: 44px;
  padding: 6px;
  text-align: center;
}

.data-table__empty {
  padding: $spacing-xl 0;
  border: 1px solid $color-border;
  background: $color-bg;
}
</style>
