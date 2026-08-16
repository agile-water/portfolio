<template>
  <header class="page-header">
    <h1 class="page-header__title">{{ resolvedTitle }}</h1>
    <div v-if="$slots.actions" class="page-header__actions">
      <slot name="actions" />
    </div>
  </header>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'

interface Props {
  title?: string
}

const props = withDefaults(defineProps<Props>(), {
  title: '',
})

const route = useRoute()

// title을 명시적으로 넘기지 않으면 현재 라우트의 itemLabel을 기본값으로 사용합니다.
const resolvedTitle = computed(
  () => props.title || (route.meta.itemLabel as string | undefined) || '',
)
</script>

<style scoped lang="scss">
.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: $spacing-md;
}

.page-header__title {
  margin: 0;
  font-size: $font-size-xl;
  font-weight: $font-weight-extrabold;
  color: $color-text;
}

.page-header__actions {
  display: flex;
  align-items: center;
  flex-shrink: 0;
  gap: $spacing-sm;
}
</style>
