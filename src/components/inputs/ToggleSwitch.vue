<template>
  <label class="toggle-switch" :class="{ 'toggle-switch--checked': modelValue }">
    <input
      type="checkbox"
      class="toggle-switch__input"
      :checked="modelValue"
      :aria-label="label"
      @change="emit('update:modelValue', ($event.target as HTMLInputElement).checked)"
    />
    <span class="toggle-switch__track" aria-hidden="true">
      <span class="toggle-switch__thumb"></span>
    </span>
  </label>
</template>

<script setup lang="ts">
// on/off 하나만 고르는 스위치. RadioButton과 같은 관례로, 실제 input은 스크린리더용으로만
// 남겨두고(visually hidden) 트랙/손잡이는 직접 그립니다.
interface Props {
  modelValue: boolean
  /** 스크린리더용 설명 */
  label?: string
}

withDefaults(defineProps<Props>(), {
  label: undefined,
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
}>()
</script>

<style scoped lang="scss">
.toggle-switch {
  display: inline-flex;
  align-items: center;
  cursor: pointer;
}

.toggle-switch__input {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

.toggle-switch__track {
  position: relative;
  width: 40px;
  height: 22px;
  flex-shrink: 0;
  background: $color-border;
  border-radius: $radius-full;
  transition: background-color 0.15s ease;
}

.toggle-switch__thumb {
  position: absolute;
  top: 2px;
  left: 2px;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: $color-bg;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
  transition: transform 0.15s ease;
}

.toggle-switch--checked {
  .toggle-switch__track {
    background: $color-primary;
  }

  .toggle-switch__thumb {
    transform: translateX(18px);
  }
}

.toggle-switch__input:focus-visible + .toggle-switch__track {
  outline: 2px solid $color-primary;
  outline-offset: 2px;
}
</style>
