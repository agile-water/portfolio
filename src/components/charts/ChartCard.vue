<template>
  <PageSection class="chart-card">
    <div class="chart-card__header">
      <h3 class="chart-card__title">{{ title }}</h3>
      <span v-if="unit" class="chart-card__unit">※ Unit : {{ unit }}</span>
    </div>

    <slot />
  </PageSection>
</template>

<script setup lang="ts">
// 제목 + 단위 표기 + 차트(slot)로 구성된 카드. PageSection의 흰 배경/둥근 모서리를 그대로 씁니다.
import PageSection from '@/components/layouts/PageSection.vue'

interface Props {
  title: string
  /** 우측 상단에 "※ Unit : {unit}"로 표시. 생략하면 표시하지 않습니다. */
  unit?: string
}

withDefaults(defineProps<Props>(), {
  unit: undefined,
})
</script>

<style scoped lang="scss">
.chart-card__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: $spacing-md;
}

.chart-card__title {
  margin: 0;
  font-size: $font-size-lg;
  font-weight: $font-weight-extrabold;
  color: $color-text;
}

.chart-card__unit {
  font-size: $font-size-xs;
  color: $color-text-muted;
  white-space: nowrap;
}
</style>
