<template>
  <div class="filter-panel">
    <div class="filter-panel__row filter-panel__row--top">
      <div class="filter-panel__fields">
        <slot name="row1" />
      </div>
      <div class="filter-panel__actions">
        <slot name="actions" />
      </div>
    </div>

    <div v-if="$slots.row2" v-show="expanded" class="filter-panel__row">
      <slot name="row2" />
    </div>

    <div v-if="$slots.row3" v-show="expanded" class="filter-panel__row">
      <slot name="row3" />
    </div>
  </div>
</template>

<script setup lang="ts">
// FilterBar를 여러 줄로 확장한 버전. 첫 줄에만 우측 액션(Reset/Search 등)이 붙고,
// 이후 줄은 필드만 이어서 배치할 수 있습니다.
// row2/row3는 DetailedFilterButton과 연동되는 expanded 상태에 따라 접혔다 펼쳐집니다.
interface Props {
  /** row2/row3(상세 필터) 노출 여부. 기본은 접힌 상태입니다. */
  expanded?: boolean
}

withDefaults(defineProps<Props>(), {
  expanded: false,
})
</script>

<style scoped lang="scss">
.filter-panel {
  display: flex;
  flex-direction: column;
  gap: $spacing-md;
  padding: $spacing-md;
  background: $color-bg-muted;
  border-radius: $radius-sm;
}

.filter-panel__row {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  flex-wrap: wrap;
  gap: $spacing-lg;

  &--top {
    // 1줄에서만 actions(Reset/Search 등)를 오른쪽 끝으로 밀어줍니다.
    justify-content: space-between;
  }
}

.filter-panel__fields {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: $spacing-lg;
  min-width: 0;
}

.filter-panel__actions {
  display: flex;
  align-items: center;
  flex-shrink: 0;
  gap: $spacing-sm;
}
</style>
