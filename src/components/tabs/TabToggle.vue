<template>
  <div class="tab-toggle" :class="{ 'tab-toggle--segmented': segmented }" role="tablist">
    <button
      v-for="option in options"
      :key="option.value"
      type="button"
      role="tab"
      class="tab-toggle__item"
      :class="{ 'tab-toggle__item--active': option.value === modelValue }"
      :style="option.value === modelValue && option.color ? { backgroundColor: option.color, borderColor: option.color } : undefined"
      :aria-selected="option.value === modelValue"
      @click="select(option.value)"
    >
      <span v-if="option.icon" class="tab-toggle__icon" v-html="option.icon"></span>
      {{ option.label }}
    </button>
  </div>
</template>

<script setup lang="ts">
export interface TabToggleOption {
  label: string
  value: string
  /** 인라인 SVG 문자열 (예: `import xIcon from '@/assets/icons/x.svg?raw'`) */
  icon?: string
  /** 활성(선택) 상태일 때 배경/테두리 색상. 생략하면 기본 $color-primary를 씁니다. */
  color?: string
}

interface Props {
  options: TabToggleOption[]
  modelValue?: string
  /** true면 Days/Amount처럼 간격 없이 하나로 이어붙은 세그먼트 버튼 형태로 표시합니다. */
  segmented?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: '',
  segmented: false,
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
}>()

function select(value: string): void {
  if (value === props.modelValue) return
  emit('update:modelValue', value)
}
</script>

<style scoped lang="scss">
.tab-toggle {
  display: inline-flex;
  align-items: center;
  gap: $spacing-sm;

  // Days/Amount처럼 간격 없이 하나로 이어붙은 세그먼트 버튼 형태. 바깥 테두리+radius는
  // 컨테이너가 갖고, 안쪽 버튼들은 테두리 없이 배경색만 바뀌도록 해서 이음매가 보이지 않게 합니다.
  &--segmented {
    gap: 0;
    border: 1px solid $color-border;
    border-radius: $radius-sm;
    overflow: hidden;

    .tab-toggle__item {
      border: none;
      border-radius: 0;
    }
  }
}

.tab-toggle__item {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  height: 40px;
  padding: 0 20px;
  border: 1px solid $color-border;
  border-radius: $radius-sm;
  background: $color-bg;
  color: $color-text;
  font-family: inherit;
  font-size: $font-size-sm;
  font-weight: $font-weight-bold;
  cursor: pointer;
  transition:
    background-color 0.15s ease,
    color 0.15s ease,
    border-color 0.15s ease;

  &:hover:not(&--active) {
    background: $color-bg-secondary;
  }

  &--active {
    background: $color-primary;
    border-color: $color-primary;
    color: $color-bg;
  }
}

.tab-toggle__icon {
  display: flex;
  width: 16px;
  height: 16px;
  flex-shrink: 0;
}
</style>
