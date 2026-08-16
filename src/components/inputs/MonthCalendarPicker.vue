<template>
  <div class="month-calendar-picker">
    <div class="month-calendar-picker__header">
      <button
        type="button"
        class="month-calendar-picker__nav"
        aria-label="이전 해"
        @click="goToPrevYear"
      >
        <span class="month-calendar-picker__nav-icon month-calendar-picker__nav-icon--prev" v-html="chevronIcon"></span>
      </button>

      <span class="month-calendar-picker__title">{{ viewYear }}</span>

      <button
        type="button"
        class="month-calendar-picker__nav"
        aria-label="다음 해"
        :disabled="isNextYearDisabled"
        @click="goToNextYear"
      >
        <span class="month-calendar-picker__nav-icon" v-html="chevronIcon"></span>
      </button>
    </div>

    <div class="month-calendar-picker__grid" @mouseleave="hoveredDate = null">
      <button
        v-for="cell in monthCells"
        :key="cell.key"
        type="button"
        class="month-calendar-picker__month"
        :class="{
          'month-calendar-picker__month--selected': cell.isSelected,
          'month-calendar-picker__month--in-range': cell.isInRange,
          'month-calendar-picker__month--range-start': cell.isRangeStart,
          'month-calendar-picker__month--range-end': cell.isRangeEnd,
          'month-calendar-picker__month--preview': cell.isPreview,
        }"
        @click="selectMonth(cell.date)"
        @mouseenter="handleMonthHover(cell.date)"
      >
        <span class="month-calendar-picker__month-label">{{ cell.label }}</span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
// 년(Year) 단위로 넘기면서 월(Month)만 골라 범위를 선택하는 달력. CalendarPicker(일 단위)와
// 같은 "시작 → 종료 순서로 클릭하면 밴드로 이어지는" 상호작용 방식을 그대로 따르되,
// 칸이 날짜 대신 월(1일 기준 Date)로 되어 있습니다.
import { ref, computed } from 'vue'
import chevronIcon from '@/assets/icons/chevron.svg?raw'

interface Props {
  minDate?: Date | null
  maxDate?: Date | null
  /** 확정된 시작월 */
  rangeStart?: Date | null
  /** 확정된 종료월. 아직 안 골랐으면 null(호버 중인 월까지 미리보기 밴드 표시) */
  rangeEnd?: Date | null
}

const props = withDefaults(defineProps<Props>(), {
  minDate: null,
  maxDate: null,
  rangeStart: null,
  rangeEnd: null,
})

const emit = defineEmits<{
  (e: 'select', date: Date): void
}>()

interface MonthCell {
  key: string
  date: Date
  label: string
  isSelected: boolean
  isRangeStart: boolean
  isRangeEnd: boolean
  isInRange: boolean
  isPreview: boolean
}

const monthLabels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const hoveredDate = ref<Date | null>(null)

const today = new Date()
const viewYear = ref(props.rangeStart ? props.rangeStart.getFullYear() : today.getFullYear())

function isSameMonth(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth()
}

function handleMonthHover(date: Date): void {
  if (!props.rangeStart || props.rangeEnd) return
  hoveredDate.value = date
}

// 범위 밴드를 그릴 [시작, 끝] 경계. 종료월이 아직 없으면 hover 중인 월로 미리보기.
const rangeBounds = computed<{ from: Date | null; to: Date | null; isPreview: boolean }>(() => {
  if (!props.rangeStart) return { from: null, to: null, isPreview: false }

  const end = props.rangeEnd ?? hoveredDate.value
  if (!end) return { from: props.rangeStart, to: null, isPreview: false }

  const isPreview = !props.rangeEnd
  return props.rangeStart <= end
    ? { from: props.rangeStart, to: end, isPreview }
    : { from: end, to: props.rangeStart, isPreview }
})

const monthCells = computed<MonthCell[]>(() => {
  const bounds = rangeBounds.value

  return monthLabels.map((label, monthIndex) => {
    const date = new Date(viewYear.value, monthIndex, 1)

    const isRangeStart = !!bounds.from && isSameMonth(date, bounds.from)
    const isRangeEnd = !!bounds.to && isSameMonth(date, bounds.to)
    const isInRange = !!bounds.from && !!bounds.to && date > bounds.from && date < bounds.to

    return {
      key: `${date.getFullYear()}-${date.getMonth()}`,
      date,
      label,
      isSelected: isRangeStart || isRangeEnd,
      isRangeStart,
      isRangeEnd,
      isInRange,
      isPreview: bounds.isPreview && (isRangeStart || isRangeEnd || isInRange),
    }
  })
})

const isNextYearDisabled = computed(() => {
  if (!props.maxDate) return false
  return viewYear.value + 1 > props.maxDate.getFullYear()
})

function goToPrevYear(): void {
  viewYear.value -= 1
}

function goToNextYear(): void {
  if (isNextYearDisabled.value) return
  viewYear.value += 1
}

function selectMonth(date: Date): void {
  emit('select', date)
}
</script>

<style scoped lang="scss">
.month-calendar-picker {
  width: 280px;
  padding: $spacing-md;
  background: $color-bg;
  border: 1px solid $color-border;
  border-radius: $radius-md;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);

  &__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: $spacing-sm;
  }

  &__nav {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 28px;
    height: 28px;
    padding: 0;
    border: none;
    border-radius: $radius-sm;
    background: transparent;
    cursor: pointer;

    &:hover:not(:disabled) {
      background: $hover-bg;
    }

    &:disabled {
      opacity: 0.3;
      cursor: not-allowed;
    }
  }

  &__nav-icon {
    display: flex;
    width: 14px;
    height: 14px;
    color: $color-text;

    &--prev {
      transform: rotate(180deg);
    }
  }

  &__title {
    font-size: $font-size-sm;
    font-weight: $font-weight-bold;
    color: $color-text;
  }

  &__grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: $spacing-sm $spacing-xs;
  }

  &__month {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    height: 40px;
    border: none;
    background: transparent;
    cursor: pointer;

    // 범위 밴드 배경(연속된 칸이면 서로 맞닿아 하나로 이어져 보임)
    &::before {
      content: '';
      position: absolute;
      inset: 2px 0;
      z-index: 0;
      background: transparent;
    }

    &:hover .month-calendar-picker__month-label {
      background: $hover-bg;
    }

    &--in-range::before {
      background: rgba($color-primary, 0.12);
    }

    &--range-start::before {
      left: 50%;
      background: rgba($color-primary, 0.12);
    }

    &--range-end::before {
      right: 50%;
      background: rgba($color-primary, 0.12);
    }

    &--range-start.month-calendar-picker__month--range-end::before {
      background: transparent;
    }

    &--range-start .month-calendar-picker__month-label,
    &--range-end .month-calendar-picker__month-label {
      background: $color-primary;
      color: $color-bg;
      font-weight: $font-weight-bold;
    }

    // 종료월을 아직 안 골라서 hover로 미리보기 중인 상태: 점선/옅은 톤으로 구분
    &--preview {
      &::before {
        opacity: 0.6;
      }

      &.month-calendar-picker__month--range-start .month-calendar-picker__month-label,
      &.month-calendar-picker__month--range-end .month-calendar-picker__month-label {
        background: transparent;
        border: 1.5px dashed $color-primary;
        color: $color-primary;
      }
    }
  }

  &__month-label {
    position: relative;
    z-index: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
    border-radius: $radius-sm;
    font-size: $font-size-sm;
    color: $color-text;
    transition:
      background-color 0.1s ease,
      color 0.1s ease;
  }
}
</style>
