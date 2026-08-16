<template>
  <div class="text-field">
    <span v-if="label" class="text-field__label">{{ label }}</span>
    <input
      v-model="innerValue"
      type="text"
      class="text-field__input"
      :placeholder="placeholder"
      autocomplete="off"
    />
  </div>
</template>

<script setup lang="ts">
// 아이콘/드롭다운 없이 텍스트만 입력받는 기본 필드. 옆에 별도 라벨/셀렉터가
// 있어서 자체 라벨이 필요 없는 경우(label 미지정) 박스만 렌더링합니다.
import { ref, watch } from 'vue'

interface Props {
  label?: string
  placeholder?: string
  modelValue?: string
}

const props = withDefaults(defineProps<Props>(), {
  label: '',
  placeholder: '',
  modelValue: '',
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
}>()

const innerValue = ref(props.modelValue)

watch(
  () => props.modelValue,
  (value) => {
    if (value !== innerValue.value) innerValue.value = value
  },
)

watch(innerValue, (value) => {
  emit('update:modelValue', value)
})
</script>

<style scoped lang="scss">
.text-field {
  display: flex;
  align-items: center;
  gap: $spacing-md;
  min-width: 0;
  flex: 1;
}

.text-field__label {
  font-weight: 700;
  font-size: $font-size-sm;
  color: $color-text;
  white-space: nowrap;
}

.text-field__input {
  width: $field-width-select;
  height: 44px;
  padding: 0 16px;
  border: 1px solid $color-border;
  border-radius: $radius-sm;
  background: $color-bg;
  font-size: $font-size-sm;
  color: $color-text;
  transition: border-color 0.15s ease;

  &:focus {
    outline: none;
    border-color: $color-primary;
  }

  &::placeholder {
    color: $color-placeholder;
  }
}
</style>
