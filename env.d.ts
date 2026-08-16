/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Mapbox GL JS 액세스 토큰. 없으면 지도 화면은 자리표시자만 보여줍니다. */
  readonly VITE_MAPBOX_ACCESS_TOKEN?: string
}
