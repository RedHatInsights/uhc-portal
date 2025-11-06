/*
This file contains all the feature gates used in the OCMUI application.

To add a new feature gate, add an export like this:
     export const VAR_TO_BE_USED_IN_APP = 'feature-name-used-in-unleash';

Then add this constant to the default export below

NOTE:  When adding a new feature gate or changing who has the feature gate enabled/disabled,
Be sure to create/update the feature gate in Unleash:
  * Staging: https://ocm-stage.unleash.devshift.net/projects/default/features
  * Production: https://ocm.unleash.devshift.net/projects/default/features

In addition, update this spreadsheet used by QE testers:
https://docs.google.com/spreadsheets/d/16aMLmHXHGenkDQb82nhnCbCj5OEraWENK6pcaDYG7bw/edit?gid=1338784370#gid=1338784370
*/

export const HYPERSHIFT_WIZARD_FEATURE = 'hypershift-creation-wizard';
export const HCP_USE_UNMANAGED = 'hcp-use-unmanaged-policies';
export const ENABLE_MACHINE_CONFIGURATION = 'enable-machine-configuration';
export const CLI_SSO_AUTHORIZATION = 'cli-sso-authorization';
export const MULTIREGION_PREVIEW_ENABLED = 'multi-region-support';
export const CLUSTER_OWNERSHIP_TRANSFER = 'cluster-ownership-transfer';
export const AUTO_CLUSTER_TRANSFER_OWNERSHIP = 'ocmui-cluster-ownership-transfer';
export const OSD_GCP_WIF = 'gcp-workload-identity-federation';
export const CREATE_CLUSTER_YAML_EDITOR = 'enable-create-cluster-yaml-editor';
export const UNSTABLE_CLUSTER_VERSIONS = 'ocmui-unstable-cluster-versions';
export const EDIT_BILLING_ACCOUNT = 'ocmui-edit-billing-account';
export const PRIVATE_SERVICE_CONNECT = 'ocmui-gcp-private-service-connect';
export const BYPASS_COMPUTE_NODE_COUNT_LIMIT_CLASSIC_OSD_GCP =
  'bypass-compute-node-count-limit-classic-osd-gcp';
export const MAX_NODES_TOTAL_249 = 'ocmui-max-nodes-total-249';
export const ENHANCED_HTPASSWRD = 'ocmui-enhanced-htpasswrd';
export const ASSISTED_MIGRATION_ENABLED = 'assisted-migration';
export const GCP_SECURE_BOOT = 'ocmui-gcp-secure-boot';
export const HIDE_RH_MARKETPLACE = 'OCMUI-hide-rh-marketplace';
export const IMDS_SELECTION = 'ocmui-imds-selection';
export const AWS_TAGS_NEW_MP = 'ocmui-aws-tags-new-mp';
export const TABBED_MACHINE_POOL_MODAL = 'ocmui-tabbed-machine-pool-modal';
export const ROSA_ARCHITECTURE_RENAMING_ALERT = 'ocmui-rosa-architecture-renaming-alert';
export const GCP_WIF_DEFAULT = 'ocmui-gcp-wif-default';
export const MP_ADDITIONAL_MAINTENANCE_VALUES = 'ocmui-mp-additional-maintenance-values';
export const WINDOWS_LICENSE_INCLUDED = 'ocmui-windows-license-included';
export const ALLOW_EUS_CHANNEL = 'ocmui-allow-eus-channel';
export const PLATFORM_LIGHTSPEED_REBRAND = 'platform.lightspeed-rebrand';
export const CAPACITY_RESERVATION_ID_FIELD = 'ocmui-capacity-reservation-id-field';

export const ENABLE_AWS_TAGS_EDITING = false;

export default {
  AUTO_CLUSTER_TRANSFER_OWNERSHIP,
  HYPERSHIFT_WIZARD_FEATURE,
  HCP_USE_UNMANAGED,
  ENABLE_MACHINE_CONFIGURATION,
  CLI_SSO_AUTHORIZATION,
  MULTIREGION_PREVIEW_ENABLED,
  CLUSTER_OWNERSHIP_TRANSFER,
  OSD_GCP_WIF,
  CREATE_CLUSTER_YAML_EDITOR,
  UNSTABLE_CLUSTER_VERSIONS,
  EDIT_BILLING_ACCOUNT,
  PRIVATE_SERVICE_CONNECT,
  BYPASS_COMPUTE_NODE_COUNT_LIMIT_CLASSIC_OSD_GCP,
  MAX_NODES_TOTAL_249,
  ENHANCED_HTPASSWRD,
  ASSISTED_MIGRATION_ENABLED,
  GCP_SECURE_BOOT,
  HIDE_RH_MARKETPLACE,
  IMDS_SELECTION,
  AWS_TAGS_NEW_MP,
  TABBED_MACHINE_POOL_MODAL,
  ROSA_ARCHITECTURE_RENAMING_ALERT,
  GCP_WIF_DEFAULT,
  MP_ADDITIONAL_MAINTENANCE_VALUES,
  WINDOWS_LICENSE_INCLUDED,
  ALLOW_EUS_CHANNEL,
  PLATFORM_LIGHTSPEED_REBRAND,
  CAPACITY_RESERVATION_ID_FIELD,
} as const;
