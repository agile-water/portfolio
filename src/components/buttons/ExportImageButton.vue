<template>
  <button type="button" class="export-image-button" @click="handleClick">
    <span class="export-image-button__icon" v-html="imageIcon"></span>
    <span class="export-image-button__label">Export to Image</span>
  </button>
</template>

<script setup lang="ts">
// ExcelExportButton과 동일한 아이콘+라벨 아웃라인 버튼 톤을 그대로 씁니다.
// 실제 이미지 캡처(예: html2canvas 등)는 아직 연동 전이라, 클릭 시 대상 rootId 엘리먼트를
// 캡처하라는 신호만 emit합니다(TODO: 실제 캡처 라이브러리 연동).
import imageIcon from '@/assets/icons/image-export.svg?raw'

interface Props {
  /** 캡처 대상 컨테이너의 id. 생략하면 화면 전체를 의미합니다. */
  targetId?: string
}

const props = withDefaults(defineProps<Props>(), {
  targetId: undefined,
})

const emit = defineEmits<{
  (e: 'export', targetId: string | undefined): void
}>()

function handleClick(): void {
  // TODO: html2canvas 등으로 targetId 엘리먼트를 캡처해 PNG로 다운로드
  console.log('export to image', { targetId: props.targetId })
  emit('export', props.targetId)
}
</script>

<style scoped lang="scss">
.export-image-button {
  display: inline-flex;
  align-items: center;
  gap: $spacing-xs;
  height: 36px;
  padding: 0 $spacing-md;
  border: 1px solid $color-border;
  border-radius: $radius-sm;
  background: $color-bg;
  cursor: pointer;
  transition:
    border-color 0.15s ease,
    background-color 0.15s ease;

  &:hover {
    background: $color-bg-secondary;
  }

  &:focus {
    outline: none;
    border-color: $color-primary;
  }
}

.export-image-button__icon {
  display: flex;
  width: 16px;
  height: 16px;
  flex-shrink: 0;
}

.export-image-button__label {
  font-size: $font-size-sm;
  font-weight: $font-weight-bold;
  color: $color-text;
  white-space: nowrap;
}
</style>
