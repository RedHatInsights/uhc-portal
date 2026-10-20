import {
  getExistingVpcWarningAlert,
  isInstallToVpcForcedByOtherSetting,
  OCP5_EXISTING_VPC_ALERT_BODY,
  OCP5_EXISTING_VPC_ALERT_TITLE,
  PRIVATE_AND_OCP5_EXISTING_VPC_ALERT,
  PRIVATE_WIF_EXISTING_VPC_ALERT,
  requiresExistingVpcForOcp5,
  shouldClearOcp5ForcedInstallToVpc,
} from './requiresExistingVpcForOcp5';

const enabledGcpWif = {
  isOcp5SupportEnabled: true,
  isByoc: true,
  isGcp: true,
  isWif: true,
  organizationAllowsOcp5: false,
};

describe('requiresExistingVpcForOcp5', () => {
  it('is true for any 5.x version when GCP WIF BYOC and ocmui-ocp5-support are enabled', () => {
    expect(requiresExistingVpcForOcp5({ ...enabledGcpWif, clusterVersionRawId: '5.0.1' })).toBe(
      true,
    );
    expect(
      requiresExistingVpcForOcp5({ ...enabledGcpWif, clusterVersionRawId: '5.2.0-rc.1' }),
    ).toBe(true);
    expect(
      requiresExistingVpcForOcp5({
        ...enabledGcpWif,
        clusterVersionRawId: '5.0.0-0.nightly-2026-01-01',
      }),
    ).toBe(true);
  });

  it('is false when the version is not 5.x', () => {
    expect(requiresExistingVpcForOcp5({ ...enabledGcpWif, clusterVersionRawId: '4.18.1' })).toBe(
      false,
    );
    expect(requiresExistingVpcForOcp5({ ...enabledGcpWif, clusterVersionRawId: '6.0.0' })).toBe(
      false,
    );
  });

  it('is false when FF ocmui-ocp5-support is off', () => {
    expect(
      requiresExistingVpcForOcp5({
        ...enabledGcpWif,
        isOcp5SupportEnabled: false,
        clusterVersionRawId: '5.0.1',
      }),
    ).toBe(false);
  });

  it('is false when the organization is allowed to use OpenShift 5', () => {
    expect(
      requiresExistingVpcForOcp5({
        ...enabledGcpWif,
        organizationAllowsOcp5: true,
        clusterVersionRawId: '5.0.1',
      }),
    ).toBe(false);
    expect(
      requiresExistingVpcForOcp5({
        ...enabledGcpWif,
        isWif: false,
        organizationAllowsOcp5: true,
        clusterVersionRawId: '5.0.1',
      }),
    ).toBe(false);
  });

  it('is false when the cluster is not customer-cloud GCP WIF', () => {
    expect(
      requiresExistingVpcForOcp5({ ...enabledGcpWif, isByoc: false, clusterVersionRawId: '5.0.1' }),
    ).toBe(false);
    expect(
      requiresExistingVpcForOcp5({ ...enabledGcpWif, isGcp: false, clusterVersionRawId: '5.0.1' }),
    ).toBe(false);
    expect(
      requiresExistingVpcForOcp5({ ...enabledGcpWif, isWif: false, clusterVersionRawId: '5.0.1' }),
    ).toBe(false);
  });
});

describe('isInstallToVpcForcedByOtherSetting', () => {
  const optional = {
    usePrivateLink: false,
    configureProxy: false,
    isPrivateCluster: false,
    isWif: false,
    isOSDFromGoogleCloud: false,
  };

  it('is false when none of the other install-to-VPC constraints apply', () => {
    expect(isInstallToVpcForcedByOtherSetting(optional)).toBe(false);
  });

  it('is true when private link, cluster-wide proxy, private WIF, or OSD from Google Cloud applies', () => {
    expect(isInstallToVpcForcedByOtherSetting({ ...optional, usePrivateLink: true })).toBe(true);
    expect(isInstallToVpcForcedByOtherSetting({ ...optional, configureProxy: true })).toBe(true);
    expect(
      isInstallToVpcForcedByOtherSetting({ ...optional, isPrivateCluster: true, isWif: true }),
    ).toBe(true);
    expect(isInstallToVpcForcedByOtherSetting({ ...optional, isOSDFromGoogleCloud: true })).toBe(
      true,
    );
  });

  it('is false for a private cluster that does not use WIF', () => {
    expect(isInstallToVpcForcedByOtherSetting({ ...optional, isPrivateCluster: true })).toBe(false);
  });
});

describe('getExistingVpcWarningAlert', () => {
  const hidden = {
    isPrivateCluster: false,
    isGcpPrivateWif: false,
    requiresOcp5ExistingVpc: false,
  };

  it('uses the OpenShift 5 title and body when only OpenShift 5 requires an existing VPC', () => {
    expect(getExistingVpcWarningAlert({ ...hidden, requiresOcp5ExistingVpc: true })).toEqual({
      title: OCP5_EXISTING_VPC_ALERT_TITLE,
      body: OCP5_EXISTING_VPC_ALERT_BODY,
    });
  });

  it('uses the combined warning when OpenShift 5 and a private cluster both require an existing VPC', () => {
    expect(
      getExistingVpcWarningAlert({
        isPrivateCluster: true,
        isGcpPrivateWif: true,
        requiresOcp5ExistingVpc: true,
      }),
    ).toEqual({ title: PRIVATE_AND_OCP5_EXISTING_VPC_ALERT });
  });

  it('keeps the private Workload Identity Federation warning when the cluster is not OpenShift 5', () => {
    expect(
      getExistingVpcWarningAlert({
        isPrivateCluster: true,
        isGcpPrivateWif: true,
        requiresOcp5ExistingVpc: false,
      }),
    ).toEqual({ title: PRIVATE_WIF_EXISTING_VPC_ALERT });
  });

  it('keeps the private connectivity warning when the cluster is private without GCP WIF', () => {
    expect(
      getExistingVpcWarningAlert({
        isPrivateCluster: true,
        isGcpPrivateWif: false,
        requiresOcp5ExistingVpc: false,
      })?.title,
    ).toBe(
      ' You will not be able to access your cluster until you properly configure private network connectivity to your cloud provider.',
    );
  });

  it('returns no warning for a public cluster that does not require an existing VPC for OpenShift 5', () => {
    expect(getExistingVpcWarningAlert(hidden)).toBeUndefined();
  });
});

describe('shouldClearOcp5ForcedInstallToVpc', () => {
  const kept = {
    nextRequiresExistingVpc: false,
    previousRequiresExistingVpc: false,
    isInstallToVpcForced: false,
    installToVpcChosenByUser: false,
    installToVpcForcedByOcp5: false,
  };

  it('clears the checkbox when the previous version was cleared before OpenShift 4 is applied', () => {
    expect(
      shouldClearOcp5ForcedInstallToVpc({
        ...kept,
        installToVpcForcedByOcp5: true,
      }),
    ).toBe(true);
  });

  it('clears the checkbox when leaving OpenShift 5 and the user did not select the checkbox', () => {
    expect(
      shouldClearOcp5ForcedInstallToVpc({
        ...kept,
        previousRequiresExistingVpc: true,
      }),
    ).toBe(true);
  });

  it('keeps the checkbox when the user selected it', () => {
    expect(
      shouldClearOcp5ForcedInstallToVpc({
        ...kept,
        previousRequiresExistingVpc: true,
        installToVpcForcedByOcp5: true,
        installToVpcChosenByUser: true,
      }),
    ).toBe(false);
  });

  it('keeps the checkbox when another setting still requires an existing VPC', () => {
    expect(
      shouldClearOcp5ForcedInstallToVpc({
        ...kept,
        previousRequiresExistingVpc: true,
        isInstallToVpcForced: true,
      }),
    ).toBe(false);
  });
});
