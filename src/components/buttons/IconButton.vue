<template>
  <button
    type="button"
    class="icon-button"
    :class="[
      `icon-button--${size}`,
      `icon-button--tone-${tone}`,
      { 'icon-button--active': active, 'icon-button--bare': bare },
    ]"
    :aria-label="label"
    :aria-pressed="active"
    @click="$emit('click', $event)"
  >
    <span class="icon-button__icon" v-html="icon"></span>
  </button>
</template>

<script setup lang="ts">
interface Props {
  /** 인라인 SVG 문자열 (예: `import xIcon from '@/assets/icons/x.svg?raw'`) */
  icon: string
  label: string
  active?: boolean
  /** 버튼 크기. sm: 36px(아이콘 16px), md: 44px(아이콘 18px) */
  size?: 'sm' | 'md'
  /** 아이콘 색상 톤. primary: 항상 브랜드 컬러, muted: 기본은 회색이고 hover 시 진하게 */
  tone?: 'primary' | 'muted'
  /** true면 테두리/배경 없이 아이콘만 표시합니다. (다른 입력 박스 안에 얹을 때) */
  bare?: boolean
}

withDefaults(defineProps<Props>(), {
  active: false,
  size: 'md',
  tone: 'primary',
  bare: false,
})

defineEmits<{
  (e: 'click', event: MouseEvent): void
}>()
</script>

<style scoped lang="scss">
.icon-button {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  border: 1px solid $color-border;
  border-radius: $radius-sm;
  background: $color-bg;
  cursor: pointer;
  transition:
    border-color 0.15s ease,
    background-color 0.15s ease,
    color 0.15s ease;

  &--md {
    width: 44px;
    height: 44px;

    .icon-button__icon {
      width: 18px;
      height: 18px;
    }
  }

  &--sm {
    width: 36px;
    height: 36px;

    .icon-button__icon {
      width: 16px;
      height: 16px;
    }
  }

  &--tone-primary {
    color: $color-primary;

    &:hover {
      background: $color-bg-secondary;
    }
  }

  &--tone-muted {
    color: $color-text-muted;

    &:hover {
      color: $color-text;
      background: $color-bg-secondary;
    }
  }

  // 다른 필터(DropdownSelect, SearchBox 등)와 동일하게, 테두리 하이라이트는
  // 포커스를 따라갑니다. 다른 요소를 클릭해 포커스가 옮겨가면 자동으로 사라져요.
  // active 상태는 aria-pressed 값에만 반영되고, 배경색은 바뀌지 않습니다.
  &:focus {
    outline: none;
    border-color: $color-primary;
  }

  &--bare {
    border-color: transparent;
    background: transparent;

    &:hover {
      background: transparent;
    }

    &:focus {
      border-color: transparent;
    }
  }
}

.icon-button__icon {
  display: flex;

  :deep(svg) {
    width: 100%;
    height: 100%;
  }
}
</style>
