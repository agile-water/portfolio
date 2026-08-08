<template>
  <div class="process-flow">
    <template v-for="(step, index) in steps" :key="step.id">
      <div class="process-flow__step">
        <h3 class="process-flow__step-title">{{ step.label }}</h3>

        <div
          v-for="row in step.rows"
          :key="row.id"
          class="process-flow__row"
          :class="`process-flow__row--${row.variant}`"
        >
          <span class="process-flow__row-icon" v-html="row.icon"></span>
          <span class="process-flow__row-value">
            {{ row.value }}<span v-if="row.unit" class="process-flow__row-unit"> {{ row.unit }}</span>
          </span>
        </div>
      </div>

      <span
        v-if="index < steps.length - 1"
        class="process-flow__arrow"
        aria-hidden="true"
        v-html="arrowIcon"
      ></span>
    </template>
  </div>
</template>

<script setup lang="ts">
import type { StatCardVariant } from '@/components/cards/StatCard.vue'
import arrowIcon from '@/assets/icons/arrow.svg?raw'

export interface ProcessFlowRow {
  id: string
  icon: string
  value: string | number
  unit?: string
  variant?: StatCardVariant
}

export interface ProcessFlowStep {
  id: string
  label: string
  rows: ProcessFlowRow[]
}

interface Props {
  steps: ProcessFlowStep[]
}

defineProps<Props>()
</script>

<style scoped lang="scss">
.process-flow {
  display: flex;
  align-items: stretch;
  gap: $spacing-md;
  overflow-x: auto;
}

.process-flow__step {
  display: flex;
  flex: 1;
  flex-direction: column;
  min-width: 200px;
  gap: $spacing-sm;
  padding: $spacing-lg;
  background: $color-bg-secondary;
  border-radius: $radius-sm;
}

.process-flow__step-title {
  margin: 0 0 4px;
  font-size: $font-size-lg;
  font-weight: $font-weight-extrabold;
  color: $color-text;
}

.process-flow__row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: $spacing-sm;
  padding: 10px 14px;
  border-radius: $radius-sm;

  &--sea {
    background: $color-sea-muted;
    color: $color-sea;
  }

  &--rail {
    background: $color-rail-muted;
    color: $color-rail;
  }

  &--air {
    background: $color-air-muted;
    color: $color-air;
  }
}

.process-flow__row-icon {
  display: flex;
  width: 18px;
  height: 18px;
  flex-shrink: 0;
}

.process-flow__row-value {
  font-size: $font-size-sm;
  font-weight: $font-weight-bold;
  white-space: nowrap;
}

.process-flow__row-unit {
  font-weight: $font-weight-medium;
}

.process-flow__arrow {
  display: flex;
  align-items: center;
  flex-shrink: 0;
  width: 20px;
  color: $color-border;
}
</style>
