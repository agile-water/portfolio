<template>
  <span class="badge" :class="`badge--${tone}`"><slot /></span>
</template>

<script setup lang="ts">
// 짧은 텍스트(에러 코드, 상태 등)를 채워진 알약 모양 라벨로 보여줍니다. StatusDot과 같은
// good/warning/danger 색 언어를 씁니다(테이블 셀 안 에러 코드 칩 등에 사용).
export type BadgeTone = 'good' | 'warning' | 'danger' | 'info'

interface Props {
  tone?: BadgeTone
}

withDefaults(defineProps<Props>(), {
  tone: 'info',
})
</script>

<style scoped lang="scss">
.badge {
  display: inline-flex;
  align-items: center;
  padding: 3px 10px;
  border-radius: $radius-full;
  font-size: $font-size-xs;
  font-weight: $font-weight-bold;
  color: $color-bg;
  white-space: nowrap;

  &--good {
    background: $color-success;
  }

  &--warning {
    background: $color-warning;
  }

  &--danger {
    background: $color-danger;
  }

  &--info {
    background: $color-text-muted;
  }
}
</style>
