<template>
  <IconButton
    :icon="modelValue ? collapseIcon : expandIcon"
    :label="modelValue ? 'Collapse' : 'Expand'"
    size="sm"
    tone="muted"
    @click="toggle"
  />
</template>

<script setup lang="ts">
import IconButton from './IconButton.vue'
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
