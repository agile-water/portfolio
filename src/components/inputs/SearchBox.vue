<template>
  <div class="search-box-wrapper">
    <span class="search-box-wrapper__label">{{ label }}</span>

    <div class="search-box-wrapper__box" @click="focusInput">
      <input
        ref="inputRef"
        v-model="searchText"
        type="text"
        class="search-box-wrapper__input"
        :placeholder="placeholder"
        @focus="handleFocus"
        @paste="handlePaste"
      />
      <button
        type="button"
        class="search-box-wrapper__icon-btn"
        aria-label="검색"
        @click.stop="openModal"
      >
        <img :src="searchIcon" alt="검색" class="select-box__chevron-icon" />
      </button>
    </div>

    <SearchModal v-model="isModalOpen" />
  </div>
</template>

<script setup lang="ts">
import { ref, nextTick, watch } from 'vue'
import searchIcon from '@/assets/icons/search.svg'
import SearchModal from '@/components/modals/SearchModal.vue'

interface Props {
  label?: string
  placeholder?: string
  modelValue?: string
}

const props = withDefaults(defineProps<Props>(), {
  label: 'Label',
  placeholder: 'placeholder',
  modelValue: '',
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
}>()

const searchText = ref(props.modelValue)
const inputRef = ref<HTMLInputElement | null>(null)
const isModalOpen = ref(false)

// 부모(v-model)에서 값이 바뀌면 내부 상태에 반영
watch(
  () => props.modelValue,
  (value) => {
    if (value !== searchText.value) searchText.value = value
  },
)

// 내부 상태가 바뀌면 부모로 알림
watch(searchText, (value) => {
  emit('update:modelValue', value)
})

// ★ 신규 추가: 서치박스 여백 클릭 시 input에 focus 위임
function focusInput() {
  inputRef.value?.focus()
}

// 2. 서치박스를 클릭(포커스)하면 커서가 깜박이며 입력 가능해지고,
// 4. 이미 값이 있는 상태에서 다시 포커스를 주면 전체 텍스트가 선택되어
//    바로 백스페이스로 한번에 지울 수 있다.
function handleFocus() {
  nextTick(() => {
    inputRef.value?.select()
  })
}

// 3. 엑셀 등에서 여러 셀을 복사해 붙여넣으면 줄바꿈/탭으로 구분된 값을
//    콤마(,)로 이어붙인 문자열로 변환해 넣어준다. (커서 위치에 삽입)
function handlePaste(event: ClipboardEvent) {
  event.preventDefault()

  const clipboardText = event.clipboardData?.getData('text') ?? ''
  const parsed = clipboardText
    .split(/\r\n|\r|\n|\t/)
    .map((value) => value.trim())
    .filter((value) => value.length > 0)
    .join(',')

  const input = inputRef.value
  if (!input) {
    searchText.value = parsed
    return
  }

  const start = input.selectionStart ?? searchText.value.length
  const end = input.selectionEnd ?? searchText.value.length
  const before = searchText.value.slice(0, start)
  const after = searchText.value.slice(end)

  searchText.value = before + parsed + after

  nextTick(() => {
    const cursor = (before + parsed).length
    input.setSelectionRange(cursor, cursor)
  })
}

// 1. 돋보기 버튼 영역을 누르면 아무 정보도 없는 기본 모달을 연다.
function openModal() {
  isModalOpen.value = true
}
</script>

<style lang="scss" scoped>
$border-color: #d9d9d9;
$text-color: #1a1a1a;
$placeholder-color: #bfbfbf;
$box-radius: 8px;

.search-box-wrapper {
  display: flex;
  align-items: center;
  gap: $spacing-md;

  &__label {
    font-weight: 700;
    font-size: $font-size-sm;
    color: $color-text;
    white-space: nowrap;
  }

  &__box {
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex: 1;
    min-width: 280px;
    height: 44px;
    border: 1px solid $color-border;
    border-radius: $radius-sm;
    padding: 10px 14px;
    background: $color-bg;
    transition: border-color 0.15s ease;
    &:focus-within {
      border-color: $color-primary;
    }
  }

  &__input {
    flex: 1;
    min-width: 0;
    border: none;
    outline: none;
    font-size: $font-size-sm;
    color: $color-text;
    background: transparent;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;

    &::placeholder {
      color: $color-placeholder;
    }
  }

  &__icon-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    border: none;
    background: transparent;
    color: $color-text;
    cursor: pointer;
    padding: 4px;
    margin-left: 8px;

    &:hover {
      opacity: 0.7;
    }
  }

  &__icon {
    width: 20px;
    height: 20px;
    display: block;
  }
}
</style>
