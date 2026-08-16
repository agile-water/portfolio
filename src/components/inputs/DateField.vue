<template>
  <div class="date-field-group">
    <span v-if="label" class="date-field-group__label">{{ label }}</span>

    <div ref="wrapperRef" class="date-field" :style="{ width }">
      <button type="button" class="date-field__box" :class="{ 'date-field__box--open': isOpen }" @click="toggle">
        <span class="date-field__text" :class="{ 'date-field__text--placeholder': !modelValue }">
          {{ displayText }}
        </span>
        <span class="date-field__icon" v-html="calendarIcon"></span>
      </button>

      <Transition name="dropdown">
        <div v-if="isOpen" class="date-field__popover">
          <CalendarPicker
            :model-value="modelValue"
            :disabled-date="disabledDate"
            :range="!!(bandStart && bandEnd)"
            :range-start="bandStart"
            :range-end="bandEnd"
            @select="handleSelect"
          />
        </div>
      </Transition>
    </div>
  </div>
</template>

<script setup lang="ts">
// DateRangeField(기간 선택)의 단일 날짜 버전. "Pipeline Inventory Status"의 기준일처럼
// 날짜 하나만 고르면 되는 필드에 씁니다. 내부적으로 CalendarPicker를 range 없이(단일 선택) 씁니다.
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import CalendarPicker from '@/components/inputs/CalendarPicker.vue'
import calendarIcon from '@/assets/icons/date-range.svg?raw'

interface Props {
  modelValue?: Date | null
  placeholder?: string
  /** DropdownSelect처럼 필드 왼쪽에 라벨을 붙이고 싶을 때 (예: 'Base Date') */
  label?: string
  /** 입력 박스 너비를 덮어쓰고 싶을 때 (예: '260px'). 기본은 $field-width-select */
  width?: string
  /** true를 반환하는 날짜는 선택할 수 없게 비활성화합니다(예: 월요일만 고르게 하기). */
  disabledDate?: (date: Date) => boolean
  /**
   * 선택된 값(modelValue)과 별개로, 참고용으로 옅게 밴드 표시할 기간의 시작일.
   * bandStart/bandEnd가 둘 다 있어야 밴드가 보입니다(예: 선택한 기준일로부터 자동
   * 계산된 조회 구간을 달력에서 미리 보여줄 때).
   */
  bandStart?: Date | null
  /** 밴드 표시 기간의 종료일 */
  bandEnd?: Date | null
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: null,
  placeholder: 'YYYY-MM-DD',
  label: undefined,
  width: undefined,
  disabledDate: undefined,
  bandStart: null,
  bandEnd: null,
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: Date): void
}>()

const wrapperRef = ref<HTMLElement | null>(null)
const isOpen = ref(false)

function formatDate(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

const displayText = computed(() => (props.modelValue ? formatDate(props.modelValue) : props.placeholder))

function toggle(): void {
  isOpen.value = !isOpen.value
}

function handleSelect(date: Date): void {
  emit('update:modelValue', date)
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
// DateRangeField와 동일한 트리거 박스/팝오버 스타일을 그대로 씁니다(높이 44px, 테두리,
// 열림 상태 강조색 등). 범위 요약 바(From/To)만 없을 뿐 나머지 톤은 통일되어 있습니다.
.date-field-group {
  display: flex;
  align-items: center;
  gap: $spacing-sm;
}

.date-field-group__label {
  font-weight: 700;
  font-size: $font-size-sm;
  color: $color-text;
  white-space: nowrap;
}

.date-field {
  position: relative;
  width: $field-width-select;
  flex-shrink: 0;
}

.date-field__box {
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

.date-field__text {
  font-size: $font-size-sm;
  color: $color-text;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;

  &--placeholder {
    color: $color-placeholder;
  }
}

.date-field__icon {
  display: flex;
  width: 18px;
  height: 18px;
  flex-shrink: 0;
  margin-left: 8px;
  color: $color-text-muted;
}

.date-field__popover {
  position: absolute;
  top: calc(100% + #{$spacing-xs});
  left: 0;
  z-index: 10;
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
