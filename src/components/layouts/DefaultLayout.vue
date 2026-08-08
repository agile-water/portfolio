<template>
  <div class="default-layout">
    <SideBar />
    <main class="default-layout__content">
      <PageHeader :title="title" />
      <div class="default-layout__body">
        <slot />
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import SideBar from './SideBar.vue'
import PageHeader from './PageHeader.vue'

interface Props {
  title?: string
}

withDefaults(defineProps<Props>(), {
  title: '',
})
</script>

<style scoped lang="scss">
.default-layout {
  display: flex;
  min-height: 100vh;
  background: $color-bg-secondary;
}

.default-layout__content {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: $spacing-lg;
  overflow-y: auto;
  padding: $spacing-lg;
}

.default-layout__body {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: $spacing-lg;
}
</style>
