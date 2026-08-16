<template>
  <div class="progress-bar" :style="{ height }">
    <div class="progress-bar__track">
      <div class="progress-bar__fill" :style="{ width: `${percent}%`, background: color }"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
// 값 하나를 가로 막대로 보여주는 가장 단순한 진행률 바입니다. 카드/리스트 어디서든
// value+max(또는 percent)만 넘기면 재사용할 수 있습니다.
import { computed } from 'vue'

interface Props {
  value?: number
  max?: number
  /** value/max 대신 퍼센트를 직접 지정하고 싶을 때 (0~100). 지정하면 value/max는 무시됩니다. */
  percent?: number
  /** 채워진 부분 색상. 기본 $color-primary와 동일한 값 */
  color?: string
  /** 막대 높이(CSS 값). 기본 8px */
  height?: string
}

const props = withDefaults(defineProps<Props>(), {
  value: 0,
  max: 100,
  percent: undefined,
  color: '#007aff',
  height: '8px',
})

const percent = computed(() => {
  if (props.percent !== undefined) return Math.min(100, Math.max(0, props.percent))
  if (!props.max) return 0
  return Math.min(100, Math.max(0, (props.value / props.max) * 100))
})
</script>

<style scoped lang="scss">
.progress-bar {
  display: flex;
  align-items: center;
  width: 100%;
}

.progress-bar__track {
  width: 100%;
  height: 100%;
  overflow: hidden;
  background: $color-bg-muted;
  border-radius: $radius-full;
}

.progress-bar__fill {
  height: 100%;
  border-radius: $radius-full;
  transition: width 0.3s ease;
}
</style>
