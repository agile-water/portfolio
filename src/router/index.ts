import { createRouter, createWebHistory, type RouteRecordRaw, type RouteComponent } from 'vue-router'

import { menuSections, routeNameOf, routePathOf } from '@/config/navigation'

/**
 * 특정 화면(라우트 이름)에 실제 뷰 컴포넌트를 연결하고 싶으면 여기에 추가하세요.
 * 등록하지 않은 화면은 기본값으로 PlaceholderView가 대신 표시됩니다.
 */
const viewComponents: Record<string, () => Promise<RouteComponent>> = {
  [routeNameOf('inventory-status', 'overview')]: () => import('@/views/OverviewView.vue'),
  [routeNameOf('inventory-status', 'shipping-detail')]: () => import('@/views/ShippingDetailView.vue'),
  [routeNameOf('inventory-status', 'cc-inventory-detail')]: () =>
    import('@/views/inventory/CcInventoryDetailView.vue'),
  [routeNameOf('logistics-tracking', 'vessel-monitoring')]: () =>
    import('@/views/logistics/VesselMonitoringView.vue'),
  [routeNameOf('logistics-tracking', 'cargo-tracking')]: () =>
    import('@/views/logistics/CargoTrackingView.vue'),
  [routeNameOf('data-analysis', 'eta-accuracy')]: () => import('@/views/analysis/EtaAccuracyView.vue'),
  [routeNameOf('data-analysis', 'lead-time-analysis')]: () =>
    import('@/views/analysis/LeadTimeAnalysisView.vue'),
  [routeNameOf('data-analysis', 'volume-analysis')]: () => import('@/views/analysis/VolumeAnalysisView.vue'),
  [routeNameOf('data-analysis', 'pipeline-inventory-status')]: () =>
    import('@/views/analysis/PipelineInventoryStatusView.vue'),
  [routeNameOf('data-monitoring', 'completeness')]: () =>
    import('@/views/monitoring/CompletenessView.vue'),
  [routeNameOf('data-monitoring', 'consistency')]: () =>
    import('@/views/monitoring/ConsistencyView.vue'),
  [routeNameOf('data-monitoring', 'input-rate')]: () =>
    import('@/views/monitoring/InputRateView.vue'),
  [routeNameOf('data-monitoring', 'abnormality')]: () =>
    import('@/views/monitoring/AbnormalityView.vue'),
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
    // SideBar를 포함한 AppShellLayout을 여기서 한 번만 마운트하고, 실제 화면(menuRoutes)은
    // 전부 이 레이아웃의 자식 라우트로 두어 그 안의 <RouterView/>에서만 교체되게 합니다.
    // (화면 전환마다 SideBar까지 통째로 리마운트되어 펼침 상태/스크롤 위치가 초기화되던 문제 수정.
    // 자식 경로는 '/'로 시작하는 절대 경로를 그대로 써도 vue-router 4에서 중첩 라우트로 정상 동작합니다.)
    path: '/',
    component: () => import('@/components/layouts/AppShellLayout.vue'),
    children: [
      {
        path: '',
        redirect: firstSection && firstItem ? routePathOf(firstSection.id, firstItem.id) : '/',
      },
      ...menuRoutes,
    ],
  },
  {
    // 기존 레이아웃(SideBar)과 독립된 실험용 라우트라 AppShellLayout 밖에 둡니다.
    path: '/playground/shadcn-sidebar',
    name: 'playground-shadcn-sidebar',
    component: () => import('@/views/playground/ShadcnSidebarPlayground.vue'),
  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

export default router
