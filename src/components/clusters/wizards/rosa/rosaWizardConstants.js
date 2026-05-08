export const stepId = {
  ACCOUNTS_AND_ROLES_AS_FIRST_STEP: 5,
  CONTROL_PLANE: 10,
  ACCOUNTS_AND_ROLES_AS_SECOND_STEP: 15, // This is no longer used
  CLUSTER_SETTINGS: 20,
  CLUSTER_SETTINGS__DETAILS: 21,
  CLUSTER_SETTINGS__MACHINE_POOL: 23,
  NETWORKING: 30,
  NETWORKING__CONFIGURATION: 31,
  NETWORKING__VPC_SETTINGS: 32,
  NETWORKING__CLUSTER_WIDE_PROXY: 33,
  NETWORKING__CIDR_RANGES: 34,
  CLUSTER_ROLES_AND_POLICIES: 40,
  CLUSTER_UPDATES: 50, // Legacy wizard step id; no longer routed—use CLUSTER_ADDITIONAL_SETTINGS__UPDATES
  CLUSTER_ADDITIONAL_SETTINGS: 55,
  CLUSTER_ADDITIONAL_SETTINGS__UPDATES: 56,
  CLUSTER_ADDITIONAL_SETTINGS__LOG_FORWARDING: 57,
  REVIEW_AND_CREATE: 60,
};

export const getAccountAndRolesStepId = (isHypershiftEnabled) =>
  isHypershiftEnabled
    ? stepId.ACCOUNTS_AND_ROLES_AS_SECOND_STEP
    : stepId.ACCOUNTS_AND_ROLES_AS_FIRST_STEP;

export const hasLoadingState = (wizardStepId) => wizardStepId !== stepId.CONTROL_PLANE;

export const stepNameById = {
  [stepId.ACCOUNTS_AND_ROLES_AS_FIRST_STEP]: 'Accounts and roles',
  [stepId.ACCOUNTS_AND_ROLES_AS_SECOND_STEP]: 'Accounts and roles',
  [stepId.CONTROL_PLANE]: 'Control plane',
  [stepId.CLUSTER_SETTINGS]: 'Cluster settings',
  [stepId.CLUSTER_SETTINGS__DETAILS]: 'Details',
  [stepId.CLUSTER_SETTINGS__MACHINE_POOL]: 'Machine pool',
  [stepId.NETWORKING]: 'Networking',
  [stepId.NETWORKING__CONFIGURATION]: 'Configuration',
  [stepId.NETWORKING__VPC_SETTINGS]: 'VPC settings',
  [stepId.NETWORKING__CLUSTER_WIDE_PROXY]: 'Cluster-wide proxy',
  [stepId.NETWORKING__CIDR_RANGES]: 'CIDR ranges',
  [stepId.CLUSTER_ROLES_AND_POLICIES]: 'Cluster roles and policies',
  [stepId.CLUSTER_UPDATES]: 'Cluster updates',
  [stepId.CLUSTER_ADDITIONAL_SETTINGS]: 'Additional set up',
  [stepId.CLUSTER_ADDITIONAL_SETTINGS__UPDATES]: 'Cluster updates',
  [stepId.CLUSTER_ADDITIONAL_SETTINGS__LOG_FORWARDING]: 'Control plane log forwarding (optional)',
  [stepId.REVIEW_AND_CREATE]: 'Review and create',
};
