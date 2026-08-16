<template>
  <div class="pipeline-stage-edit-table">
    <div class="pipeline-stage-edit-table__scroll">
      <table class="pipeline-stage-edit-table__table">
        <thead>
          <tr>
            <th class="pipeline-stage-edit-table__th pipeline-stage-edit-table__th--label">Stage</th>
            <th v-for="week in weekLabels" :key="week" class="pipeline-stage-edit-table__th">{{ week }}</th>
          </tr>
        </thead>

        <tbody>
          <tr v-for="row in rows" :key="row.key">
            <th class="pipeline-stage-edit-table__th pipeline-stage-edit-table__th--label">
              <span class="pipeline-stage-edit-table__row-label">
                <span class="pipeline-stage-edit-table__dot" :style="{ background: row.color }"></span>
                {{ row.label }}
              </span>
            </th>
            <td v-for="(value, weekIndex) in row.values" :key="weekIndex" class="pipeline-stage-edit-table__td">
              <input
                type="number"
                min="0"
                class="pipeline-stage-edit-table__input"
                :value="value"
                @change="handleChange(row.key, weekIndex, $event)"
              />
            </td>
          </tr>
        </tbody>

        <tfoot>
          <tr>
            <th class="pipeline-stage-edit-table__th pipeline-stage-edit-table__th--label">
              Total{{ unit ? ` (${unit})` : '' }}
            </th>
            <td v-for="(total, weekIndex) in weekTotals" :key="weekIndex" class="pipeline-stage-edit-table__td pipeline-stage-edit-table__td--total">
              {{ total }}
            </td>
          </tr>
        </tfoot>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
// 누적 막대(단계 × 주) 값을 직접 고칠 수 있는 표입니다. DataTable은 컬럼 정의 기반의
// 읽기 전용 리스트라 이런 "숫자 행렬 편집" 용도엔 맞지 않아서, 같은 시각 언어($color-border,
// $color-bg-muted 등)만 맞춰 별도로 만들었습니다. 셀 값을 바꾸면 부모가 실제 데이터(그리고
// 그 데이터를 쓰는 차트)를 갱신할 수 있도록 'update' 이벤트만 올려보내고, 상태 자체는
// 들고 있지 않습니다.
import { computed } from 'vue'

export interface EditableStageRow {
  key: string
  label: string
  color: string
  values: number[]
}

interface Props {
  weekLabels: string[]
  rows: EditableStageRow[]
  /** 합계 행 헤더에 "Total (Day)"처럼 붙일 단위 텍스트 */
  unit?: string
}

const props = withDefaults(defineProps<Props>(), {
  unit: undefined,
})

const emit = defineEmits<{
  (e: 'update', payload: { rowKey: string; weekIndex: number; value: number }): void
}>()

const weekTotals = computed(() =>
  props.weekLabels.map((_, weekIndex) =>
    props.rows.reduce((sum, row) => sum + (row.values[weekIndex] ?? 0), 0),
  ),
)

function handleChange(rowKey: string, weekIndex: number, event: Event): void {
  const raw = (event.target as HTMLInputElement).valueAsNumber
  const value = Number.isFinite(raw) ? Math.max(0, Math.round(raw)) : 0
  emit('update', { rowKey, weekIndex, value })
}
</script>

<style scoped lang="scss">
.pipeline-stage-edit-table__scroll {
  overflow-x: auto;
}

.pipeline-stage-edit-table__table {
  width: 100%;
  border-collapse: collapse;
}

.pipeline-stage-edit-table__th {
  padding: $spacing-sm;
  background: $color-bg-muted;
  border: 1px solid $color-border;
  font-size: $font-size-xs;
  font-weight: $font-weight-bold;
  color: $color-text;
  text-align: center;
  white-space: nowrap;

  &--label {
    text-align: left;
    position: sticky;
    left: 0;
    z-index: 1;
  }
}

.pipeline-stage-edit-table__row-label {
  display: inline-flex;
  align-items: center;
  gap: $spacing-xs;
  font-size: $font-size-sm;
}

.pipeline-stage-edit-table__dot {
  width: 8px;
  height: 8px;
  flex-shrink: 0;
  border-radius: $radius-full;
}

.pipeline-stage-edit-table__td {
  padding: 4px;
  border: 1px solid $color-border;
  background: $color-bg;
  text-align: center;

  &--total {
    background: $color-bg-muted;
    font-size: $font-size-sm;
    font-weight: $font-weight-extrabold;
    color: $color-text;
  }
}

.pipeline-stage-edit-table__input {
  width: 56px;
  padding: 6px 4px;
  border: 1px solid transparent;
  border-radius: $radius-sm;
  background: transparent;
  font-family: inherit;
  font-size: $font-size-sm;
  color: $color-text;
  text-align: center;

  &:hover {
    border-color: $color-border;
  }

  &:focus {
    outline: none;
    border-color: $color-primary;
    background: $color-bg;
  }

  // 숫자 입력 스피너(위/아래 화살표)는 좁은 셀에서 방해가 되므로 숨깁니다.
  &::-webkit-outer-spin-button,
  &::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }

  &[type='number'] {
    -moz-appearance: textfield;
  }
}
</style>
