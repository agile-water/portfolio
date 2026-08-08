import { createRouter, createWebHistory, type RouteRecordRaw, type RouteComponent } from 'vue-router'

import { menuSections, routeNameOf, routePathOf } from '@/config/navigation'

/**
 * 특정 화면(라우트 이름)에 실제 뷰 컴포넌트를 연결하고 싶으면 여기에 추가하세요.
 * 등록하지 않은 화면은 기본값으로 PlaceholderView가 대신 표시됩니다.
 */
const viewComponents: Record<string, () => Promise<RouteComponent>> = {
  [routeNameOf('inventory-status', 'overview')]: () => import('@/views/OverviewView.vue'),
}

const menuRoutes: RouteRecordRaw[] = menuSections.flatMap((section) =>
  section.children.map((item) => {
    const name = routeNameOf(section.id, item.id)
    return {
      path: routePathOf(section.id, item.id),
      name,
      component: viewComponents[name] ?? (() => import('@/views/PlaceholderView.vue')),
      meta: {
        sectionId: section.id,
        sectionLabel: section.label,
        itemId: item.id,
        itemLabel: item.label,
      },
    }
  }),
)

const firstSection = menuSections[0]
const firstItem = firstSection?.children[0]

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    redirect: firstSection && firstItem ? routePathOf(firstSection.id, firstItem.id) : '/',
  },
  ...menuRoutes,
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

export default router
