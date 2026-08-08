<template>
  <div class="data-table">
    <div class="data-table__toolbar">
      <p class="data-table__total">
        Total <span class="data-table__total-count">{{ rows.length }}</span> Row(s)
      </p>
      <div class="data-table__toolbar-actions">
        <ExcelExportDropdown :data="rows" file-name="data-table" />
        <slot name="actions" />
      </div>
    </div>

    <div class="data-table__scroll">
      <table class="data-table__table">
        <thead>
          <tr>
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
              <span class="data-table__filter-box">
                <input type="text" class="data-table__filter-input" />
                <span class="data-table__filter-icon" v-html="filterIcon"></span>
              </span>
            </th>
          </tr>
        </thead>

        <tbody v-if="rows.length">
          <tr v-for="(row, index) in rows" :key="index">
            <td v-for="column in leafColumns" :key="column.id" class="data-table__td">
              {{ row[column.id] }}
            </td>
          </tr>
        </tbody>
        <tbody v-else>
          <tr>
            <td :colspan="leafColumns.length" class="data-table__empty">
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

export interface DataTableLeafColumn {
  id: string
  label: string
  hasMenu?: boolean
}

export interface DataTableColumn extends DataTableLeafColumn {
  children?: DataTableLeafColumn[]
}

interface Props {
  columns: DataTableColumn[]
  rows?: Record<string, unknown>[]
  emptyMessage?: string
}

const props = withDefaults(defineProps<Props>(), {
  rows: () => [],
  emptyMessage: 'No results found.',
})

const leafColumns = computed<DataTableLeafColumn[]>(() =>
  props.columns.flatMap((column) => column.children ?? [column]),
)

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

.data-table__total {
  margin: 0;
  font-size: $font-size-sm;
  color: $color-text;
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

.data-table__empty {
  padding: $spacing-xl 0;
  border: 1px solid $color-border;
  background: $color-bg;
}
</style>
