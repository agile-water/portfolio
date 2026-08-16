<template>
  <div class="lead-time-route-table">
    <div class="lead-time-route-table__header">
      <span class="lead-time-route-table__cell lead-time-route-table__cell--route">Route</span>
      <span class="lead-time-route-table__cell">Min</span>
      <span class="lead-time-route-table__cell">Avg</span>
      <span class="lead-time-route-table__cell">Max</span>
      <span class="lead-time-route-table__cell"># of CNTRs</span>
      <span class="lead-time-route-table__cell"># of Cases</span>
    </div>

    <div class="lead-time-route-table__body">
      <div
        v-for="row in rows"
        :key="row.id"
        class="lead-time-route-table__row"
        :class="{ 'lead-time-route-table__row--selected': row.id === selectedId }"
        role="button"
        tabindex="0"
        :aria-pressed="row.id === selectedId"
        @click="emit('select', row.id)"
        @keydown.enter="emit('select', row.id)"
      >
        <span class="lead-time-route-table__cell lead-time-route-table__cell--route">
          <TransportModeIcon :mode="row.mode" size="40px" />
          <span class="lead-time-route-table__route-name">{{ row.route }}</span>
        </span>

        <span class="lead-time-route-table__cell text-numeric">{{ formatDay(row.min) }}</span>
        <span class="lead-time-route-table__cell text-numeric">{{ formatDay(row.avg) }}</span>
        <span class="lead-time-route-table__cell text-numeric">{{ formatDay(row.max) }}</span>

        <span class="lead-time-route-table__cell text-numeric">
          {{ row.containers !== null ? formatNumber(row.containers) : '-' }}
        </span>
        <span class="lead-time-route-table__cell text-numeric">{{ formatNumber(row.cases) }}</span>
      </div>

      <p v-if="rows.length === 0" class="lead-time-route-table__empty">{{ emptyMessage }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
// Route별 Min/Avg/Max 리드타임(일)을 스크롤 가능한 리스트로 보여줍니다.
// RouteDeliveryTable(ETA Accuracy)과 같은 "Route + 지표 리스트" 형태를 공유하지만,
// 신호등(상태) 컬럼과 하이퍼링크 클릭 지표가 없는 Lead Time Analysis 전용 버전입니다.
import TransportModeIcon, { type TransportMode } from '@/components/badges/TransportModeIcon.vue'

export interface LeadTimeRouteRow {
  id: string
  route: string
  mode: TransportMode
  /** 최소 리드타임(일) */
  min: number
  /** 평균 리드타임(일) */
  avg: number
  /** 최대 리드타임(일) */
  max: number
  /** 컨테이너 수. 없으면 '-'로 표시 */
  containers: number | null
  cases: number
}

interface Props {
  rows: LeadTimeRouteRow[]
  emptyMessage?: string
  /** 현재 선택된 행의 id. 해당 행이 강조 표시됩니다. */
  selectedId?: string | null
}

withDefaults(defineProps<Props>(), {
  emptyMessage: '데이터가 없습니다.',
  selectedId: null,
})

const emit = defineEmits<{
  /** 행(운송수단 아이콘/Route 이름 영역 등)을 클릭해 그 행을 선택했을 때 */
  (e: 'select', rowId: string): void
}>()

function formatDay(value: number): string {
  return value.toFixed(1)
}

function formatNumber(value: number): string {
  return value.toLocaleString()
}
</script>

<style scoped lang="scss">
$grid-columns: minmax(0, 1fr) 76px 76px 76px 104px 104px;

.lead-time-route-table {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.lead-time-route-table__header {
  display: grid;
  grid-template-columns: $grid-columns;
  padding-bottom: 0;
  font-size: $font-size-sm;
  font-weight: $font-weight-extrabold;
  color: $color-text;

  // 컬럼 헤더는 값 정렬(우측)과 달리 항상 가운데 정렬합니다.
  .lead-time-route-table__cell:not(.lead-time-route-table__cell--route) {
    justify-content: center;
    text-align: center;
  }
}

.lead-time-route-table__body {
  max-height: 560px;
  overflow-y: auto;

  &::-webkit-scrollbar {
    width: 4px;
  }
  &::-webkit-scrollbar-thumb {
    background: $color-border;
    border-radius: 2px;
  }
}

.lead-time-route-table__row {
  display: grid;
  grid-template-columns: $grid-columns;
  align-items: center;
  border-radius: $radius-sm;
  cursor: pointer;
  transition: background-color 0.15s ease;

  &:hover {
    background: $color-bg-secondary;
  }

  &:focus-visible {
    outline: 2px solid $color-primary;
    outline-offset: -2px;
  }

  // 선택된 행은 옅은 primary 배경 + 좌측 강조 바로 표시합니다(레이아웃에 영향 없는 inset box-shadow 사용).
  &--selected {
    background: rgba($color-primary, 0.06);
    box-shadow: inset 3px 0 0 0 $color-primary;

    &:hover {
      background: rgba($color-primary, 0.09);
    }
  }

  // 데이터 행은 56px(기본값)을 유지합니다.
  .lead-time-route-table__cell {
    height: 56px;
  }
}

.lead-time-route-table__cell {
  position: relative;
  display: flex;
  align-items: center;
  min-width: 0;
  height: 44px;
  padding: 0 $spacing-sm;
  font-size: $font-size-sm;
  color: $color-text;

  // 칸 사이 구분선은 셀 전체 높이 대신 12px 높이로 가운데에만 짧게 그립니다.
  &:not(:first-child)::before {
    content: '';
    position: absolute;
    left: 0;
    top: 50%;
    width: 1px;
    height: 12px;
    transform: translateY(-50%);
    background: $color-border;
  }

  &--route {
    gap: $spacing-sm;
    padding-left: 0;
  }
}

.lead-time-route-table__route-name {
  overflow: hidden;
  font-weight: $font-weight-bold;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.lead-time-route-table__empty {
  padding: $spacing-xl 0;
  text-align: center;
  font-size: $font-size-sm;
  color: $color-text-muted;
}
</style>
