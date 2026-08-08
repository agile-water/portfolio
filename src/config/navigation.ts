export interface SubMenuItem {
  id: string
  label: string
}

export interface MenuSection {
  id: string
  label: string
  icon: string
  children: SubMenuItem[]
}

export const menuSections: MenuSection[] = [
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

/** `${sectionId}.${itemId}` 형태의 라우트 이름을 만들어줍니다. */
export function routeNameOf(sectionId: string, itemId: string): string {
  return `${sectionId}.${itemId}`
}

/** `/${sectionId}/${itemId}` 형태의 라우트 경로를 만들어줍니다. */
export function routePathOf(sectionId: string, itemId: string): string {
  return `/${sectionId}/${itemId}`
}
