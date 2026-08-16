<template>
  <div class="map-canvas">
    <div class="map-canvas__surface">
      <slot />
    </div>
    <div v-if="$slots.topBar" class="map-canvas__top-bar">
      <slot name="topBar" />
    </div>
    <div v-if="$slots.toolbar" class="map-canvas__toolbar">
      <slot name="toolbar" />
    </div>
    <div v-if="$slots.controls" class="map-canvas__controls">
      <slot name="controls" />
    </div>
  </div>
</template>

<script setup lang="ts">
// 지도를 배경 전체에 깔고, 그 위에 검색바 같은 툴바를 오버레이로 띄우는 레이아웃입니다.
// Vessel Monitoring, Cargo Tracking처럼 지도가 배경인 화면에서 공통으로 재사용합니다.
</script>

<style scoped lang="scss">
.map-canvas {
  position: relative;
  flex: 1;
  min-height: 0;
  overflow: hidden;
  background: $color-bg-muted;
}

.map-canvas__surface {
  position: absolute;
  inset: 0;
}

.map-canvas__top-bar {
  position: absolute;
  top: $spacing-lg;
  left: $spacing-lg;
  right: $spacing-lg;
  z-index: 10;
}

.map-canvas__toolbar {
  position: absolute;
  top: $spacing-lg;
  left: $spacing-lg;
  z-index: 10;
  display: flex;
  align-items: center;
  gap: $spacing-md;
  flex-wrap: wrap;
}

.map-canvas__controls {
  position: absolute;
  // info 버튼을 지도 우측 하단, Mapbox 확대/축소(+/-) 컨트롤 아래쪽에 배치합니다.
  right: $spacing-lg;
  bottom: $spacing-lg;
  z-index: 10;
  display: flex;
  align-items: center;
  gap: $spacing-sm;
}
</style>
