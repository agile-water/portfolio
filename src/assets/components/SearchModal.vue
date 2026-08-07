<template>
  <Teleport to="body">
    <div v-if="modelValue" class="search-modal-overlay" @click.self="close">
      <div class="search-modal">
        <button type="button" class="search-modal__close" aria-label="닫기" @click="close">
          &times;
        </button>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
interface Props {
  modelValue: boolean
}

defineProps<Props>()

const emit = defineEmits<{
  (event: 'update:modelValue', value: boolean): void
}>()

function close() {
  emit('update:modelValue', false)
}
</script>

<style lang="scss" scoped>
.search-modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.search-modal {
  position: relative;
  width: 400px;
  min-height: 240px;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);

  &__close {
    position: absolute;
    top: 12px;
    right: 12px;
    border: none;
    background: transparent;
    font-size: 20px;
    line-height: 1;
    cursor: pointer;
    color: #666;

    &:hover {
      color: #000;
    }
  }
}
</style>
