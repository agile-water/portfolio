<template>
  <DefaultLayout>
    <section class="placeholder-view">
      <p class="placeholder-view__eyebrow">{{ sectionLabel }}</p>
      <p class="placeholder-view__desc">이 화면은 아직 준비 중입니다.</p>
    </section>
  </DefaultLayout>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'

import DefaultLayout from '@/components/layouts/DefaultLayout.vue'

const route = useRoute()

const sectionLabel = computed(() => (route.meta.sectionLabel as string | undefined) ?? '')
</script>

<style scoped lang="scss">
.placeholder-view {
  flex: 1;
  min-width: 0;
}

.placeholder-view__eyebrow {
  font-size: $font-size-xs;
  font-weight: $font-weight-bold;
  letter-spacing: 0.6px;
  text-transform: uppercase;
  color: $color-primary;
  margin: 0 0 8px;
}

.placeholder-view__desc {
  font-size: $font-size-sm;
  color: $color-text-muted;
  margin: 0;
}
</style>
