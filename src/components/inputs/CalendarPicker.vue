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

    <div class="calendar-picker__grid">
      <button
        v-for="cell in calendarCells"
        :key="cell.key"
        type="button"
        class="calendar-picker__day"
        :class="{
          'calendar-picker__day--outside': !cell.isCurrentMonth,
          'calendar-picker__day--selected': cell.isSelected,
          'calendar-picker__day--today': cell.isToday,
        }"
        :disabled="cell.isDisabled"
        @click="selectDay(cell.date)"
      >
        {{ cell.date.getDate() }}
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
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: null,
  minDate: null,
  maxDate: null,
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
}

const today = new Date()
const weekdayLabels = ['S', 'M', 'T', 'W', 'T', 'F', 'S']

const viewDate = ref(props.modelValue ? new Date(props.modelValue) : new Date(today))

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
  return false
}

const calendarCells = computed<CalendarCell[]>(() => {
  const year = viewDate.value.getFullYear()
  const month = viewDate.value.getMonth()

  const firstDayOfMonth = new Date(year, month, 1)
  const startOffset = firstDayOfMonth.getDay()
  const gridStart = new Date(year, month, 1 - startOffset)

  const cells: CalendarCell[] = []
  for (let i = 0; i < 42; i += 1) {
    const date = new Date(gridStart)
    date.setDate(gridStart.getDate() + i)

    cells.push({
      key: `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`,
      date,
      isCurrentMonth: date.getMonth() === month,
      isSelected: !!props.modelValue && isSameDay(date, props.modelValue),
      isToday: isSameDay(date, today),
      isDisabled: isDateDisabled(date),
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
    gap: 2px;
  }

  &__day {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 32px;
    border: none;
    border-radius: $radius-sm;
    background: transparent;
    font-size: $font-size-sm;
    color: $color-text;
    cursor: pointer;

    &:hover:not(:disabled) {
      background: $hover-bg;
    }

    &--outside {
      color: $color-placeholder;
    }

    &--today {
      font-weight: $font-weight-bold;
      color: $color-primary;
    }

    &--selected {
      background: $color-primary;
      color: $color-bg;
      font-weight: $font-weight-bold;
    }

    &:disabled {
      color: $color-placeholder;
      cursor: not-allowed;
      background: transparent;
    }
  }
}
</style>
