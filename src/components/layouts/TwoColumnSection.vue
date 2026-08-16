<template>
  <div
    class="two-column-section"
    :style="{ gridTemplateColumns: `${leftWidth} ${rightWidth}`, alignItems }"
  >
    <div class="two-column-section__col">
      <slot name="left" />
    </div>
    <div class="two-column-section__col">
      <slot name="right" />
    </div>
  </div>
</template>

<script setup lang="ts">
// Summary/Detail 처럼 두 영역을 나란히 배치할 때 쓰는 레이아웃입니다.
// 각 컬럼 안에 원하는 컴포넌트(DataTable 등)를 자유롭게 넣을 수 있습니다.
interface Props {
  /** 좌측 컬럼 너비(grid-template-columns 값). 예: '1fr', '400px' */
  leftWidth?: string
  /** 우측 컬럼 너비(grid-template-columns 값) */
  rightWidth?: string
  /**
   * 좌우 컬럼의 세로 정렬 방식. 기본 'start'(각자 내용 높이만큼만 차지).
   * 'stretch'로 주면 두 컬럼이 더 높은 쪽에 맞춰 같은 높이로 늘어납니다(내부 카드에도
   * flex:1 등으로 높이를 채우도록 해줘야 실제로 카드 높이가 맞춰집니다).
   */
  alignItems?: 'start' | 'stretch'
}

withDefaults(defineProps<Props>(), {
  leftWidth: '1fr',
  rightWidth: '1fr',
  alignItems: 'start',
})
</script>

<style scoped lang="scss">
.two-column-section {
  display: grid;
  gap: $spacing-xl;

  &__col {
    display: flex;
    flex-direction: column;
    gap: $spacing-md;
    min-width: 0;
  }
}

@media (max-width: 960px) {
  .two-column-section {
    grid-template-columns: 1fr !important;
  }
}
</style>
