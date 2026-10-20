const GCP_OCP5_SERVICE_ACCOUNT_CREATION_WARNING =
  'OpenShift v5 is not supported with a Google Cloud service account. To install OpenShift v5, select Workload Identity Federation as the authentication type.';

const GCP_OCP5_RED_HAT_ACCOUNT_CREATION_WARNING =
  'To use OpenShift 5, go back and select Customer Cloud Subscription, then choose Workload Identity Federation as the authentication type.';

const GCP_OCP5_UNSUPPORTED_UPGRADE_WARNING =
  'Upgrading to OpenShift 5 on GCP requires Customer Cloud Subscription configured with Workload Identity Federation deployed into an existing VPC. To use OpenShift 5, create a new cluster with this configuration.';

export {
  GCP_OCP5_RED_HAT_ACCOUNT_CREATION_WARNING,
  GCP_OCP5_SERVICE_ACCOUNT_CREATION_WARNING,
  GCP_OCP5_UNSUPPORTED_UPGRADE_WARNING,
};
