<template>
  <div ref="wrapperRef" class="compact-select">
    <button
      type="button"
      class="compact-select__trigger"
      :class="{ 'compact-select__trigger--open': isOpen, 'compact-select__trigger--compact': compact }"
      :style="{ width, height }"
      @click="toggle"
    >
      <span class="compact-select__value">{{ selectedLabel }}</span>
      <span
        class="compact-select__chevron"
        :class="{ 'compact-select__chevron--open': isOpen }"
        v-html="chevronIcon"
      ></span>
    </button>

    <Transition name="dropdown">
      <ul v-if="isOpen" class="compact-select__list">
        <li
          v-for="option in options"
          :key="option.value"
          class="compact-select__item"
          :class="{ 'compact-select__item--selected': option.value === modelValue }"
          @mousedown.prevent="select(option.value)"
        >
          {{ option.label }}
        </li>
      </ul>
    </Transition>
  </div>
</template>

<script setup lang="ts">
// 값을 타이핑하지 않고 목록에서만 고르는 짧은 셀렉트. "POL ETD", "Invoice No"처럼
// 라벨 자체가 선택지인 필드 셀렉터에 사용합니다.
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import chevronIcon from '@/assets/icons/chevron.svg?raw'

export interface CompactSelectOption {
  label: string
  value: string
}

interface Props {
  options: CompactSelectOption[]
  modelValue?: string
  /** 트리거 박스 너비를 덮어쓰고 싶을 때 (예: '180px'). 기본은 100px */
  width?: string
  /** 트리거 박스 높이를 직접 덮어쓰고 싶을 때 (예: '40px'). 기본은 44px */
  height?: string
  /** true면 전역 $field-height-compact(40px) 높이를 적용합니다. TabToggle 등 다른 촘촘한
   * 컨트롤과 높이를 맞춰야 할 때 씁니다. */
  compact?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: '',
  width: undefined,
  height: undefined,
  compact: false,
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
}>()

const wrapperRef = ref<HTMLElement | null>(null)
const isOpen = ref(false)

const selectedLabel = computed(
  () => props.options.find((option) => option.value === props.modelValue)?.label ?? props.options[0]?.label ?? '',
)

function toggle(): void {
  isOpen.value = !isOpen.value
}

function select(value: string): void {
  emit('update:modelValue', value)
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
.compact-select {
  position: relative;
  flex-shrink: 0;
}

.compact-select__trigger {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: $spacing-sm;
  width: 100px;
  height: 44px;
  padding: 0 $spacing-md;
  border: 1px solid $color-border;
  border-radius: $radius-sm;
  background: $color-bg;
  cursor: pointer;
  transition: border-color 0.15s ease;

  &--open {
    border-color: $color-primary;
  }

  &--compact {
    height: $field-height-compact;
  }
}

.compact-select__value {
  flex: 1;
  min-width: 0;
  font-size: $font-size-sm;
  font-weight: $font-weight-bold;
  color: $color-text;
  text-align: left;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.compact-select__chevron {
  display: flex;
  width: 16px;
  height: 16px;
  flex-shrink: 0;
  color: $color-text;
  transform: rotate(90deg);
  transition: transform 0.2s ease;

  &--open {
    transform: rotate(-90deg);
  }
}

.compact-select__list {
  position: absolute;
  top: calc(100% + $spacing-xs);
  left: 0;
  // 리스트 너비는 항상 트리거 박스 너비(100% of .compact-select)와 같아야 합니다.
  right: 0;
  z-index: 10;
  margin: 0;
  padding: 0;
  list-style: none;
  background: $color-bg;
  border: 1px solid $color-border;
  border-radius: $radius-sm;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
  overflow: hidden;
}

.compact-select__item {
  padding: 0 $spacing-md;
  font-size: $font-size-sm;
  line-height: 40px;
  color: $color-text;
  cursor: pointer;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;

  &:hover,
  &--selected {
    background: $hover-bg;
  }
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
