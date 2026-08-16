<template>
  <div class="filter-checklist-panel">
    <h3 class="filter-checklist-panel__title">{{ title }}</h3>

    <div class="filter-checklist-panel__search">
      <input
        v-model="searchText"
        type="text"
        class="filter-checklist-panel__search-input"
        :placeholder="searchPlaceholder"
      />
      <span class="filter-checklist-panel__search-icon" v-html="searchIcon"></span>
    </div>

    <ul class="filter-checklist-panel__list">
      <li v-for="option in filteredOptions" :key="option.value" class="filter-checklist-panel__item">
        <label class="filter-checklist-panel__label">
          <input
            type="checkbox"
            class="filter-checklist-panel__checkbox"
            :checked="draft.includes(option.value)"
            @change="toggle(option.value)"
          />
          {{ option.label }}
        </label>
      </li>

      <li v-if="filteredOptions.length === 0" class="filter-checklist-panel__empty">일치하는 항목이 없습니다</li>
    </ul>

    <div class="filter-checklist-panel__footer">
      <SecondaryButton @click="handleReset">Reset</SecondaryButton>
      <PrimaryButton @click="handleApply">Apply</PrimaryButton>
    </div>
  </div>
</template>

<script setup lang="ts">
// 검색 + 체크박스 목록 + Reset/Apply로 구성된 다중 선택 필터 패널. DetailedFilterButton
// 처럼 이미 있는 토글 버튼 밑에 팝오버로 띄워서 쓰는 용도입니다(열림/닫힘 상태는 이 컴포넌트가
// 아니라 부모가 v-if 등으로 직접 관리합니다). 체크 상태는 Apply를 눌러야 modelValue에 반영되고,
// Reset은 전체 선택 상태로 되돌립니다.
import { computed, ref, watch } from 'vue'
import SecondaryButton from '@/components/buttons/SecondaryButton.vue'
import PrimaryButton from '@/components/buttons/PrimaryButton.vue'
import searchIcon from '@/assets/icons/search-outline.svg?raw'

export interface FilterChecklistOption {
  label: string
  value: string
}

interface Props {
  title: string
  options: FilterChecklistOption[]
  modelValue: string[]
  searchPlaceholder?: string
}

const props = withDefaults(defineProps<Props>(), {
  searchPlaceholder: 'Search',
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: string[]): void
  (e: 'apply', value: string[]): void
  (e: 'reset', value: string[]): void
}>()

const searchText = ref('')
const draft = ref<string[]>([...props.modelValue])

// 팝오버가 다시 열릴 때(부모가 modelValue를 새로 넘겨줄 때) 이전에 손댔던 draft를 최신 값으로 맞춥니다.
watch(
  () => props.modelValue,
  (value) => {
    draft.value = [...value]
  },
)

const filteredOptions = computed(() => {
  const query = searchText.value.trim().toLowerCase()
  if (!query) return props.options
  return props.options.filter((option) => option.label.toLowerCase().includes(query))
})

function toggle(value: string): void {
  draft.value = draft.value.includes(value)
    ? draft.value.filter((item) => item !== value)
    : [...draft.value, value]
}

function handleReset(): void {
  const allValues = props.options.map((option) => option.value)
  draft.value = allValues
  emit('update:modelValue', allValues)
  emit('reset', allValues)
}

function handleApply(): void {
  emit('update:modelValue', draft.value)
  emit('apply', draft.value)
}
</script>

<style scoped lang="scss">
.filter-checklist-panel {
  display: flex;
  flex-direction: column;
  width: 260px;
  padding: $spacing-md;
  background: $color-bg;
  border: 1px solid $color-border;
  border-radius: $radius-md;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
}

.filter-checklist-panel__title {
  margin: 0 0 $spacing-sm;
  font-size: $font-size-base;
  font-weight: $font-weight-extrabold;
  color: $color-text;
}

.filter-checklist-panel__search {
  position: relative;
  flex-shrink: 0;
  margin-bottom: $spacing-sm;
}

.filter-checklist-panel__search-input {
  width: 100%;
  height: 40px;
  padding: 0 36px 0 $spacing-sm;
  border: 1px solid $color-border;
  border-radius: $radius-sm;
  font-size: $font-size-sm;
  color: $color-text;
  background: $color-bg;
  transition: border-color 0.15s ease;

  &::placeholder {
    color: $color-placeholder;
  }

  &:focus {
    outline: none;
    border-color: $color-primary;
  }
}

.filter-checklist-panel__search-icon {
  position: absolute;
  top: 50%;
  right: $spacing-sm;
  display: flex;
  width: 16px;
  height: 16px;
  color: $color-text-muted;
  transform: translateY(-50%);
  pointer-events: none;
}

.filter-checklist-panel__list {
  display: flex;
  flex-direction: column;
  max-height: 240px;
  margin: 0 0 $spacing-md;
  padding: 0;
  list-style: none;
  overflow-y: auto;

  &::-webkit-scrollbar {
    width: 4px;
  }
  &::-webkit-scrollbar-thumb {
    background: $color-border;
    border-radius: 2px;
  }
}

.filter-checklist-panel__item {
  border-radius: $radius-sm;

  &:hover {
    background: $color-bg-secondary;
  }
}

.filter-checklist-panel__label {
  display: flex;
  align-items: center;
  gap: $spacing-sm;
  height: 36px;
  padding: 0 $spacing-xs;
  font-size: $font-size-sm;
  color: $color-text;
  cursor: pointer;
}

.filter-checklist-panel__checkbox {
  width: 16px;
  height: 16px;
  accent-color: $color-primary;
  cursor: pointer;
}

.filter-checklist-panel__empty {
  padding: $spacing-md 0;
  text-align: center;
  font-size: $font-size-sm;
  color: $color-text-muted;
}

.filter-checklist-panel__footer {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: $spacing-sm;

  :deep(.secondary-button),
  :deep(.primary-button) {
    height: 36px;
    padding: 0 $spacing-md;
  }
}
</style>
