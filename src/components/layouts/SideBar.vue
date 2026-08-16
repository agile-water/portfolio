<template>
  <aside class="gvis-sidebar" :class="{ 'gvis-sidebar--collapsed': isCollapsed }">
    <!-- Logo -->
    <div class="gvis-sidebar__logo">
      <img :src="logoImage" alt="PartTrace logo" class="gvis-sidebar__logo-icon" />
      <div class="gvis-sidebar__logo-text-group" v-show="!isCollapsed">
        <span class="gvis-sidebar__logo-text">PartTrace</span>
        <span class="gvis-sidebar__logo-caption">PART LOGISTICS TRACKING</span>
      </div>
    </div>

    <!-- Nav -->
    <nav class="gvis-sidebar__nav">
      <div v-for="section in menuSections" :key="section.id" class="gvis-menu">
        <button
          type="button"
          class="gvis-menu__header"
          :class="{ 'gvis-menu__header--active': activeSectionId === section.id }"
          @click="toggleSection(section.id)"
        >
          <span class="gvis-menu__header-left">
            <span class="gvis-menu__icon" v-html="icons[section.icon]"></span>
            <span class="gvis-menu__label" v-show="!isCollapsed">{{ section.label }}</span>
          </span>
          <span
            v-show="!isCollapsed"
            class="gvis-menu__chevron"
            :class="{ 'gvis-menu__chevron--open': expandedSections[section.id] }"
            v-html="icons.chevron"
          ></span>
        </button>

        <ul v-show="expandedSections[section.id] && !isCollapsed" class="gvis-submenu">
          <li v-for="item in section.children" :key="item.id">
            <a
              href="javascript:void(0)"
              class="gvis-submenu__link"
              :class="{ 'gvis-submenu__link--active': activeItemId === item.id }"
              @click="selectItem(section.id, item.id)"
            >
              {{ item.label }}
            </a>
          </li>
        </ul>
      </div>
    </nav>

    <!-- Footer -->
    <div class="gvis-sidebar__footer">
      <button type="button" class="gvis-account" v-show="!isCollapsed">
        <span class="gvis-account__text">
          <span class="gvis-account__title">Account</span>
          <span class="gvis-account__email">{{ userEmail }}</span>
        </span>
        <span class="gvis-account__chevron" v-html="icons.chevron"></span>
      </button>

      <button type="button" class="gvis-footer-btn">
        <span class="gvis-footer-btn__icon" v-html="icons.settings"></span>
        <span v-show="!isCollapsed">Settings</span>
      </button>

      <button type="button" class="gvis-footer-btn">
        <span class="gvis-footer-btn__icon" v-html="icons.announcement"></span>
        <span v-show="!isCollapsed">Announcements</span>
      </button>

      <button type="button" class="gvis-logout" @click="onLogout">
        <span v-show="!isCollapsed">Logout</span>
        <span class="gvis-logout__icon" v-html="icons.logout"></span>
      </button>
    </div>

    <!-- Collapse toggle -->
    <button
      type="button"
      class="gvis-collapse-btn"
      :aria-label="isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'"
      @click="toggleCollapse"
    >
      <span
        class="gvis-collapse-btn__icon"
        :class="{ 'gvis-collapse-btn__icon--collapsed': isCollapsed }"
        v-html="icons.chevron"
      ></span>
    </button>
  </aside>
</template>

<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import { menuSections, routeNameOf } from '@/config/navigation'
import logoImage from '@/assets/logo.png'
import inventoryStatusIcon from '@/assets/icons/inventory-status.svg?raw'
import logisticsTrackingIcon from '@/assets/icons/logistics-tracking.svg?raw'
import dataAnalysisIcon from '@/assets/icons/data-analysis.svg?raw'
import dataMonitoringIcon from '@/assets/icons/data-monitoring.svg?raw'
import settingsIcon from '@/assets/icons/settings.svg?raw'
import announcementsIcon from '@/assets/icons/announcements.svg?raw'
import logoutIcon from '@/assets/icons/logout.svg?raw'
import chevronIcon from '@/assets/icons/chevron.svg?raw'

interface Props {
  userEmail?: string
}

withDefaults(defineProps<Props>(), {
  userEmail: 'agile.h2o@gmail.com',
})

const emit = defineEmits<{
  (e: 'select', payload: { sectionId: string; itemId: string }): void
  (e: 'logout'): void
}>()

/* ---------------------------------- Icons ---------------------------------- */
const icons: Record<string, string> = {
  monitor: inventoryStatusIcon,
  logistics: logisticsTrackingIcon,
  chart: dataAnalysisIcon,
  document: dataMonitoringIcon,
  chevron: chevronIcon,
  settings: settingsIcon,
  announcement: announcementsIcon,
  logout: logoutIcon,
}

/* --------------------------------- State ---------------------------------- */
const route = useRoute()
const router = useRouter()

const expandedSections = reactive<Record<string, boolean>>(
  menuSections.reduce(
    (acc, section) => {
      acc[section.id] = true
      return acc
    },
    {} as Record<string, boolean>,
  ),
)

const activeSectionId = computed<string>(() => (route.meta.sectionId as string) ?? '')
const activeItemId = computed<string>(() => (route.meta.itemId as string) ?? '')
const isCollapsed = ref<boolean>(false)

/* -------------------------------- Methods ---------------------------------- */
function toggleSection(sectionId: string): void {
  if (isCollapsed.value) {
    isCollapsed.value = false
  }
  expandedSections[sectionId] = !expandedSections[sectionId]
}

function selectItem(sectionId: string, itemId: string): void {
  expandedSections[sectionId] = true
  router.push({ name: routeNameOf(sectionId, itemId) })
  emit('select', { sectionId, itemId })
}

function toggleCollapse(): void {
  isCollapsed.value = !isCollapsed.value
}

function onLogout(): void {
  emit('logout')
}
</script>

<style lang="scss" scoped>
$color-bg-soft: #f4f6f8;

.gvis-sidebar {
  position: relative;
  z-index: 50;
  display: flex;
  flex-direction: column;
  width: 320px;
  height: 100vh;
  background: $color-bg;
  border-right: 1px solid $color-border;
  padding: $spacing-lg $spacing-md;
  transition: width 0.2s ease;
  font-size: $font-size-sm;
  color: $color-text;

  &--collapsed {
    width: 84px;
    padding: $spacing-lg $spacing-md;
  }
}

/* Logo */
.gvis-sidebar__logo {
  display: flex;
  align-items: center;
  gap: $spacing-sm;
  padding: 0 4px;
  margin-bottom: $spacing-sm;
}

.gvis-sidebar__logo-icon {
  display: block;
  width: auto;
  height: $icon-size-2xl;
  flex-shrink: 0;
  object-fit: contain;
}

.gvis-sidebar__logo-text-group {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.gvis-sidebar__logo-text {
  font-size: $font-size-2xl;
  font-weight: $font-weight-extrabold;
  line-height: 1;
  color: $color-primary;
  letter-spacing: -0.3px;
}

.gvis-sidebar__logo-caption {
  font-size: $font-size-xs;
  font-weight: $font-weight-medium;
  letter-spacing: 0.6px;
  color: $color-text-muted;
  white-space: nowrap;
}

/* Nav */
.gvis-sidebar__nav {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;

  &::-webkit-scrollbar {
    width: 4px;
  }
  &::-webkit-scrollbar-thumb {
    background: $color-border;
    border-radius: 2px;
  }
}

.gvis-menu {
  margin-bottom: 4px;
}

.gvis-menu__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: $spacing-md;
  border: none;
  border-radius: $radius-sm;
  background: transparent;
  cursor: pointer;
  font-family: inherit;
  font-size: $font-size-sm;
  font-weight: $font-weight-bold;
  color: $color-text;
  transition:
    background-color 0.15s ease,
    color 0.15s ease;

  &:hover:not(&--active) {
    background: $color-bg-muted;
  }

  &--active {
    background: $color-primary;
    color: $color-bg;
  }
}

.gvis-menu__header-left {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
}

.gvis-menu__icon {
  display: flex;
  width: $icon-size-sm;
  height: $icon-size-sm;
  flex-shrink: 0;
}

.gvis-menu__label {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.gvis-menu__chevron {
  display: flex;
  width: $icon-size-sm;
  height: $icon-size-sm;
  flex-shrink: 0;
  transform: rotate(0deg);
  transition: transform 0.2s ease;

  &--open {
    transform: rotate(90deg);
  }
}

.gvis-submenu {
  list-style: none;
  margin: 4px 0 8px;
  padding: 0 0 0 42px;
  display: flex;
  flex-direction: column;
}

.gvis-submenu__link {
  display: block;
  padding: 9px 4px;
  color: #55585e;
  font-size: 15px;
  font-weight: 500;
  text-decoration: none;
  cursor: pointer;
  border-radius: 6px;
  transition: color 0.15s ease;

  &:hover {
    color: $color-primary;
  }

  &--active {
    color: $color-primary;
    font-weight: 700;
    text-decoration: underline;
    text-underline-offset: 3px;
  }
}

/* Footer */
.gvis-sidebar__footer {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-top: 16px;
}

.gvis-account {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 12px 14px;
  border: none;
  border-radius: $radius-sm;
  background: $color-bg-soft;
  cursor: pointer;
  text-align: left;
  font-family: inherit;

  &:hover {
    background: darken(#f4f6f8, 3%);
  }
}

.gvis-account__text {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.gvis-account__title {
  font-size: 13.5px;
  font-weight: 700;
  color: $color-primary;
}

.gvis-account__email {
  font-size: $font-size-sm;
  color: $color-text;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.gvis-account__chevron {
  display: flex;
  width: $icon-size-sm;
  height: $icon-size-sm;
  color: #b3b7bd;
  flex-shrink: 0;
}

.gvis-footer-btn {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  padding: 12px 14px;
  border: 1px solid $color-border;
  border-radius: 10px;
  background: $color-bg;
  cursor: pointer;
  font-family: inherit;
  font-size: $font-size-sm;
  font-weight: 600;
  color: $color-text;
  transition:
    background-color 0.15s ease,
    box-shadow 0.15s ease;

  &:hover {
    background: $color-bg-soft;
  }
}

.gvis-footer-btn__icon {
  display: flex;
  width: $icon-size-sm;
  height: $icon-size-sm;
  flex-shrink: 0;
  color: $color-text;
}

.gvis-logout {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 6px;
  padding: 8px 6px;
  border: none;
  background: transparent;
  cursor: pointer;
  font-family: inherit;
  font-size: $font-size-sm;
  color: $color-text-muted;
  align-self: flex-end;

  &:hover {
    color: $color-text;
  }
}

.gvis-logout__icon {
  display: flex;
  width: $icon-size-sm;
  height: $icon-size-sm;
}

/* Collapsed footer */
.gvis-sidebar--collapsed {
  .gvis-footer-btn {
    justify-content: center;
    padding: 12px;
  }

  .gvis-logout {
    justify-content: center;
    align-self: center;
    padding: 8px;
  }
}

/* Collapse toggle */
.gvis-collapse-btn {
  position: absolute;
  top: 50%;
  right: -14px;
  transform: translateY(-50%);
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 40px;
  border: 1px solid $color-border;
  border-left: none;
  border-radius: 0 20px 20px 0;
  background: #ffffff;
  color: #9aa0a8;
  cursor: pointer;
  box-shadow: 2px 0 4px rgba(0, 0, 0, 0.04);

  &:hover {
    color: $color-primary;
  }
}

.gvis-collapse-btn__icon {
  display: flex;
  width: $icon-size-sm;
  height: $icon-size-sm;
  transform: rotate(180deg);
  transition: transform 0.2s ease;

  &--collapsed {
    transform: rotate(0deg);
  }
}
</style>
