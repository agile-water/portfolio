<template>
  <Teleport to="body">
    <Transition name="base-modal-fade">
      <div v-if="modelValue" class="base-modal-overlay" @mousedown.self="handleOverlayClick">
        <div class="base-modal" :style="{ width }" role="dialog" aria-modal="true" :aria-label="title">
          <div v-if="title || $slots.actions" class="base-modal__header">
            <h2 class="base-modal__title">{{ title }}</h2>
            <div class="base-modal__header-actions">
              <slot name="actions" />
              <IconButton :icon="closeIcon" label="닫기" tone="muted" size="sm" bare @click="close" />
            </div>
          </div>

          <div class="base-modal__body">
            <slot />
          </div>

          <div v-if="$slots.footer" class="base-modal__footer">
            <slot name="footer" />
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
// 어디서든 재사용할 수 있는 기본 모달 뼈대입니다. 제목/닫기 버튼이 있는 헤더, 자유 콘텐츠
// 영역(default slot), 선택적 하단 액션 영역(footer slot)으로 구성됩니다.
// 배경 클릭, ESC 키, 닫기 버튼 세 가지 방법으로 모두 닫을 수 있습니다.
import { onBeforeUnmount, onMounted, watch } from 'vue'
import IconButton from '@/components/buttons/IconButton.vue'
import closeIcon from '@/assets/icons/close.svg?raw'

interface Props {
  modelValue: boolean
  title?: string
  /** 모달 패널 너비 (예: '720px'). 기본 '480px' */
  width?: string
  /** false면 배경(오버레이) 클릭으로 닫히지 않습니다. 기본 true */
  closeOnOverlayClick?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  title: undefined,
  width: '480px',
  closeOnOverlayClick: true,
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
}>()

function close(): void {
  emit('update:modelValue', false)
}

function handleOverlayClick(): void {
  if (props.closeOnOverlayClick) close()
}

function handleKeydown(event: KeyboardEvent): void {
  if (event.key === 'Escape' && props.modelValue) close()
}

// modelValue가 열려 있는 동안에만 키보드 리스너를 붙여둡니다.
watch(
  () => props.modelValue,
  (isOpen) => {
    if (isOpen) document.addEventListener('keydown', handleKeydown)
    else document.removeEventListener('keydown', handleKeydown)
  },
)

onMounted(() => {
  if (props.modelValue) document.addEventListener('keydown', handleKeydown)
})

onBeforeUnmount(() => {
  document.removeEventListener('keydown', handleKeydown)
})
</script>

<style scoped lang="scss">
.base-modal-overlay {
  position: fixed;
  inset: 0;
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: $spacing-lg;
  background: rgba(0, 0, 0, 0.4);
}

.base-modal {
  display: flex;
  flex-direction: column;
  width: 480px;
  max-width: 100%;
  max-height: calc(100vh - #{$spacing-xl * 2});
  background: $color-bg;
  border-radius: $radius-lg;
  box-shadow: $shadow-elevated;
  overflow: hidden;
}

.base-modal__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: $spacing-md;
  padding: $spacing-lg;
  border-bottom: 1px solid $color-border;
  flex-shrink: 0;
}

.base-modal__title {
  margin: 0;
  font-size: $font-size-lg;
  font-weight: $font-weight-extrabold;
  color: $color-text;
}

.base-modal__header-actions {
  display: flex;
  align-items: center;
  gap: $spacing-sm;
  flex-shrink: 0;
}

.base-modal__body {
  padding: $spacing-lg;
  overflow-y: auto;
}

.base-modal__footer {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: $spacing-sm;
  padding: $spacing-lg;
  border-top: 1px solid $color-border;
  flex-shrink: 0;
}

.base-modal-fade-enter-active,
.base-modal-fade-leave-active {
  transition: opacity 0.15s ease;

  .base-modal {
    transition:
      opacity 0.15s ease,
      transform 0.15s ease;
  }
}

.base-modal-fade-enter-from,
.base-modal-fade-leave-to {
  opacity: 0;

  .base-modal {
    opacity: 0;
    transform: translateY(8px) scale(0.98);
  }
}
</style>
