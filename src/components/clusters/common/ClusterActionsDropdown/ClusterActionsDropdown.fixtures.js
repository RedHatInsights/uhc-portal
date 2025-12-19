import clusterStates from '../clusterStates';

const cluster = {
  id: 1,
  name: 'test-cluster',
  display_name: 'test-cluster',
  state: clusterStates.ready,
  console: { url: 'www.testuhc.com' },
  managed: true,
  ccs: {
    enabled: false,
  },
  canEdit: true,
  canDelete: true,
  status: {
    state: clusterStates.ready,
    dns_ready: true,
    configuration_mode: 'full',
  },
  subscription: {
    id: 'subscription-id',
  },
  delete_protection: { enabled: false },
};

const osdTrialCluster = {
  product: {
    kind: 'ProductLink',
    // value after normalization
    id: 'OSDTrial',
    href: '/api/clusters_mgmt/v1/products/osdtrial?trial=osd',
  },
  ...cluster,
};

const props = {
  showConsoleButton: true,
  canSubscribeOCP: false,
  canHibernateCluster: true,
  canTransferClusterOwnership: false,
  isAutoClusterTransferOwnershipEnabled: false,
  openModal: jest.fn(),
  toggleSubscriptionReleased: jest.fn(),
  refreshFunc: jest.fn(),
  inClusterList: false,
};

const managedReadyProps = {
  cluster: { ...cluster },
  ...props,
};

const hyperShiftReadyProps = {
  cluster: { ...cluster, hypershift: { enabled: true } },
  ...props,
};

const managedReadyOsdTrialProps = {
  cluster: { ...osdTrialCluster },
  ...props,
};

const hibernateClusterModalData = {
  clusterID: cluster.id,
  clusterName: cluster.name,
  subscriptionID: cluster.subscription.id,
};

const deleteModalData = {
  clusterID: cluster.id,
  clusterName: cluster.name,
};

const clusterHibernatingProps = {
  cluster: {
    ...cluster,
    state: clusterStates.hibernating,
    status: {
      ...cluster.status,
      state: clusterStates.hibernating,
    },
  },
  ...props,
};

const clusterUninstallingProps = {
  cluster: {
    ...cluster,
    state: clusterStates.uninstalling,
    status: {
      ...cluster.status,
      state: clusterStates.uninstalling,
    },
  },
  ...props,
};

const clusterNotReadyProps = {
  cluster: {
    ...cluster,
    console: undefined,
    state: clusterStates.error,
    status: {
      state: clusterStates.error,
      dns_ready: false,
      provision_error_message: 'some message',
      provision_error_code: 'some code',
    },
  },
  ...props,
};

const clusterReadOnlyProps = {
  cluster: {
    ...cluster,
    status: {
      ...cluster.status,
      configuration_mode: 'read_only',
    },
  },
  ...props,
};

const selfManagedProps = {
  cluster: {
    state: clusterStates.ready,
    managed: false,
    ccs: {
      enabled: false,
    },
    canEdit: true,
    canDelete: true,
    subscription: { plan: { type: 'OCP' } },
  },
  subscription: {
    items: [
      {
        id: 42,
        support_level: 'Standard',
        plan: {
          id: 'OCP',
        },
      },
    ],
  },
  organization: {
    ebs_account_id: '123456',
  },
  ...props,
};
const readyRosa = {
  cluster: {
    state: clusterStates.ready,
    managed: false,
    ccs: {
      enabled: false,
    },
    canEdit: true,
    canDelete: true,
    subscription: { plan: { type: 'ROSA' } },
    product: {
      id: 'ROSA',
    },
  },
  subscription: {
    items: [
      {
        id: 42,
        support_level: 'Standard',
        plan: {
          id: 'ROSA',
        },
      },
    ],
  },
  organization: {
    ebs_account_id: '123456',
  },
  ...props,
};
const disconnectOCP = {
  cluster: {
    state: clusterStates.disconnected,
    managed: false,
    ccs: {
      enabled: false,
    },
    canEdit: true,
    canDelete: true,
    subscription: { plan: { type: 'OCP' } },
  },
  subscription: {
    items: [
      {
        id: 42,
        support_level: 'Standard',
        plan: {
          id: 'OCP',
        },
      },
    ],
  },
  organization: {
    ebs_account_id: '123456',
  },
  ...props,
};

const rhoicCluster = {
  cluster: {
    ...cluster,
    subscription: {
      plan: {
        id: 'RHOIC',
        type: 'RHOIC',
      },
    },

    organization: {
      ebs_account_id: '123456',
    },
    showConsoleButton: true,
    canSubscribeOCP: true,
    canHibernateCluster: true,
    openModal: jest.fn(),
    toggleSubscriptionReleased: jest.fn(),
    refreshFunc: jest.fn(),
  },
  showConsoleButton: false,
  openModal: jest.fn(),
  canSubscribeOCP: false,
  canHibernateCluster: false,
  canTransferClusterOwnership: false,
  isAutoClusterTransferOwnershipEnabled: false,
  refreshFunc: jest.fn(),
  toggleSubscriptionReleased: jest.fn(),
};

const organizationClusterProps = {
  cluster: { ...cluster, canEdit: false, canDelete: false },
  ...props,
};

export {
  managedReadyProps,
  managedReadyOsdTrialProps,
  deleteModalData,
  clusterHibernatingProps,
  clusterUninstallingProps,
  clusterNotReadyProps,
  clusterReadOnlyProps,
  selfManagedProps,
  readyRosa,
  disconnectOCP,
  cluster,
  osdTrialCluster,
  organizationClusterProps,
  hibernateClusterModalData,
  hyperShiftReadyProps,
  rhoicCluster,
};
