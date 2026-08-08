<template>
  <div class="info-tooltip-button">
    <button
      type="button"
      class="info-tooltip-button__trigger"
      aria-label="안내"
      :aria-expanded="isOpen"
      @click="toggle"
    >
      <span class="info-tooltip-button__icon" v-html="infoIcon"></span>
    </button>

    <Teleport to="body">
      <div v-if="isOpen" class="info-tooltip-button-overlay" @click.self="close">
        <div class="info-tooltip-button-modal">
          <button type="button" class="info-tooltip-button-modal__close" aria-label="닫기" @click="close">
            &times;
          </button>
          <div class="info-tooltip-button-modal__body">
            <slot>{{ message }}</slot>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

import infoIcon from '@/assets/icons/info.svg?raw'

interface Props {
  /** 슬롯을 넘기지 않았을 때 모달에 표시할 기본 안내 문구 */
  message?: string
}

withDefaults(defineProps<Props>(), {
  message: '표시된 데이터는 최근 갱신 시점을 기준으로 집계됩니다.',
})

const isOpen = ref(false)

function toggle(): void {
  isOpen.value = !isOpen.value
}

function close(): void {
  isOpen.value = false
}
</script>

<style scoped lang="scss">
.info-tooltip-button {
  display: inline-block;

  &__trigger {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 36px;
    height: 36px;
    padding: 0;
    border: none;
    border-radius: $radius-sm;
    background: transparent;
    color: $color-text-muted;
    cursor: pointer;
  }

  &__icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background: $color-primary;
    color: $color-bg;

    :deep(svg) {
      width: 12px;
      height: 12px;
      fill: currentColor;
    }
  }
}
</style>

<style scoped lang="scss">
.info-tooltip-button-overlay {
  position: fixed;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.4);
  z-index: 1000;
}

.info-tooltip-button-modal {
  position: relative;
  width: 400px;
  min-height: 160px;
  padding: $spacing-lg;
  background: $color-bg;
  border-radius: $radius-md;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);

  &__close {
    position: absolute;
    top: 12px;
    right: 12px;
    border: none;
    background: transparent;
    font-size: 20px;
    line-height: 1;
    cursor: pointer;
    color: $color-text-muted;

    &:hover {
      color: $color-text;
    }
  }

  &__body {
    padding-top: $spacing-md;
    font-size: $font-size-sm;
    color: $color-text;
    line-height: 1.6;
  }
}
</style>
