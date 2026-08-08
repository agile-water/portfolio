<template>
  <div class="stat-card">
    <div class="stat-card__badge" :class="`stat-card__badge--${variant}`">
      <span class="stat-card__badge-icon" v-html="icon"></span>
      <span class="stat-card__badge-label">{{ label }}</span>
    </div>

    <div class="stat-card__data">
      <p class="stat-card__caption">Total</p>
      <p class="stat-card__value" :class="`stat-card__value--${variant}`">
        {{ value }}<span v-if="unit" class="stat-card__unit">{{ unit }}</span>
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
export type StatCardVariant = 'sea' | 'rail' | 'air'

interface Props {
  label: string
  icon: string
  value: string | number
  unit?: string
  variant?: StatCardVariant
}

withDefaults(defineProps<Props>(), {
  unit: '',
  variant: 'sea',
})
</script>

<style scoped lang="scss">
.stat-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: $spacing-lg;
  flex: 1;
  min-width: 240px;
  padding: $spacing-lg;
  background: $color-bg-secondary;
  border-radius: $radius-sm;
}

.stat-card__badge {
  display: inline-flex;
  align-items: center;
  gap: $spacing-sm;
  padding: 10px 18px;
  border-radius: $radius-sm;
  color: $color-bg;
  flex-shrink: 0;

  &--sea {
    background: $color-sea;
  }

  &--rail {
    background: $color-rail;
  }

  &--air {
    background: $color-air;
  }
}

.stat-card__badge-icon {
  display: flex;
  width: 20px;
  height: 20px;
}

.stat-card__badge-label {
  font-size: $font-size-sm;
  font-weight: $font-weight-extrabold;
  letter-spacing: 0.4px;
}

.stat-card__data {
  text-align: right;
}

.stat-card__caption {
  margin: 0 0 4px;
  font-size: $font-size-sm;
  color: $color-text-muted;
}

.stat-card__value {
  margin: 0;
  font-size: $font-size-xl;
  font-weight: $font-weight-extrabold;

  &--sea {
    color: $color-sea;
  }

  &--rail {
    color: $color-rail;
  }

  &--air {
    color: $color-air;
  }
}

.stat-card__unit {
  margin-left: 4px;
  font-size: $font-size-base;
  font-weight: $font-weight-bold;
}
</style>
