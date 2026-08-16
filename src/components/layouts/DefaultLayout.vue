<template>
  <main
    class="default-layout__content"
    :class="{ 'default-layout__content--full-bleed': fullBleed }"
  >
    <PageHeader v-if="!fullBleed" :title="title">
      <template v-if="$slots['header-actions']" #actions>
        <slot name="header-actions" />
      </template>
    </PageHeader>
    <div class="default-layout__body" :class="{ 'default-layout__body--full-bleed': fullBleed }">
      <slot />
    </div>
  </main>
</template>

<script setup lang="ts">
// SideBar는 더 이상 여기서 그리지 않습니다. (화면 전환마다 이 컴포넌트 전체가 다시 마운트되면서
// SideBar도 같이 리마운트돼 펼침 상태/스크롤 위치가 초기화되는 문제가 있었습니다.)
// SideBar는 AppShellLayout.vue에서 한 번만 그리고, 각 화면은 그 안의 <RouterView/>로 교체됩니다.
import PageHeader from './PageHeader.vue'

interface Props {
  title?: string
  /** true면 헤더/여백 없이 본문을 화면 전체에 꽉 채웁니다. (지도 화면 등) */
  fullBleed?: boolean
}

withDefaults(defineProps<Props>(), {
  title: '',
  fullBleed: false,
})
</script>

<style scoped lang="scss">
.default-layout__content {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: $spacing-lg;
  overflow-y: auto;
  padding: $spacing-lg;

  &--full-bleed {
    gap: 0;
    padding: 0;
    overflow: hidden;
  }
}

.default-layout__body {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: $spacing-lg;

  &--full-bleed {
    gap: 0;
  }
}
</style>
