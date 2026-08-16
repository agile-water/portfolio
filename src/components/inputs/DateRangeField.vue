<template>
  <div class="date-range-field-group">
    <span v-if="label" class="date-range-field-group__label">{{ label }}</span>

    <div ref="wrapperRef" class="date-range-field" :style="{ width }">
      <button
        type="button"
        class="date-range-field__box"
        :class="{ 'date-range-field__box--open': isOpen }"
        @click="toggle"
      >
        <span class="date-range-field__text" :class="{ 'date-range-field__text--placeholder': !hasValue }">
          {{ displayText }}
        </span>
        <span class="date-range-field__icon" v-html="calendarIcon"></span>
      </button>

      <Transition name="dropdown">
        <div v-if="isOpen" class="date-range-field__popover">
          <div class="date-range-field__popover-summary">
            <span
              class="date-range-field__popover-summary-item"
              :class="{ 'date-range-field__popover-summary-item--active': !from }"
            >
              {{ from ? formatDate(from) : 'From' }}
            </span>
            <span class="date-range-field__popover-summary-arrow" v-html="arrowIcon"></span>
            <span
              class="date-range-field__popover-summary-item"
              :class="{ 'date-range-field__popover-summary-item--active': !!from && !to }"
            >
              {{ to ? formatDate(to) : 'To' }}
            </span>
          </div>

          <MonthCalendarPicker v-if="props.granularity === 'month'" :range-start="from" :range-end="to" @select="handleSelect" />
          <CalendarPicker v-else range :range-start="from" :range-end="to" @select="handleSelect" />
        </div>
      </Transition>
    </div>
  </div>
</template>

<script setup lang="ts">
// 달력 하나 안에서 시작일 → 종료일을 순서대로 클릭하면 그 사이가 밴드로 이어지는 날짜 범위 입력 필드.
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import CalendarPicker from '@/components/inputs/CalendarPicker.vue'
import MonthCalendarPicker from '@/components/inputs/MonthCalendarPicker.vue'
import calendarIcon from '@/assets/icons/date-range.svg?raw'
import arrowIcon from '@/assets/icons/arrow.svg?raw'

export interface DateRange {
  from: Date | null
  to: Date | null
}

interface Props {
  modelValue?: DateRange
  placeholder?: string
  /** DropdownSelect처럼 필드 왼쪽에 라벨을 붙이고 싶을 때 (예: 'C/C ATA') */
  label?: string
  /** 입력 박스 너비를 덮어쓰고 싶을 때 (예: '260px'). 기본은 $field-width-select */
  width?: string
  /** 'month'면 일(day) 대신 월(month) 단위로 범위를 고릅니다(예: Lead Time Analysis의 C/C ATA). 기본 'day' */
  granularity?: 'day' | 'month'
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: () => ({ from: null, to: null }),
  placeholder: undefined,
  label: undefined,
  width: undefined,
  granularity: 'day',
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: DateRange): void
}>()

const wrapperRef = ref<HTMLElement | null>(null)
const isOpen = ref(false)

const from = computed(() => props.modelValue.from)
const to = computed(() => props.modelValue.to)
const hasValue = computed(() => !!from.value || !!to.value)

function formatDate(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  if (props.granularity === 'month') return `${y}-${m}`
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}.${m}.${d}`
}

const emptyUnitText = computed(() => (props.granularity === 'month' ? 'YYYY-MM' : 'YYYY.MM.DD'))

const resolvedPlaceholder = computed(
  () => props.placeholder ?? (props.granularity === 'month' ? 'YYYY-MM ~ YYYY-MM' : 'YYYY.MM.DD ~ YYYY.MM.DD'),
)

const displayText = computed(() => {
  if (!hasValue.value) return resolvedPlaceholder.value
  const fromText = from.value ? formatDate(from.value) : emptyUnitText.value
  const toText = to.value ? formatDate(to.value) : emptyUnitText.value
  return `${fromText} ~ ${toText}`
})

function toggle(): void {
  isOpen.value = !isOpen.value
}

// 시작일이 없거나(첫 클릭) 이미 범위가 완성돼 있으면(from/to 둘 다 있음) 새 범위를 시작하고,
// 시작일만 있는 상태면 이번 클릭을 종료일로 확정합니다(거꾸로 눌러도 자동으로 순서를 맞춰줍니다).
function handleSelect(date: Date): void {
  if (!from.value || (from.value && to.value)) {
    emit('update:modelValue', { from: date, to: null })
    return
  }

  if (date < from.value) {
    emit('update:modelValue', { from: date, to: from.value })
  } else {
    emit('update:modelValue', { from: from.value, to: date })
  }

  isOpen.value = false
}

function handleClickOutside(event: MouseEvent): void {
  if (wrapperRef.value && !wrapperRef.value.contains(event.target as Node)) {
    isOpen.value = false
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
.date-range-field-group {
  display: flex;
  align-items: center;
  gap: $spacing-sm;
}

.date-range-field-group__label {
  font-weight: 700;
  font-size: $font-size-sm;
  color: $color-text;
  white-space: nowrap;
}

.date-range-field {
  position: relative;
  width: $field-width-select;
  flex-shrink: 0;
}

.date-range-field__box {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  height: 44px;
  padding: 0 16px;
  border: 1px solid $color-border;
  border-radius: $radius-sm;
  background: $color-bg;
  cursor: pointer;
  transition: border-color 0.15s ease;

  &--open {
    border-color: $color-primary;
  }
}

.date-range-field__text {
  font-size: $font-size-sm;
  color: $color-text;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;

  &--placeholder {
    color: $color-placeholder;
  }
}

.date-range-field__icon {
  display: flex;
  width: 18px;
  height: 18px;
  flex-shrink: 0;
  margin-left: 8px;
  color: $color-text-muted;
}

.date-range-field__popover {
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  z-index: 10;
  display: flex;
  flex-direction: column;
  gap: $spacing-sm;
  padding: $spacing-sm;
  background: $color-bg;
  border: 1px solid $color-border;
  border-radius: $radius-md;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
}

.date-range-field__popover-summary {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: $spacing-sm;
  padding: $spacing-xs $spacing-sm;
}

.date-range-field__popover-summary-item {
  flex: 1;
  padding: $spacing-xs $spacing-sm;
  border-radius: $radius-sm;
  background: $color-bg-muted;
  text-align: center;
  font-size: $font-size-sm;
  font-weight: $font-weight-bold;
  color: $color-text;

  &--active {
    background: rgba($color-primary, 0.1);
    color: $color-primary;
  }
}

.date-range-field__popover-summary-arrow {
  display: flex;
  width: 14px;
  height: 14px;
  flex-shrink: 0;
  color: $color-text-muted;
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
