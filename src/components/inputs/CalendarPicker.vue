<template>
  <div class="calendar-picker">
    <div class="calendar-picker__header">
      <button
        type="button"
        class="calendar-picker__nav"
        aria-label="이전 달"
        @click="goToPrevMonth"
      >
        <span class="calendar-picker__nav-icon calendar-picker__nav-icon--prev" v-html="chevronIcon"></span>
      </button>

      <span class="calendar-picker__title">{{ headerLabel }}</span>

      <button
        type="button"
        class="calendar-picker__nav"
        aria-label="다음 달"
        :disabled="isNextDisabled"
        @click="goToNextMonth"
      >
        <span class="calendar-picker__nav-icon" v-html="chevronIcon"></span>
      </button>
    </div>

    <div class="calendar-picker__weekdays">
      <span v-for="label in weekdayLabels" :key="label">{{ label }}</span>
    </div>

    <div class="calendar-picker__grid" @mouseleave="hoveredDate = null">
      <button
        v-for="cell in calendarCells"
        :key="cell.key"
        type="button"
        class="calendar-picker__day"
        :class="{
          'calendar-picker__day--outside': !cell.isCurrentMonth,
          'calendar-picker__day--selected': cell.isSelected,
          'calendar-picker__day--today': cell.isToday,
          'calendar-picker__day--in-range': cell.isInRange,
          'calendar-picker__day--range-start': cell.isRangeStart,
          'calendar-picker__day--range-end': cell.isRangeEnd,
          'calendar-picker__day--preview': cell.isPreview,
        }"
        :disabled="cell.isDisabled"
        @click="selectDay(cell.date)"
        @mouseenter="handleDayHover(cell.date)"
      >
        <span class="calendar-picker__day-label">{{ cell.date.getDate() }}</span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
// 재사용 가능한 달력 UI. History Data 조회처럼 특정 날짜 하나를 선택해야 하는
// 곳이라면 어디서든 v-model로 붙여 쓸 수 있습니다.
import { ref, computed } from 'vue'
import chevronIcon from '@/assets/icons/chevron.svg?raw'

interface Props {
  modelValue?: Date | null
  minDate?: Date | null
  maxDate?: Date | null
  /** true면 범위 선택 모드로 동작합니다. rangeStart~rangeEnd 사이가 밴드로 이어져 보입니다. */
  range?: boolean
  /** 범위 모드에서 확정된 시작일 */
  rangeStart?: Date | null
  /** 범위 모드에서 확정된 종료일. 아직 안 골랐으면 null(호버 중인 날짜까지 미리보기 밴드 표시) */
  rangeEnd?: Date | null
  /** true를 반환하는 날짜는 선택할 수 없게 비활성화합니다(예: 월요일만 고르게 하기). */
  disabledDate?: (date: Date) => boolean
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: null,
  minDate: null,
  maxDate: null,
  range: false,
  rangeStart: null,
  rangeEnd: null,
  disabledDate: undefined,
})

const emit = defineEmits<{
  (e: 'update:modelValue', date: Date): void
  (e: 'select', date: Date): void
}>()

interface CalendarCell {
  key: string
  date: Date
  isCurrentMonth: boolean
  isSelected: boolean
  isToday: boolean
  isDisabled: boolean
  isRangeStart: boolean
  isRangeEnd: boolean
  isInRange: boolean
  isPreview: boolean
}

const today = new Date()
const weekdayLabels = ['S', 'M', 'T', 'W', 'T', 'F', 'S']
const hoveredDate = ref<Date | null>(null)

const viewDate = ref(
  props.modelValue ? new Date(props.modelValue) : props.rangeStart ? new Date(props.rangeStart) : new Date(today),
)

const headerLabel = computed(() =>
  viewDate.value.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
)

function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate()
  )
}

function isDateDisabled(date: Date): boolean {
  if (props.maxDate && date > props.maxDate) return true
  if (props.minDate && date < props.minDate) return true
  if (props.disabledDate?.(date)) return true
  return false
}

function handleDayHover(date: Date): void {
  if (!props.range || !props.rangeStart || props.rangeEnd) return
  hoveredDate.value = date
}

// 범위 모드에서 밴드를 그릴 [시작, 끝] 경계. 종료일이 아직 없으면 hover 중인 날짜로 미리보기.
const rangeBounds = computed<{ from: Date | null; to: Date | null; isPreview: boolean }>(() => {
  if (!props.range || !props.rangeStart) return { from: null, to: null, isPreview: false }

  const end = props.rangeEnd ?? hoveredDate.value
  if (!end) return { from: props.rangeStart, to: null, isPreview: false }

  const isPreview = !props.rangeEnd
  return props.rangeStart <= end
    ? { from: props.rangeStart, to: end, isPreview }
    : { from: end, to: props.rangeStart, isPreview }
})

const calendarCells = computed<CalendarCell[]>(() => {
  const year = viewDate.value.getFullYear()
  const month = viewDate.value.getMonth()

  const firstDayOfMonth = new Date(year, month, 1)
  const startOffset = firstDayOfMonth.getDay()
  const gridStart = new Date(year, month, 1 - startOffset)

  const bounds = rangeBounds.value

  const cells: CalendarCell[] = []
  for (let i = 0; i < 42; i += 1) {
    const date = new Date(gridStart)
    date.setDate(gridStart.getDate() + i)

    const isRangeStart = !!bounds.from && isSameDay(date, bounds.from)
    const isRangeEnd = !!bounds.to && isSameDay(date, bounds.to)
    const isInRange = !!bounds.from && !!bounds.to && date > bounds.from && date < bounds.to

    cells.push({
      key: `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`,
      date,
      isCurrentMonth: date.getMonth() === month,
      isSelected: !!props.modelValue && isSameDay(date, props.modelValue),
      isToday: isSameDay(date, today),
      isDisabled: isDateDisabled(date),
      isRangeStart,
      isRangeEnd,
      isInRange,
      isPreview: bounds.isPreview && (isRangeStart || isRangeEnd || isInRange),
    })
  }
  return cells
})

const isNextDisabled = computed(() => {
  if (!props.maxDate) return false
  const firstOfNextMonth = new Date(viewDate.value.getFullYear(), viewDate.value.getMonth() + 1, 1)
  return firstOfNextMonth > props.maxDate
})

function goToPrevMonth(): void {
  viewDate.value = new Date(viewDate.value.getFullYear(), viewDate.value.getMonth() - 1, 1)
}

function goToNextMonth(): void {
  if (isNextDisabled.value) return
  viewDate.value = new Date(viewDate.value.getFullYear(), viewDate.value.getMonth() + 1, 1)
}

function selectDay(date: Date): void {
  if (isDateDisabled(date)) return
  emit('update:modelValue', date)
  emit('select', date)
}
</script>

<style scoped lang="scss">
.calendar-picker {
  width: 280px;
  padding: $spacing-md;
  background: $color-bg;
  border: 1px solid $color-border;
  border-radius: $radius-sm;
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

  &__weekdays {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    margin-bottom: $spacing-xs;

    span {
      display: flex;
      align-items: center;
      justify-content: center;
      height: 24px;
      font-size: $font-size-xs;
      font-weight: $font-weight-bold;
      color: $color-text-muted;
    }
  }

  &__grid {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    row-gap: 2px;
    column-gap: 0;
  }

  &__day {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    height: 32px;
    border: none;
    background: transparent;
    font-size: $font-size-sm;
    color: $color-text;
    cursor: pointer;

    // 범위 밴드 배경(연속된 칸이면 서로 맞닿아 하나로 이어져 보임)
    &::before {
      content: '';
      position: absolute;
      inset: 0;
      z-index: 0;
      background: transparent;
    }

    &:hover:not(:disabled) .calendar-picker__day-label {
      background: $hover-bg;
    }

    &--outside {
      color: $color-placeholder;
    }

    &--today {
      font-weight: $font-weight-bold;
      color: $color-primary;
    }

    &--selected .calendar-picker__day-label {
      background: $color-primary;
      color: $color-bg;
      font-weight: $font-weight-bold;
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

    &--range-start.calendar-picker__day--range-end::before {
      background: transparent;
    }

    &--range-start .calendar-picker__day-label,
    &--range-end .calendar-picker__day-label {
      background: $color-primary;
      color: $color-bg;
      font-weight: $font-weight-bold;
    }

    // 종료일을 아직 안 골라서 hover로 미리보기 중인 상태: 점선/옅은 톤으로 구분
    &--preview {
      &::before {
        opacity: 0.6;
      }

      &.calendar-picker__day--range-start .calendar-picker__day-label,
      &.calendar-picker__day--range-end .calendar-picker__day-label {
        background: transparent;
        border: 1.5px dashed $color-primary;
        color: $color-primary;
      }
    }

    &:disabled {
      color: $color-placeholder;
      cursor: not-allowed;

      .calendar-picker__day-label {
        background: transparent;
      }
    }
  }

  &__day-label {
    position: relative;
    z-index: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 28px;
    height: 28px;
    border-radius: $radius-full;
    transition:
      background-color 0.1s ease,
      color 0.1s ease;
  }
}
</style>
