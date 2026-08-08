<template>
  <div class="empty-state">
    <span class="empty-state__icon" v-html="icon"></span>
    <p v-if="message" class="empty-state__message">{{ message }}</p>
  </div>
</template>

<script setup lang="ts">
import defaultIcon from '@/assets/icons/empty-state.svg?raw'

interface Props {
  icon?: string
  message?: string
}

withDefaults(defineProps<Props>(), {
  icon: defaultIcon,
  message: '',
})
</script>

<style scoped lang="scss">
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: $spacing-sm;
  padding: $spacing-xl 0;
}

.empty-state__icon {
  display: flex;
  width: 96px;
  height: 96px;
}

.empty-state__message {
  margin: 0;
  font-size: $font-size-sm;
  color: $color-text-muted;
}
</style>
