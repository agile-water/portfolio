<script setup lang="ts">
import { ref, computed, watch, onMounted, onBeforeUnmount, nextTick } from 'vue'

interface Props {
  label?: string
  placeholder?: string
  options?: string[]
  modelValue?: string
}

const props = withDefaults(defineProps<Props>(), {
  label: 'Label',
  placeholder: 'placeholder',
  options: () => ['list1', 'list2', 'list3', 'list4'],
  modelValue: '',
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
}>()

const wrapperRef = ref<HTMLElement | null>(null)
const inputRef = ref<HTMLInputElement | null>(null)

const isOpen = ref(false)
const isFocused = ref(false)
const isTyping = ref(false)
const inputValue = ref(props.modelValue ?? '')
const selectedValue = ref<string | null>(props.modelValue || null)
const highlightedIndex = ref(-1)

// 타이핑 중일 때만 입력값으로 필터링, 그 외엔 전체 목록 노출
const filteredOptions = computed(() => {
  if (!isTyping.value || !inputValue.value) return props.options
  const query = inputValue.value.toLowerCase()
  return props.options.filter((opt) => opt.toLowerCase().includes(query))
})

function openDropdown() {
  isOpen.value = true
}

function closeDropdown() {
  isOpen.value = false
  isTyping.value = false
  highlightedIndex.value = -1
}

// 꺾쇠 아이콘 클릭 -> 드롭다운 오픈/클로즈 토글 (방향 전환 애니메이션은 CSS class로 처리)
function toggleDropdown() {
  if (isOpen.value) {
    closeDropdown()
  } else {
    openDropdown()
    inputRef.value?.focus()
  }
}

// 드롭다운 박스 클릭 -> 포커스 이동 및 오픈
function handleBoxClick() {
  openDropdown()
  inputRef.value?.focus()
}

// 포커스 시 테두리 하이라이트 + (선택된 값이 있다면) 텍스트 전체 선택
function handleFocus() {
  isFocused.value = true
  openDropdown()
  if (selectedValue.value) {
    nextTick(() => {
      inputRef.value?.select()
    })
  }
}

function handleBlur() {
  isFocused.value = false
}

// 타이핑 시 자동완성 필터 동작
function handleInput() {
  isTyping.value = true
  selectedValue.value = null
  openDropdown()
  highlightedIndex.value = -1
}

function selectOption(option: string) {
  inputValue.value = option
  selectedValue.value = option
  emit('update:modelValue', option)
  closeDropdown()
  inputRef.value?.focus()
}

function handleKeydown(e: KeyboardEvent) {
  if (!isOpen.value && (e.key === 'ArrowDown' || e.key === 'Enter')) {
    openDropdown()
    return
  }
  if (!isOpen.value) return

  const list = filteredOptions.value

  if (e.key === 'ArrowDown') {
    e.preventDefault()
    if (list.length) highlightedIndex.value = (highlightedIndex.value + 1) % list.length
  } else if (e.key === 'ArrowUp') {
    e.preventDefault()
    if (list.length) {
      highlightedIndex.value =
        highlightedIndex.value <= 0 ? list.length - 1 : highlightedIndex.value - 1
    }
  } else if (e.key === 'Enter') {
    e.preventDefault()
    const option = list[highlightedIndex.value]
    if (highlightedIndex.value >= 0 && option) {
      selectOption(option)
    }
  } else if (e.key === 'Escape') {
    closeDropdown()
  }
}

// 입력값이 비면(백스페이스로 전체 삭제 포함) 선택 해제 -> placeholder 노출
watch(inputValue, (val) => {
  if (val === '') {
    selectedValue.value = null
    emit('update:modelValue', '')
  }
})

function handleClickOutside(e: MouseEvent) {
  if (wrapperRef.value && !wrapperRef.value.contains(e.target as Node)) {
    closeDropdown()
    isFocused.value = false
  }
}

onMounted(() => {
  document.addEventListener('mousedown', handleClickOutside)
})

onBeforeUnmount(() => {
  document.removeEventListener('mousedown', handleClickOutside)
})
</script>

<template>
  <div class="select-field">
    <span class="select-field__label">{{ label }}</span>

    <div
      ref="wrapperRef"
      class="select-box"
      :class="{ 'select-box--active': isFocused || isOpen }"
      @click="handleBoxClick"
    >
      <input
        ref="inputRef"
        v-model="inputValue"
        class="select-box__input"
        type="text"
        :placeholder="placeholder"
        autocomplete="off"
        spellcheck="false"
        @focus="handleFocus"
        @blur="handleBlur"
        @input="handleInput"
        @keydown="handleKeydown"
      />

      <button
        type="button"
        class="select-box__chevron"
        :class="{ 'select-box__chevron--open': isOpen }"
        tabindex="-1"
        aria-label="toggle dropdown"
        @click.stop="toggleDropdown"
      >
        <img src="@/assets/icons/chevron-down.svg" alt="" class="select-box__chevron-icon" />
      </button>

      <Transition name="dropdown">
        <ul v-if="isOpen" class="select-list">
          <li v-if="filteredOptions.length === 0" class="select-list__empty">
            일치하는 항목이 없습니다
          </li>
          <li
            v-for="(option, index) in filteredOptions"
            :key="option"
            class="select-list__item"
            :class="{ 'select-list__item--highlighted': highlightedIndex === index }"
            @mouseenter="highlightedIndex = index"
            @mousedown.prevent="selectOption(option)"
          >
            {{ option }}
          </li>
        </ul>
      </Transition>
    </div>
  </div>
</template>

<style scoped lang="scss">
$text-color: #1a1a1a;
$hover-bg: #f2f2f2;

.select-field {
  display: flex;
  align-items: center;
  gap: $spacing-md;

  &__label {
    font-weight: 700;
    font-size: $font-size-sm;
    color: $color-text;
    white-space: nowrap;
  }
}

.select-box {
  position: relative;
  display: flex;
  align-items: center;
  width: 320px;
  height: 42px;
  padding: 0 16px;
  border: 1px solid $color-border;
  border-radius: $radius-sm;
  background: $color-bg;
  cursor: text;
  transition:
    border-color 0.15s ease,
    box-shadow 0.15s ease;

  &--active {
    border-color: $color-primary;
  }

  &__input {
    flex: 1;
    min-width: 0;
    border: none;
    outline: none;
    background: transparent;
    font-size: $font-size-sm;
    color: $color-text;

    &::placeholder {
      color: $color-placeholder;
    }
  }

  &__chevron {
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    width: 20px;
    height: 20px;
    margin-left: 8px;
    padding: 0;
    border: none;
    background: transparent;
    color: $text-color;
    cursor: pointer;
    transform: rotate(0deg);
    transition: transform 0.2s ease;

    &--open {
      transform: rotate(180deg);
    }
  }

  &__chevron-icon {
    width: 20px;
    height: 20px;
    display: block;
  }
}

.select-list {
  position: absolute;
  top: calc(100% + 8px);
  left: 0;
  right: 0;
  max-height: 260px;
  margin: 0;
  padding: 0;
  list-style: none;
  background: #fff;
  border: 1px solid $color-border;
  border-radius: $radius-sm;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
  overflow-y: auto;
  z-index: 10;

  &__item {
    padding: 0 16px;
    font-size: $font-size-sm;
    line-height: 42px;
    color: $text-color;
    cursor: pointer;
    transition: background-color 0.1s ease;

    &:hover,
    &--highlighted {
      background-color: $hover-bg;
    }
  }

  &__empty {
    padding: 12px 16px;
    font-size: 14px;
    color: $color-placeholder;
  }
}

// 드롭다운 오픈/클로즈 트랜지션
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
