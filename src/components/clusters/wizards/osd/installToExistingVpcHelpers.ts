import { splitVersion } from '~/common/versionHelpers';

export const OCP5_EXISTING_VPC_ALERT_TITLE = 'OpenShift 5 requires an existing VPC on GCP WIF';

export const OCP5_EXISTING_VPC_ALERT_BODY =
  'Clusters running OpenShift 5 with Workload Identity Federation on GCP are only supported with a customer-provided VPC. If you want the VPC to be created automatically, return to the Cluster details step and select an OpenShift 4 version.';

const PRIVATE_NETWORK_CONNECTIVITY_WARNING =
  'You will not be able to access your cluster until you properly configure private network connectivity to your cloud provider.';

export const PRIVATE_WIF_EXISTING_VPC_ALERT = `Private clusters deployed using Workload Identity Federation must be deployed into an existing VPC. ${PRIVATE_NETWORK_CONNECTIVITY_WARNING}`;

export type ExistingVpcWarningAlert = {
  title: string;
  body?: string;
};

/**
 * Warning shown on the networking step when an existing VPC is required.
 */
export const getExistingVpcWarningAlert = ({
  isPrivateCluster,
  isGcpPrivateWif,
  requiresOcp5ExistingVpc,
}: {
  isPrivateCluster: boolean;
  isGcpPrivateWif: boolean;
  requiresOcp5ExistingVpc: boolean;
}): ExistingVpcWarningAlert | undefined => {
  if (isPrivateCluster) {
    if (isGcpPrivateWif) {
      return { title: PRIVATE_WIF_EXISTING_VPC_ALERT };
    }

    return {
      title: ` ${PRIVATE_NETWORK_CONNECTIVITY_WARNING}`,
    };
  }

  if (requiresOcp5ExistingVpc) {
    return {
      title: OCP5_EXISTING_VPC_ALERT_TITLE,
      body: OCP5_EXISTING_VPC_ALERT_BODY,
    };
  }

  return undefined;
};

/**
 * OpenShift 5 on OSD GCP WIF can only be installed into a customer VPC.
 * `splitVersion` is used because the other version helpers compare major and minor together.
 * `isMajorMinorEqualOrGreater(version, 5, 0)` would also match 6.x and later.
 */
export const requiresExistingVpcForOcp5 = ({
  isOcp5SupportEnabled,
  isByoc,
  isGcp,
  isWif,
  clusterVersionRawId,
  organizationAllowsOcp5,
}: {
  isOcp5SupportEnabled: boolean;
  isByoc: boolean;
  isGcp: boolean;
  isWif: boolean;
  clusterVersionRawId?: string;
  organizationAllowsOcp5: boolean;
}): boolean => {
  if (
    organizationAllowsOcp5 ||
    !isOcp5SupportEnabled ||
    !isByoc ||
    !isGcp ||
    !isWif ||
    !clusterVersionRawId
  ) {
    return false;
  }

  const [major] = splitVersion(clusterVersionRawId);
  return major === 5;
};

export const INSTALL_TO_VPC_CHOSEN_BY_USER = 'install_to_vpc_chosen_by_user';
export const INSTALL_TO_VPC_FORCED_BY_OCP5 = 'install_to_vpc_forced_by_ocp5';

export type InstallToVpcSelectionState = {
  installToVpc: boolean;
  installToVpcChosenByUser: boolean;
  installToVpcForcedByOcp5: boolean;
};

/**
 * Decides the existing-VPC checkbox after a version change.
 * A checked box counts as the user's choice only while it is still checked.
 */
export const installToVpcStateAfterVersionChange = ({
  installToVpc,
  installToVpcChosenByUser,
  installToVpcForcedByOcp5,
  nextRequiresExistingVpc,
  previousRequiresExistingVpc,
  isInstallToVpcForced,
}: {
  installToVpc: boolean;
  installToVpcChosenByUser: boolean;
  installToVpcForcedByOcp5: boolean;
  nextRequiresExistingVpc: boolean;
  previousRequiresExistingVpc: boolean;
  isInstallToVpcForced: boolean;
}): InstallToVpcSelectionState => {
  const userChoseInstallToVpc = installToVpcChosenByUser && installToVpc;

  if (nextRequiresExistingVpc) {
    return {
      installToVpc: true,
      installToVpcChosenByUser: userChoseInstallToVpc,
      installToVpcForcedByOcp5: !userChoseInstallToVpc,
    };
  }

  const clearOcp5ForcedInstallToVpc =
    !isInstallToVpcForced &&
    !userChoseInstallToVpc &&
    (previousRequiresExistingVpc || installToVpcForcedByOcp5);

  if (clearOcp5ForcedInstallToVpc) {
    return {
      installToVpc: false,
      installToVpcChosenByUser: false,
      installToVpcForcedByOcp5: false,
    };
  }

  return {
    installToVpc,
    installToVpcChosenByUser: userChoseInstallToVpc,
    installToVpcForcedByOcp5: false,
  };
};

/** Reasons the existing-VPC checkbox is already forced, independent of the OpenShift 5 rule. */
export const isInstallToVpcForcedByOtherSetting = ({
  usePrivateLink,
  configureProxy,
  isPrivateCluster,
  isWif,
  isOSDFromGoogleCloud,
  usePrivateServiceConnect,
}: {
  usePrivateLink: boolean;
  configureProxy: boolean;
  isPrivateCluster: boolean;
  isWif: boolean;
  isOSDFromGoogleCloud: boolean;
  usePrivateServiceConnect: boolean;
}): boolean =>
  usePrivateLink ||
  configureProxy ||
  (isPrivateCluster && isWif) ||
  isOSDFromGoogleCloud ||
  usePrivateServiceConnect;
