<template>
  <aside class="gvis-sidebar" :class="{ 'gvis-sidebar--collapsed': isCollapsed }">
    <!-- Logo -->
    <div class="gvis-sidebar__logo">
      <span class="gvis-sidebar__logo-icon" v-html="icons.brandmark"></span>
      <div class="gvis-sidebar__logo-text-group" v-show="!isCollapsed">
        <span class="gvis-sidebar__logo-text">GVIS</span>
        <span class="gvis-sidebar__logo-caption">GLOVIS VISIBILITY SYSTEM</span>
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
            v-html="icons.chevronDown"
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
    <div class="gvis-sidebar__footer" v-show="!isCollapsed">
      <button type="button" class="gvis-account">
        <span class="gvis-account__text">
          <span class="gvis-account__title">Account</span>
          <span class="gvis-account__email">{{ userEmail }}</span>
        </span>
        <span class="gvis-account__chevron" v-html="icons.chevronRight"></span>
      </button>

      <button type="button" class="gvis-footer-btn">
        <span class="gvis-footer-btn__icon" v-html="icons.settings"></span>
        <span>Settings</span>
      </button>

      <button type="button" class="gvis-footer-btn">
        <span class="gvis-footer-btn__icon" v-html="icons.announcement"></span>
        <span>Announcements</span>
      </button>

      <button type="button" class="gvis-logout" @click="onLogout">
        <span>Logout</span>
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
        v-html="isCollapsed ? icons.chevronRight : icons.chevronLeft"
      ></span>
    </button>
  </aside>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'

interface SubMenuItem {
  id: string
  label: string
}

interface MenuSection {
  id: string
  label: string
  icon: string
  children: SubMenuItem[]
}

interface Props {
  userEmail?: string
}

withDefaults(defineProps<Props>(), {
  userEmail: 'insoo.kim@glovis.net',
})

const emit = defineEmits<{
  (e: 'select', payload: { sectionId: string; itemId: string }): void
  (e: 'logout'): void
}>()

/* ---------------------------------- Icons ---------------------------------- */
const icons: Record<string, string> = {
  brandmark: `<svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="gvisLogoGrad" x1="4" y1="4" x2="36" y2="36" gradientUnits="userSpaceOnUse">
        <stop offset="0" stop-color="#3fa2ff"/>
        <stop offset="1" stop-color="#0058d6"/>
      </linearGradient>
    </defs>
    <rect x="1" y="1" width="38" height="38" rx="11" fill="url(#gvisLogoGrad)"/>
    <circle cx="20" cy="20" r="9" stroke="#ffffff" stroke-width="1.6" stroke-opacity="0.5"/>
    <circle cx="20" cy="20" r="3.2" fill="#ffffff"/>
    <circle cx="28" cy="14.4" r="2.1" fill="#ffffff"/>
  </svg>`,
  monitor: `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="3" y="4.5" width="18" height="12" rx="1.6" stroke="currentColor" stroke-width="1.8"/>
    <path d="M8.5 20.5H15.5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
    <path d="M12 16.5V20.5" stroke="currentColor" stroke-width="1.8"/>
    <path d="M6.5 8.5H12.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
    <path d="M6.5 11.5H10" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
  </svg>`,
  logistics: `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M20 8.5A8 8 0 0 0 6.2 5.3" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
    <path d="M6.2 5.3 5.4 8.7" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M6.2 5.3 9.5 6.5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M4 15.5A8 8 0 0 0 17.8 18.7" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
    <path d="M17.8 18.7 18.6 15.3" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M17.8 18.7 14.5 17.5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>`,
  chart: `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="3.5" y="3.5" width="17" height="17" rx="1.6" stroke="currentColor" stroke-width="1.8"/>
    <path d="M7.5 15.5V13" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
    <path d="M12 15.5V9" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
    <path d="M16.5 15.5V11.5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
  </svg>`,
  document: `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M6.5 3.5H14L18 7.5V20.5H6.5V3.5Z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/>
    <path d="M14 3.5V7.5H18" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/>
    <path d="M9 12H15" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
    <path d="M9 15.5H15" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
  </svg>`,
  chevronDown: `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M6 9.5 12 15.5 18 9.5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>`,
  chevronRight: `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M9.5 6 15.5 12 9.5 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>`,
  chevronLeft: `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M14.5 6 8.5 12 14.5 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>`,
  settings: `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="1.8"/>
    <path d="M19.4 13.4a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V19.5a2 2 0 1 1-4 0v-.09a1.65 1.65 0 0 0-1.08-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H4.5a2 2 0 1 1 0-4h.09a1.65 1.65 0 0 0 1.51-1.08 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H10.5a1.65 1.65 0 0 0 1-1.51V4.5a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V10.5a1.65 1.65 0 0 0 1.51 1H19.5a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1Z" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round"/>
  </svg>`,
  announcement: `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M3.5 10.5V14.5H6.5L12.5 18V7L6.5 10.5H3.5Z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/>
    <path d="M16.5 9.5A3.5 3.5 0 0 1 16.5 15.5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>
    <path d="M18.7 7A6.5 6.5 0 0 1 18.7 18" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>
  </svg>`,
  logout: `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M15.5 8V6.5A2.5 2.5 0 0 0 13 4H6.5A2.5 2.5 0 0 0 4 6.5v11A2.5 2.5 0 0 0 6.5 20H13a2.5 2.5 0 0 0 2.5-2.5V16" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M9.5 12H21" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
    <path d="M17.5 8 21 12l-3.5 4" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>`,
}

/* -------------------------------- Menu data -------------------------------- */
const menuSections: MenuSection[] = [
  {
    id: 'inventory-status',
    label: 'Inventory Status',
    icon: 'monitor',
    children: [
      { id: 'overview', label: 'Overview' },
      { id: 'shipping-detail', label: 'Shipping Detail' },
      { id: 'cc-inventory-detail', label: 'C/C Inventory Detail' },
    ],
  },
  {
    id: 'logistics-tracking',
    label: 'Losistics Tracking',
    icon: 'logistics',
    children: [
      { id: 'vessel-monitoring', label: 'Vessel Monitoring' },
      { id: 'cargo-tracking', label: 'Cargo Tracking' },
    ],
  },
  {
    id: 'data-analysis',
    label: 'Data Analysis',
    icon: 'chart',
    children: [
      { id: 'eta-accuracy', label: 'ETA Accuracy' },
      { id: 'lead-time-analysis', label: 'Lead Time Analysis' },
      { id: 'volume-analysis', label: 'Volume Analysis' },
      { id: 'pipeline-inventory-status', label: 'Pipeline Inventory S...' },
    ],
  },
  {
    id: 'data-monitoring',
    label: 'Data Monitoring',
    icon: 'document',
    children: [
      { id: 'completeness', label: 'Completeness' },
      { id: 'consistency', label: 'Consistency' },
      { id: 'input-rate', label: 'Input Rate' },
      { id: 'abnormality', label: 'Abnormality' },
    ],
  },
]

/* --------------------------------- State ---------------------------------- */
const expandedSections = reactive<Record<string, boolean>>(
  menuSections.reduce(
    (acc, section) => {
      acc[section.id] = true
      return acc
    },
    {} as Record<string, boolean>,
  ),
)

const activeSectionId = ref<string>('inventory-status')
const activeItemId = ref<string>('overview')
const isCollapsed = ref<boolean>(false)

/* -------------------------------- Methods ---------------------------------- */
function toggleSection(sectionId: string): void {
  if (isCollapsed.value) {
    isCollapsed.value = false
  }
  expandedSections[sectionId] = !expandedSections[sectionId]
}

function selectItem(sectionId: string, itemId: string): void {
  activeSectionId.value = sectionId
  activeItemId.value = itemId
  expandedSections[sectionId] = true
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
  gap: 11px;
  padding: 0 4px;
  margin-bottom: $spacing-sm;
}

.gvis-sidebar__logo-icon {
  display: flex;
  width: $icon-size-xl;
  height: $icon-size-xl;
  flex-shrink: 0;
  border-radius: 11px;
  box-shadow: 0 6px 14px rgba(0, 122, 255, 0.28);

  :deep(svg) {
    display: block;
  }
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
    background: $color-bg-soft;
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
  transform: rotate(-90deg);
  transition: transform 0.2s ease;

  &--open {
    transform: rotate(0deg);
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
}
</style>
