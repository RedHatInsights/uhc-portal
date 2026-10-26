import {
  getExistingVpcWarningAlert,
  installToVpcStateAfterVersionChange,
  isInstallToVpcForcedByOtherSetting,
  OCP5_EXISTING_VPC_ALERT_BODY,
  OCP5_EXISTING_VPC_ALERT_TITLE,
  PRIVATE_WIF_EXISTING_VPC_ALERT,
  requiresExistingVpcForOcp5,
} from './installToExistingVpcHelpers';

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
  });

  it('is false for a service account when the organization is allowed to use OpenShift 5', () => {
    expect(
      requiresExistingVpcForOcp5({
        ...enabledGcpWif,
        isWif: false,
        organizationAllowsOcp5: true,
        clusterVersionRawId: '5.0.1',
      }),
    ).toBe(false);
  });

  it('is false when the cluster is not a customer cloud subscription', () => {
    expect(
      requiresExistingVpcForOcp5({ ...enabledGcpWif, isByoc: false, clusterVersionRawId: '5.0.1' }),
    ).toBe(false);
  });

  it('is false when the cloud provider is not GCP', () => {
    expect(
      requiresExistingVpcForOcp5({ ...enabledGcpWif, isGcp: false, clusterVersionRawId: '5.0.1' }),
    ).toBe(false);
  });

  it('is false when the authentication type is not Workload Identity Federation', () => {
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
    usePrivateServiceConnect: false,
  };

  it('is false when none of the other install-to-VPC constraints apply', () => {
    expect(isInstallToVpcForcedByOtherSetting(optional)).toBe(false);
  });

  it('is true when private link requires an existing VPC', () => {
    expect(isInstallToVpcForcedByOtherSetting({ ...optional, usePrivateLink: true })).toBe(true);
  });

  it('is true when a cluster-wide proxy requires an existing VPC', () => {
    expect(isInstallToVpcForcedByOtherSetting({ ...optional, configureProxy: true })).toBe(true);
  });

  it('is true when a private Workload Identity Federation cluster requires an existing VPC', () => {
    expect(
      isInstallToVpcForcedByOtherSetting({ ...optional, isPrivateCluster: true, isWif: true }),
    ).toBe(true);
  });

  it('is true when the cluster is created from Google Cloud', () => {
    expect(isInstallToVpcForcedByOtherSetting({ ...optional, isOSDFromGoogleCloud: true })).toBe(
      true,
    );
  });

  it('is true when Private Service Connect requires an existing VPC', () => {
    expect(
      isInstallToVpcForcedByOtherSetting({ ...optional, usePrivateServiceConnect: true }),
    ).toBe(true);
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

  it('keeps the private Workload Identity Federation warning when OpenShift 5 also requires an existing VPC', () => {
    expect(
      getExistingVpcWarningAlert({
        isPrivateCluster: true,
        isGcpPrivateWif: true,
        requiresOcp5ExistingVpc: true,
      }),
    ).toEqual({ title: PRIVATE_WIF_EXISTING_VPC_ALERT });
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

describe('installToVpcStateAfterVersionChange', () => {
  const unchanged = {
    installToVpc: false,
    installToVpcChosenByUser: false,
    installToVpcForcedByOcp5: false,
    nextRequiresExistingVpc: false,
    previousRequiresExistingVpc: false,
    isInstallToVpcForced: false,
  };

  it('drops a stale user choice and records an OpenShift 5 force when the checkbox is already clear', () => {
    expect(
      installToVpcStateAfterVersionChange({
        ...unchanged,
        installToVpcChosenByUser: true,
        nextRequiresExistingVpc: true,
      }),
    ).toEqual({
      installToVpc: true,
      installToVpcChosenByUser: false,
      installToVpcForcedByOcp5: true,
    });
  });

  it('clears the checkbox when the OpenShift 5 force flag is set and the next version does not require an existing VPC', () => {
    expect(
      installToVpcStateAfterVersionChange({
        ...unchanged,
        installToVpc: true,
        installToVpcForcedByOcp5: true,
      }),
    ).toEqual({
      installToVpc: false,
      installToVpcChosenByUser: false,
      installToVpcForcedByOcp5: false,
    });
  });

  it('clears the checkbox when the previous version required an existing VPC and the user did not select it', () => {
    expect(
      installToVpcStateAfterVersionChange({
        ...unchanged,
        installToVpc: true,
        previousRequiresExistingVpc: true,
      }),
    ).toEqual({
      installToVpc: false,
      installToVpcChosenByUser: false,
      installToVpcForcedByOcp5: false,
    });
  });

  it('leaves the checkbox unchecked when another setting forces it but it is not selected', () => {
    expect(
      installToVpcStateAfterVersionChange({
        ...unchanged,
        isInstallToVpcForced: true,
      }),
    ).toEqual({
      installToVpc: false,
      installToVpcChosenByUser: false,
      installToVpcForcedByOcp5: false,
    });
  });

  it('keeps the checkbox when another setting still requires an existing VPC', () => {
    expect(
      installToVpcStateAfterVersionChange({
        ...unchanged,
        installToVpc: true,
        installToVpcForcedByOcp5: true,
        isInstallToVpcForced: true,
      }),
    ).toEqual({
      installToVpc: true,
      installToVpcChosenByUser: false,
      installToVpcForcedByOcp5: false,
    });
  });

  it('records an OpenShift 5 force when another setting had already checked the box', () => {
    expect(
      installToVpcStateAfterVersionChange({
        ...unchanged,
        installToVpc: true,
        nextRequiresExistingVpc: true,
        isInstallToVpcForced: true,
      }),
    ).toEqual({
      installToVpc: true,
      installToVpcChosenByUser: false,
      installToVpcForcedByOcp5: true,
    });
  });

  it('keeps a checkbox the user still has selected', () => {
    expect(
      installToVpcStateAfterVersionChange({
        ...unchanged,
        installToVpc: true,
        installToVpcChosenByUser: true,
        installToVpcForcedByOcp5: true,
        previousRequiresExistingVpc: true,
      }),
    ).toEqual({
      installToVpc: true,
      installToVpcChosenByUser: true,
      installToVpcForcedByOcp5: false,
    });
  });
});
