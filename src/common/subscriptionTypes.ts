import { ClusterAuthorizationRequestProduct_id as ClusterAuthorizationRequestProductId } from '~/types/accounts_mgmt.v1';

/**
 * names of all subscriptioin settings
 * @enum string
 */
const subscriptionSettings = {
  SUPPORT_LEVEL: 'support_level',
  USAGE: 'usage',
  SERVICE_LEVEL: 'service_level',
  PRODUCT_BUNDLE: 'product_bundle',
  SYSTEM_UNITS: 'system_units',
  CPU_TOTAL: 'cpu_total',
  SOCKET_TOTAL: 'socket_total',
  CLUSTER_BILLING_MODEL: 'cluster_billing_model',
  EVALUATION_EXPIRATION_DATE: 'evaluation_expiration_date',
};

const rosaProducts = {
  ROSA: 'ROSA',
  ROSA_HyperShift: 'ROSA-HyperShift',
};

const anyUnknownProducts = {
  ANY: 'ANY', // used in quota_cost
  UNKNOWN: 'UNKNOWN', // normally should not happen except during loading
};

/**
 * Possible results of normalizeProductID() that are actual products.
 * See `normalizedProducts` for the other possible results.
 * @enum string
 */
const {
  OSD,
  OSDTrial,
  OCP,
  RHMI,
  ARO,
  // eslint-disable-next-line camelcase
  OCP_AssistedInstall,
  RHACS,
  RHACSTrial,
  RHOSR,
  RHOSRTrial,
  RHOSAK,
  RHOSAKTrial,
  RHOSE,
  RHOSETrial,
  RHOIC,
  ROVS,
} = ClusterAuthorizationRequestProductId;

const knownProducts = {
  OSD,
  OSDTrial,
  OCP,
  RHMI,
  ARO,
  // eslint-disable-next-line camelcase
  OCP_AssistedInstall,
  RHACS,
  RHACSTrial,
  RHOSR,
  RHOSRTrial,
  RHOSAK,
  RHOSAKTrial,
  RHOSE,
  RHOSETrial,
  RHOIC,
  ROVS,
  ...rosaProducts,
};

// List of allowed products to display
const allowedProducts = [
  ClusterAuthorizationRequestProductId.OSD,
  ClusterAuthorizationRequestProductId.OSDTrial,
  ClusterAuthorizationRequestProductId.OCP,
  ClusterAuthorizationRequestProductId.RHMI,
  rosaProducts.ROSA,
  ClusterAuthorizationRequestProductId.RHOIC,
  ClusterAuthorizationRequestProductId.MOA,
  ClusterAuthorizationRequestProductId.MOA_HostedControlPlane,
  rosaProducts.ROSA_HyperShift,
  ClusterAuthorizationRequestProductId.ARO,
  ClusterAuthorizationRequestProductId.OCP_AssistedInstall,
];

const rovsFilterOption = {
  key: ROVS,
  label: 'ROVS',
  plansToQuery: [ROVS],
};

/** Returns products allowed in cluster list queries; includes ROVS when gated on. */
const getAllowedProducts = (includeRovs = false): string[] =>
  includeRovs ? [...allowedProducts, ROVS] : allowedProducts;

/**
 * cluster.product.id, subscription.plan.type, subscription.plan.id,
 * quota_cost.related_resources[].product
 * use related but different values (see https://issues.redhat.com/browse/SDB-1625).
 * They should all be passed through normalizeProductID(), should result in one of the values here.
 * @enum string
 */
const normalizedProducts = { ...knownProducts, ...anyUnknownProducts };

/**
 * product IDs that are managed by Clusters Service
 *
 */
const clustersServiceProducts = [
  ClusterAuthorizationRequestProductId.OSD,
  ClusterAuthorizationRequestProductId.OSDTrial,
  rosaProducts.ROSA,
  rosaProducts.ROSA_HyperShift,
  ClusterAuthorizationRequestProductId.RHMI,
  ClusterAuthorizationRequestProductId.ARO,
];

/**
 * Products by which UI allows to filter.
 * key is used internally and for URL ?plan_id=.
 * label is how it's shown in the UI.
 * plansToQuery are pre-normalization value to send to account-manager in ?search= query.
 */
const productFilterOptions = [
  {
    key: ClusterAuthorizationRequestProductId.OCP,
    label: 'OCP',
    plansToQuery: ['OCP', 'OCP-AssistedInstall'],
  },
  { key: ClusterAuthorizationRequestProductId.OSD, label: 'OSD', plansToQuery: ['OSD'] },
  {
    key: rosaProducts.ROSA,
    label: 'ROSA',
    plansToQuery: ['MOA', 'ROSA', 'MOA-HostedControlPlane'],
  },
  { key: ClusterAuthorizationRequestProductId.ARO, label: 'ARO', plansToQuery: ['ARO'] },
  { key: ClusterAuthorizationRequestProductId.RHOIC, label: 'RHOIC', plansToQuery: ['RHOIC'] },
];

/** Returns cluster-type filter options; includes ROVS when gated on. */
const getProductFilterOptions = (includeRovs = false) =>
  includeRovs ? [...productFilterOptions, rovsFilterOption] : productFilterOptions;

const STANDARD_TRIAL_BILLING_MODEL_TYPE = 'standard-trial';

type OcmRoleItem = {
  id: string;
  name: string;
  description: string;
  // ProductIds for which granting new role bindings should not be allowed
  excludeProductIds?: string[];
};

/**
 * The ocmRoles contains all available roles that a customer
 * can grant to other users within their own organization.
 */
const ocmRoles: Record<string, OcmRoleItem> = {
  CLUSTER_EDITOR: {
    id: 'ClusterEditor',
    name: 'Cluster editor',
    description:
      'Cluster editor role will allow users or groups to manage and configure the cluster.',
  },
  CLUSTER_VIEWER: {
    id: 'ClusterViewer',
    name: 'Cluster viewer',
    description: 'Cluster viewer role will allow users or groups to view cluster details only.',
  },
  CLUSTER_AUTOSCALER_EDITOR: {
    id: 'ClusterAutoscalerEditor',
    name: 'Cluster autoscaler editor',
    description:
      'Cluster autoscaler editor role will allow users or groups to manage and configure the cluster autoscaler settings.',
    excludeProductIds: [rosaProducts.ROSA_HyperShift],
  },
  IDP_EDITOR: {
    id: 'IdpEditor',
    name: 'Identity provider editor',
    description:
      'Identity provider editor role will allow users or groups to manage and configure the identity providers.',
  },
  MACHINE_POOL_EDITOR: {
    id: 'MachinePoolEditor',
    name: 'Machine pool editor',
    description:
      'Machine pool editor role will allow users or groups to manage and configure the machine pools.',
  },
};

export {
  clustersServiceProducts,
  getAllowedProducts,
  getProductFilterOptions,
  knownProducts,
  normalizedProducts,
  ocmRoles,
  STANDARD_TRIAL_BILLING_MODEL_TYPE,
  subscriptionSettings,
};
