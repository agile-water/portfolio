<template>
  <div class="radio-list">
    <span class="radio-list__label">{{ label }}</span>

    <label
      v-for="option in options"
      :key="option.value"
      class="radio-option"
      :class="{ 'radio-option--checked': selected === option.value }"
    >
      <input
        type="radio"
        class="radio-option__input"
        name="radio-group"
        :value="option.value"
        :checked="selected === option.value"
        @change="selectOption(option.value)"
      />
      <span class="radio-option__circle" aria-hidden="true"></span>
      <span class="radio-option__text">{{ option.label }}</span>
    </label>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

interface RadioOption {
  label: string
  value: string
}

interface Props {
  label: string
  options: RadioOption[]
}

const props = defineProps<Props>()

// 1. 디폴트 선택은 첫 번째 옵션(button1)
const selected = ref(props.options[0]?.value ?? '')

function selectOption(value: string): void {
  selected.value = value
}
</script>

<style scoped lang="scss">
.radio-list {
  display: inline-flex;
  align-items: center;
  gap: $spacing-md;
  padding: 32px 40px;
  background: $color-bg;

  &__label {
    width: fit-content;
    font-size: $font-size-sm;
    font-weight: 700;
    color: $color-text;
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
