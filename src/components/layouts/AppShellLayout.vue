<template>
  <div class="app-shell">
    <SideBar />
    <RouterView />
  </div>
</template>

<script setup lang="ts">
// 사이드바(SideBar)가 화면 전환마다 새로 마운트되지 않도록, 라우터 상단에서 한 번만 그리는
// 껍데기 레이아웃입니다. 실제 각 화면(라우트 컴포넌트)은 이 안의 <RouterView/>에서만
// 교체되고, SideBar는 그대로 유지되어 펼침 상태/스크롤 위치 등이 화면 전환 후에도 보존됩니다.
import SideBar from './SideBar.vue'
</script>

<style scoped lang="scss">
.app-shell {
  display: flex;
  height: 100vh;
  background: $color-bg-secondary;
  overflow: hidden;
}
</style>
