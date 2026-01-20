import type { BreadcrumbPath } from '~/components/common/Breadcrumbs';

export const BREADCRUMB_PATHS = {
  CLUSTER_LIST: { label: 'Cluster List', path: '/cluster-list' },
  CLUSTER_TYPE: { label: 'Cluster Type', path: '/create' },
  CLUSTER_ARCHIVES: { label: 'Cluster Archives', path: '/archived' },
  OVERVIEW: { label: 'Overview', path: '/overview' },
  DOWNLOADS: { label: 'Downloads', path: '/downloads' },
  ROSA_SETUP: { label: 'Set up ROSA', path: '/create/rosa/getstarted' },
  OSD: { label: 'OpenShift Dedicated', path: '/create/osd' },
  CREATE_CLOUD: { label: 'Create Cloud', path: '/create/cloud' },
} as const;

export const buildBreadcrumbs = (
  ...paths: Array<BreadcrumbPath | null | undefined | false>
): BreadcrumbPath[] => paths.filter(Boolean) as BreadcrumbPath[];
