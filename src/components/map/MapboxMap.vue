<template>
  <div class="mapbox-map">
    <div ref="mapEl" class="mapbox-map__canvas" />

    <button
      v-if="hasToken && show3DToggle"
      type="button"
      class="mapbox-map__pitch-toggle"
      @click="togglePitch"
    >
      {{ is3D ? '2D' : '3D' }}
    </button>

    <div v-if="!hasToken" class="mapbox-map__placeholder">
      <p class="mapbox-map__placeholder-text">
        Mapbox 액세스 토큰(VITE_MAPBOX_ACCESS_TOKEN)이 설정되면 실제 지도가 표시됩니다.
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
// mapbox-gl 패키지를 프로젝트에 설치하지 않고, 필요할 때 CDN에서 스크립트/스타일을 불러와
// 초기화하는 가벼운 래퍼입니다. 토큰이 없으면 자리표시자만 표시하고 조용히 대기합니다.
// Vessel Monitoring, Cargo Tracking 등 지도가 필요한 화면에서 공통으로 재사용합니다.
import { onBeforeUnmount, onMounted, ref } from 'vue'

interface MapboxMapInstance {
  remove: () => void
  addControl: (control: unknown, position?: string) => void
  setProjection: (projection: string) => void
  once: (event: string, handler: () => void) => void
  on: (event: string, handler: (...args: unknown[]) => void) => void
  easeTo: (options: Record<string, unknown>) => void
  resize: () => void
}

interface MapboxGlobal {
  accessToken: string
  Map: new (options: Record<string, unknown>) => MapboxMapInstance
  NavigationControl: new (options?: Record<string, unknown>) => unknown
}

declare global {
  interface Window {
    mapboxgl?: MapboxGlobal
  }
}

interface Props {
  /** Mapbox 액세스 토큰. 넘기지 않으면 VITE_MAPBOX_ACCESS_TOKEN 환경변수를 사용합니다. */
  accessToken?: string
  /** Mapbox 스타일 URL */
  styleUrl?: string
  center?: [number, number]
  zoom?: number
  /** 우측 하단 2D/3D 전환 버튼 노출 여부 */
  show3DToggle?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  accessToken: undefined,
  styleUrl: 'mapbox://styles/mapbox/light-v11',
  center: () => [15, 25] as [number, number],
  zoom: 1.6,
  show3DToggle: true,
})

const emit = defineEmits<{
  (e: 'ready', map: MapboxMapInstance): void
}>()

const mapEl = ref<HTMLDivElement | null>(null)
const is3D = ref(false)

const resolvedToken = props.accessToken || import.meta.env.VITE_MAPBOX_ACCESS_TOKEN || ''
const hasToken = Boolean(resolvedToken)

const MAPBOX_GL_VERSION = '3.9.0'
const SCRIPT_ID = 'mapbox-gl-cdn-script'
const STYLE_ID = 'mapbox-gl-cdn-style'

let mapInstance: MapboxMapInstance | null = null
let resizeObserver: ResizeObserver | null = null

function loadMapboxAssets(): Promise<MapboxGlobal> {
  return new Promise((resolve, reject) => {
    if (window.mapboxgl) {
      resolve(window.mapboxgl)
      return
    }

    if (!document.getElementById(STYLE_ID)) {
      const link = document.createElement('link')
      link.id = STYLE_ID
      link.rel = 'stylesheet'
      link.href = `https://api.mapbox.com/mapbox-gl-js/v${MAPBOX_GL_VERSION}/mapbox-gl.css`
      document.head.appendChild(link)
    }

    const existingScript = document.getElementById(SCRIPT_ID)
    if (existingScript) {
      existingScript.addEventListener('load', () => {
        if (window.mapboxgl) resolve(window.mapboxgl)
        else reject(new Error('mapbox-gl failed to load'))
      })
      existingScript.addEventListener('error', () => reject(new Error('mapbox-gl failed to load')))
      return
    }

    const script = document.createElement('script')
    script.id = SCRIPT_ID
    script.src = `https://api.mapbox.com/mapbox-gl-js/v${MAPBOX_GL_VERSION}/mapbox-gl.js`
    script.onload = () => {
      if (window.mapboxgl) resolve(window.mapboxgl)
      else reject(new Error('mapbox-gl failed to load'))
    }
    script.onerror = () => reject(new Error('mapbox-gl failed to load'))
    document.head.appendChild(script)
  })
}

onMounted(async () => {
  if (!hasToken || !mapEl.value) return

  try {
    const mapboxgl = await loadMapboxAssets()
    mapboxgl.accessToken = resolvedToken

    mapInstance = new mapboxgl.Map({
      container: mapEl.value,
      style: props.styleUrl,
      center: props.center,
      zoom: props.zoom,
      // Mapbox GL JS v3 기본값인 3D 지구본(globe) 대신 평면 2D 지도로 시작합니다.
      // 3D 전환은 우측 하단 토글 버튼으로만 허용합니다.
      projection: 'mercator',
      pitch: 0,
      bearing: 0,
      pitchWithRotate: false,
      dragRotate: false,
      touchPitch: false,
      attributionControl: false,
    })

    mapInstance.addControl(new mapboxgl.NavigationControl({ showCompass: false }), 'bottom-right')
    mapInstance.once('load', () => {
      if (mapInstance) emit('ready', mapInstance)
    })

    // 사이드바 접기/펼치기 등으로 지도 컨테이너 크기가 바뀌면 Mapbox가 자동으로
    // 알아채지 못하므로, 컨테이너 크기 변화를 감지해 resize()를 호출해줍니다.
    resizeObserver = new ResizeObserver(() => {
      mapInstance?.resize()
    })
    resizeObserver.observe(mapEl.value)
  } catch (error) {
    console.error('Mapbox 지도를 불러오지 못했습니다.', error)
  }
})

function togglePitch(): void {
  if (!mapInstance) return
  is3D.value = !is3D.value

  // Mapbox GL JS v3의 3D 지구본(globe) 투영으로 전환합니다. 끌 때는 원래대로
  // 평면(mercator) 투영으로 되돌립니다.
  mapInstance.setProjection(is3D.value ? 'globe' : 'mercator')
  mapInstance.easeTo({ pitch: is3D.value ? 60 : 0, duration: 400 })
}

onBeforeUnmount(() => {
  resizeObserver?.disconnect()
  resizeObserver = null
  mapInstance?.remove()
  mapInstance = null
})

defineExpose({
  getMap: () => mapInstance,
})
</script>

<style scoped lang="scss">
.mapbox-map {
  position: relative;
  width: 100%;
  height: 100%;
  background: #e7e9ec;
}

.mapbox-map__canvas {
  width: 100%;
  height: 100%;

  :deep(.mapboxgl-ctrl-logo) {
    opacity: 0.6;
  }

  // 우측 하단 확대/축소(+/-) 컨트롤: 오른쪽 여백은 info 버튼과 동일하게 맞추고,
  // info 버튼이 아래쪽에 오도록 그 위로 띄웁니다.
  :deep(.mapboxgl-ctrl-bottom-right .mapboxgl-ctrl) {
    margin-right: $spacing-lg;
    margin-bottom: 68px;
  }
}

.mapbox-map__pitch-toggle {
  position: absolute;
  right: 64px;
  // info 버튼(bottom: $spacing-lg)과 같은 줄에 있으면 간격이 너무 좁아 클릭이
  // 씹히므로, 확대/축소(+/-) 컨트롤과 같은 줄(위쪽)로 올려 겹침 위험을 없앱니다.
  bottom: 68px;
  z-index: 5;
  height: 32px;
  padding: 0 14px;
  border: none;
  border-radius: $radius-full;
  background: $color-bg;
  color: $color-text;
  font-family: inherit;
  font-size: $font-size-xs;
  font-weight: $font-weight-extrabold;
  letter-spacing: 0.3px;
  cursor: pointer;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.2);

  &:hover {
    background: $color-bg-secondary;
  }
}

.mapbox-map__placeholder {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  padding-bottom: $spacing-xl;
  pointer-events: none;
}

.mapbox-map__placeholder-text {
  margin: 0;
  padding: $spacing-sm $spacing-md;
  border-radius: $radius-full;
  background: rgba(255, 255, 255, 0.85);
  font-size: $font-size-xs;
  color: $color-text-muted;
}
</style>
