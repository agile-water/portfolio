<template>
  <IconButton :icon="icon" :label="label" :active="modelValue" @click="toggle" />
</template>

<script setup lang="ts">
// 필터 패널의 "상세 필터" 토글 버튼. FilterPanel의 actions 슬롯에 넣어서
// 고급/상세 필터 영역을 펼치고 접는 데 씁니다. 눌러서 열리면 채워진 아이콘,
// 닫히면 윤곽선 아이콘으로 바뀝니다.
import { computed } from 'vue'
import IconButton from './IconButton.vue'
import filterOutlinedIcon from '@/assets/icons/filter-alt-outlined.svg?raw'
import filterFilledIcon from '@/assets/icons/filter-alt-filled.svg?raw'

interface Props {
  /** 상세 필터 패널이 열려 있는지 여부 */
  modelValue?: boolean
  label?: string
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: false,
  label: '상세 필터',
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
}>()

const icon = computed(() => (props.modelValue ? filterFilledIcon : filterOutlinedIcon))

function toggle(): void {
  emit('update:modelValue', !props.modelValue)
}
</script>
