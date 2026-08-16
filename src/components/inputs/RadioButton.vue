<template>
  <div class="radio-list">
    <span
      class="radio-list__label"
      :style="{ width: labelWidth, textAlign: labelAlign, flexShrink: labelWidth ? 0 : undefined }"
      >{{ label }}</span
    >

    <div class="radio-list__options">
      <label
        v-for="option in options"
        :key="option.value"
        class="radio-option"
        :class="{ 'radio-option--checked': selected === option.value }"
      >
        <input
          type="radio"
          class="radio-option__input"
          :name="groupName"
          :value="option.value"
          :checked="selected === option.value"
          @change="selectOption(option.value)"
        />
        <span class="radio-option__circle" aria-hidden="true"></span>
        <span class="radio-option__text">{{ option.label }}</span>
      </label>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, useId } from 'vue'

interface RadioOption {
  label: string
  value: string
}

interface Props {
  label: string
  options: RadioOption[]
  modelValue?: string
  /** 같은 화면에 여러 RadioButton을 쓸 때 그룹이 섞이지 않도록 하는 name. 안 넘기면 자동 생성됩니다. */
  name?: string
  /** 라벨 영역 너비를 고정하고 싶을 때 (예: '100px') */
  labelWidth?: string
  /** 라벨 텍스트 정렬 */
  labelAlign?: 'left' | 'right'
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: '',
  name: undefined,
  labelWidth: undefined,
  labelAlign: 'left',
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
}>()

const autoId = useId()
const groupName = computed(() => props.name ?? autoId)

// modelValue를 안 넘기면 첫 번째 옵션을 기본 선택으로 표시
const selected = computed(() => props.modelValue || (props.options[0]?.value ?? ''))

function selectOption(value: string): void {
  emit('update:modelValue', value)
}
</script>

<style scoped lang="scss">
.radio-list {
  display: inline-flex;
  align-items: center;
  flex-shrink: 0;
  gap: $spacing-sm;

  &__label {
    width: fit-content;
    font-size: $font-size-sm;
    font-weight: 700;
    color: $color-text;
  }

  &__options {
    display: inline-flex;
    align-items: center;
    gap: $spacing-md;
  }
}

.radio-option {
  display: inline-flex;
  align-items: center;
  gap: $spacing-xs;
  cursor: pointer;
  user-select: none;

  &__input {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border: 0;
  }

  &__circle {
    display: inline-block;
    width: 20px;
    height: 20px;
    border-radius: 50%;
    border: 1px solid $color-border;
    background: $color-bg;
    box-sizing: border-box;
    position: relative;
    flex-shrink: 0;
    transition: border-color 0.15s ease;
  }

  &__text {
    font-size: $font-size-sm;
    color: $color-text;
  }

  &--checked {
    .radio-option__circle {
      border-color: $color-border;

      &::after {
        content: '';
        position: absolute;
        inset: 2px;
        border-radius: 50%;
        background: $color-primary;
      }
    }
  }

  &__input:focus-visible + .radio-option__circle {
    outline: 2px solid $color-primary;
    outline-offset: 2px;
  }
}
</style>
