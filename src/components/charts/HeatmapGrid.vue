<template>
  <div class="heatmap-grid">
    <div class="heatmap-grid__scroll">
      <div
        class="heatmap-grid__grid"
        :style="{ gridTemplateColumns: `160px repeat(${cols.length}, minmax(96px, 1fr))` }"
      >
        <div class="heatmap-grid__corner"></div>
        <div v-for="col in cols" :key="col" class="heatmap-grid__col-header">{{ col }}</div>

        <template v-for="resolvedRow in resolvedRows" :key="resolvedRow.row">
          <div class="heatmap-grid__row-header">{{ resolvedRow.row }}</div>
          <div
            v-for="cell in resolvedRow.cells"
            :key="`${resolvedRow.row}-${cell.col}`"
            class="heatmap-grid__cell"
            :style="{ background: cell.background }"
          >
            <span v-if="cell.value !== null" class="heatmap-grid__cell-value">{{ formatNumber(cell.value) }}</span>
          </div>
        </template>
      </div>
    </div>

    <div class="heatmap-grid__legend">
      <span class="heatmap-grid__legend-label">Low</span>
      <span
        v-for="(opacity, index) in legendOpacities"
        :key="index"
        class="heatmap-grid__legend-swatch"
        :style="{ background: colorAt(opacity) }"
      ></span>
      <span class="heatmap-grid__legend-label">High</span>
    </div>
  </div>
</template>

<script setup lang="ts">
// POL(행) × POD(열) 조합별 수치를 색 농도로 보여주는 히트맵 그리드입니다.
// 값이 있는 칸만 채색되고(진할수록 값이 큼), 값이 없는 칸은 옅은 회색으로 비워둡니다.
import { computed } from 'vue'

export interface HeatmapCell {
  row: string
  col: string
  value: number
}

interface Props {
  rows: string[]
  cols: string[]
  cells: HeatmapCell[]
  /** 색 농도 계산 기준이 되는 최댓값. 생략하면 cells 중 최댓값을 사용합니다. */
  max?: number
  /** 채워진 칸의 기준 색(hex). 기본은 SEA 톤(#3cafaf) */
  baseColor?: string
}

const props = withDefaults(defineProps<Props>(), {
  max: undefined,
  baseColor: '#3cafaf',
})

const EMPTY_BG = '#f0f0f0'
const legendOpacities = [0.15, 0.35, 0.55, 0.75, 0.95]

function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const normalized = hex.replace('#', '')
  const expanded =
    normalized.length === 3
      ? normalized
          .split('')
          .map((c) => c + c)
          .join('')
      : normalized
  const value = parseInt(expanded, 16)
  return { r: (value >> 16) & 255, g: (value >> 8) & 255, b: value & 255 }
}

function colorAt(opacity: number): string {
  const { r, g, b } = hexToRgb(props.baseColor)
  return `rgba(${r}, ${g}, ${b}, ${opacity})`
}

function formatNumber(value: number): string {
  return value.toLocaleString()
}

const cellMap = computed(() => {
  const map = new Map<string, number>()
  for (const cell of props.cells) map.set(`${cell.row}__${cell.col}`, cell.value)
  return map
})

const maxValue = computed(() => {
  if (props.max) return props.max
  return props.cells.reduce((max, cell) => Math.max(max, cell.value), 1)
})

interface ResolvedCell {
  col: string
  value: number | null
  background: string
}

const resolvedRows = computed(() =>
  props.rows.map((row) => ({
    row,
    cells: props.cols.map((col): ResolvedCell => {
      const value = cellMap.value.get(`${row}__${col}`) ?? null
      if (value === null) return { col, value, background: EMPTY_BG }
      const opacity = 0.35 + (value / maxValue.value) * 0.65
      return { col, value, background: colorAt(Math.min(1, opacity)) }
    }),
  })),
)
</script>

<style scoped lang="scss">
.heatmap-grid {
  display: flex;
  flex-direction: column;
  gap: $spacing-md;
}

.heatmap-grid__scroll {
  overflow-x: auto;
}

.heatmap-grid__grid {
  display: grid;
  gap: 4px;
  min-width: 100%;
}

.heatmap-grid__corner {
  height: 40px;
}

.heatmap-grid__col-header,
.heatmap-grid__row-header {
  display: flex;
  align-items: center;
  font-size: $font-size-sm;
  font-weight: $font-weight-extrabold;
  color: $color-text;
  white-space: nowrap;
}

.heatmap-grid__col-header {
  justify-content: center;
  height: 40px;
}

.heatmap-grid__row-header {
  height: 64px;
}

.heatmap-grid__cell {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 64px;
  border-radius: $radius-sm;
  transition: background-color 0.15s ease;
}

.heatmap-grid__cell-value {
  font-size: $font-size-sm;
  font-weight: $font-weight-extrabold;
  color: $color-bg;
}

.heatmap-grid__legend {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: $spacing-xs;
}

.heatmap-grid__legend-label {
  font-size: $font-size-xs;
  color: $color-text-muted;
}

.heatmap-grid__legend-swatch {
  width: 20px;
  height: 10px;
  border-radius: 2px;

  &:first-child {
    border-radius: $radius-full 2px 2px $radius-full;
  }

  &:last-child {
    border-radius: 2px $radius-full $radius-full 2px;
  }
}
</style>
