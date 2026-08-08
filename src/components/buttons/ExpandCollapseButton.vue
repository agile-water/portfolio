<template>
  <button
    type="button"
    class="expand-collapse-button"
    :aria-label="modelValue ? 'Collapse' : 'Expand'"
    :aria-pressed="modelValue"
    @click="toggle"
  >
    <span class="expand-collapse-button__icon" v-html="modelValue ? collapseIcon : expandIcon"></span>
  </button>
</template>

<script setup lang="ts">
import expandIcon from '@/assets/icons/expand.svg?raw'
import collapseIcon from '@/assets/icons/collapse.svg?raw'

interface Props {
  /** true면 상단 영역이 숨겨진(확장된) 상태 */
  modelValue: boolean
}

const props = defineProps<Props>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
}>()

function toggle(): void {
  emit('update:modelValue', !props.modelValue)
}
</script>

<style scoped lang="scss">
.expand-collapse-button {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  padding: 0;
  border: 1px solid $color-border;
  border-radius: $radius-sm;
  background: $color-bg;
  color: $color-text-muted;
  cursor: pointer;
  transition:
    color 0.15s ease,
    background-color 0.15s ease;

  &:hover {
    color: $color-text;
    background: $color-bg-secondary;
  }

  &__icon {
    display: flex;
    width: 18px;
    height: 18px;

    :deep(svg) {
      width: 100%;
      height: 100%;
    }
  }
}
</style>
