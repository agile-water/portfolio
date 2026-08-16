<template>
  <div class="route-delivery-table">
    <div class="route-delivery-table__header">
      <span class="route-delivery-table__cell route-delivery-table__cell--route">Route</span>
      <span class="route-delivery-table__cell">Early</span>
      <span class="route-delivery-table__cell">On-Time</span>
      <span class="route-delivery-table__cell">Late</span>
      <span class="route-delivery-table__cell"># of CNTRs</span>
      <span class="route-delivery-table__cell"># of Cases</span>
    </div>

    <div class="route-delivery-table__body">
      <div
        v-for="row in rows"
        :key="row.id"
        class="route-delivery-table__row"
        :class="{ 'route-delivery-table__row--selected': row.id === selectedId }"
        role="button"
        tabindex="0"
        :aria-pressed="row.id === selectedId"
        @click="emit('select', row.id)"
        @keydown.enter="emit('select', row.id)"
      >
        <span class="route-delivery-table__cell route-delivery-table__cell--route">
          <TransportModeIcon :mode="row.mode" size="40px" />
          <span class="route-delivery-table__route-name">{{ row.route }}</span>
        </span>

        <span class="route-delivery-table__cell text-numeric">
          <button
            type="button"
            class="route-delivery-table__link link-text"
            @click.stop="emit('metric-click', { rowId: row.id, metric: 'early' })"
          >
            {{ formatPercent(row.early) }}
          </button>
        </span>

        <span class="route-delivery-table__cell text-numeric">
          <button
            type="button"
            class="route-delivery-table__link link-text"
            @click.stop="emit('metric-click', { rowId: row.id, metric: 'onTime' })"
          >
            {{ formatPercent(row.onTime) }}
          </button>
        </span>

        <span class="route-delivery-table__cell route-delivery-table__cell--late text-numeric">
          <StatusDot :tone="row.status" />
          <button
            type="button"
            class="route-delivery-table__link link-text"
            @click.stop="emit('metric-click', { rowId: row.id, metric: 'late' })"
          >
            {{ formatPercent(row.late) }}
          </button>
        </span>

        <span class="route-delivery-table__cell text-numeric">
          {{ row.containers !== null ? formatNumber(row.containers) : '-' }}
        </span>
        <span class="route-delivery-table__cell text-numeric">{{ formatNumber(row.cases) }}</span>
      </div>

      <p v-if="rows.length === 0" class="route-delivery-table__empty">{{ emptyMessage }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
// Route별 Early/On-Time/Late 실적을 스크롤 가능한 리스트로 보여줍니다.
// ETA Accuracy 전용이 아니라, Lead Time Analysis 등 같은 "Route + 지표" 형태의
// 다른 Data Analysis 화면에서도 재사용할 수 있도록 범용적으로 설계했습니다.
import TransportModeIcon, { type TransportMode } from '@/components/badges/TransportModeIcon.vue'
import StatusDot, { type StatusDotTone } from '@/components/badges/StatusDot.vue'

export interface RouteDeliveryRow {
  id: string
  route: string
  mode: TransportMode
  /** Early 도착 비율(%) */
  early: number
  /** 정시 도착 비율(%) */
  onTime: number
  /** 지연 도착 비율(%) */
  late: number
  /** Late 값 앞에 표시할 상태 dot 색상 */
  status: StatusDotTone
  /** 컨테이너 수. 없으면 '-'로 표시 */
  containers: number | null
  cases: number
}

interface Props {
  rows: RouteDeliveryRow[]
  emptyMessage?: string
  /** 현재 선택된 행의 id. 해당 행이 강조 표시됩니다. */
  selectedId?: string | null
}

withDefaults(defineProps<Props>(), {
  emptyMessage: '데이터가 없습니다.',
  selectedId: null,
})

const emit = defineEmits<{
  (e: 'metric-click', payload: { rowId: string; metric: 'early' | 'onTime' | 'late' }): void
  /** 행 자체(운송수단 아이콘/Route 이름 영역 등)를 클릭해 그 행을 선택했을 때 */
  (e: 'select', rowId: string): void
}>()

function formatPercent(value: number): string {
  return `${value.toFixed(1)}%`
}

function formatNumber(value: number): string {
  return value.toLocaleString()
}
</script>

<style scoped lang="scss">
$grid-columns: minmax(0, 1fr) 76px 90px 90px 104px 104px;

.route-delivery-table {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.route-delivery-table__header {
  display: grid;
  grid-template-columns: $grid-columns;
  padding-bottom: 0;
  font-size: $font-size-sm;
  font-weight: $font-weight-extrabold;
  color: $color-text;

  // 컬럼 헤더는 값 정렬(우측)과 달리 항상 가운데 정렬합니다.
  .route-delivery-table__cell:not(.route-delivery-table__cell--route) {
    justify-content: center;
    text-align: center;
  }
}

.route-delivery-table__body {
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

.route-delivery-table__row {
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
  .route-delivery-table__cell {
    height: 56px;
  }
}

.route-delivery-table__cell {
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

  &--late {
    gap: $spacing-xs;
    font-weight: $font-weight-bold;
  }
}

.route-delivery-table__route-name {
  overflow: hidden;
  font-weight: $font-weight-bold;
  white-space: nowrap;
  text-overflow: ellipsis;
}

// 색/밑줄은 전역 스타일 .link-text가 담당하고, 여기서는 버튼 기본 스타일만 초기화합니다.
.route-delivery-table__link {
  padding: 0;
  border: none;
  background: none;
  font: inherit;
  font-weight: $font-weight-bold;
}

.route-delivery-table__empty {
  padding: $spacing-xl 0;
  text-align: center;
  font-size: $font-size-sm;
  color: $color-text-muted;
}
</style>
