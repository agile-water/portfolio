<template>
  <span class="transport-mode-icon" :class="`transport-mode-icon--${mode}`" v-html="resolvedIcon"></span>
</template>

<script setup lang="ts">
// StatCard의 컬러 배지(.stat-card__badge)와 동일한 sea/rail/air 색상 언어를 쓰는
// 아이콘 전용 배지입니다. 리스트/테이블처럼 라벨 없이 아이콘만 필요한 곳에서 사용합니다.
import { computed } from 'vue'
import shipIcon from '@/assets/icons/sea-filled.svg?raw'
import railIcon from '@/assets/icons/rail-filled.svg?raw'
import airIcon from '@/assets/icons/air.svg?raw'

export type TransportMode = 'sea' | 'rail' | 'air'

interface Props {
  mode: TransportMode
  /** 정사각형 한 변 길이(CSS 값). 기본 40px */
  size?: string
}

const props = withDefaults(defineProps<Props>(), {
  size: '40px',
})

const icons: Record<TransportMode, string> = {
  sea: shipIcon,
  rail: railIcon,
  air: airIcon,
}

const resolvedIcon = computed(() => icons[props.mode])
</script>

<style scoped lang="scss">
.transport-mode-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: v-bind(size);
  height: v-bind(size);
  flex-shrink: 0;
  border-radius: $radius-badge;
  box-shadow: $shadow-elevated;
  color: $color-bg;

  :deep(svg) {
    width: 55%;
    height: 55%;
    fill: currentColor;
  }

  &--sea {
    background: $color-sea;
  }

  &--rail {
    background: $color-rail;
  }

  &--air {
    background: $color-air;
  }
}
</style>
