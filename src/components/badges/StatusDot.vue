<template>
  <span class="status-dot" :class="`status-dot--${tone}`" :aria-label="ariaLabel"></span>
</template>

<script setup lang="ts">
// 지표의 양호/주의/위험 상태를 색상 점 하나로 표시합니다. (테이블/리스트 셀에서 값 앞에 붙여 사용)
export type StatusDotTone = 'good' | 'warning' | 'danger'

interface Props {
  tone: StatusDotTone
  /** 스크린리더용 설명. 생략하면 tone 값을 그대로 사용합니다. */
  ariaLabel?: string
}

withDefaults(defineProps<Props>(), {
  ariaLabel: undefined,
})
</script>

<style scoped lang="scss">
.status-dot {
  display: inline-block;
  width: 8px;
  height: 8px;
  border-radius: $radius-full;
  flex-shrink: 0;

  &--good {
    background: $color-success;
  }

  &--warning {
    background: $color-warning;
  }

  &--danger {
    background: $color-danger;
  }
}
</style>
