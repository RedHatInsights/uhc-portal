import React from 'react';
import { Formik, FormikValues } from 'formik';

import { useIsOSDFromGoogleCloud } from '~/components/clusters/wizards/osd/useIsOSDFromGoogleCloud';
import useAnalytics from '~/hooks/useAnalytics';
import { OCP5_SUPPORT } from '~/queries/featureGates/featureConstants';
import { mockUseFeatureGate, render, screen, waitFor } from '~/testUtils';

import { GCPAuthType } from '../ClusterSettings/CloudProvider/types';
import { FieldId, initialValues } from '../constants';
import {
  OCP5_EXISTING_VPC_ALERT_BODY,
  OCP5_EXISTING_VPC_ALERT_TITLE,
  PRIVATE_AND_OCP5_EXISTING_VPC_ALERT,
  PRIVATE_WIF_EXISTING_VPC_ALERT,
} from '../requiresExistingVpcForOcp5';

import { Configuration } from './Configuration';
import { ClusterPrivacyType } from './constants';

// Mock hooks
jest.mock('~/components/clusters/wizards/osd/useIsOSDFromGoogleCloud');
jest.mock('~/hooks/useAnalytics');

const mockUseIsOSDFromGoogleCloud = useIsOSDFromGoogleCloud as jest.Mock;
const mockUseAnalytics = useAnalytics as jest.Mock;

const installIntoExistingVpc = () =>
  screen.getByRole('checkbox', { name: 'Install into an existing VPC' });

const prepareComponent = (customValues?: FormikValues) => (
  <Formik
    initialValues={{
      ...initialValues,
      [FieldId.ClusterVersion]: { raw_id: '4.17.0' },
      ...customValues,
    }}
    onSubmit={() => {}}
  >
    {(props) => (
      <>
        <Configuration />
        <button type="submit" onClick={() => props.handleSubmit()}>
          Submit
        </button>
      </>
    )}
  </Formik>
);

describe('<Configuration /> using Serivce Account', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseIsOSDFromGoogleCloud.mockReturnValue(false);
    mockUseAnalytics.mockReturnValue(jest.fn());
  });

  describe('<Configuration /> with Public selected', () => {
    it('renders correctly with default fields', () => {
      render(
        prepareComponent({
          [FieldId.ClusterPrivacy]: ClusterPrivacyType.External,
          [FieldId.GcpAuthType]: GCPAuthType.ServiceAccounts,
          [FieldId.Byoc]: 'true',
          [FieldId.CloudProvider]: 'gcp',
        }),
      );
      expect(screen.queryByText('Install into an existing VPC')).toBeInTheDocument();
      expect(screen.queryByText('Configure a cluster-wide proxy')).toBeInTheDocument();
    });

    it('do not render PSC option for public', () => {
      render(
        prepareComponent({
          [FieldId.ClusterPrivacy]: ClusterPrivacyType.External,
          [FieldId.GcpAuthType]: GCPAuthType.ServiceAccounts,
          [FieldId.Byoc]: 'true',
          [FieldId.CloudProvider]: 'gcp',
        }),
      );
      expect(screen.queryByText('Install into an existing VPC')).toBeInTheDocument();
      expect(screen.queryByText('Configure a cluster-wide proxy')).toBeInTheDocument();
      expect(screen.queryByText('Use Private Service Connect')).not.toBeInTheDocument();
    });
  });

  describe('<Configuration /> using Service Account with Private selected', () => {
    it('does render Private service connect checkbox option for private', () => {
      render(
        prepareComponent({
          [FieldId.ClusterPrivacy]: ClusterPrivacyType.Internal,
          [FieldId.GcpAuthType]: GCPAuthType.ServiceAccounts,
          [FieldId.Byoc]: 'true',
          [FieldId.CloudProvider]: 'gcp',
        }),
      );
      expect(screen.queryByText('Install into an existing VPC')).toBeInTheDocument();
      expect(screen.queryByText('Configure a cluster-wide proxy')).toBeInTheDocument();
      expect(screen.queryByText('Use Private Service Connect')).toBeInTheDocument();
    });

    it('does render Private service connect checkbox and it is checked', () => {
      render(
        prepareComponent({
          [FieldId.ClusterPrivacy]: ClusterPrivacyType.Internal,
          [FieldId.GcpAuthType]: GCPAuthType.ServiceAccounts,
          [FieldId.Byoc]: 'true',
          [FieldId.CloudProvider]: 'gcp',
          [FieldId.PrivateServiceConnect]: true,
        }),
      );
      expect(screen.queryByText('Install into an existing VPC')).toBeInTheDocument();
      expect(screen.queryByText('Configure a cluster-wide proxy')).toBeInTheDocument();
      expect(screen.queryByText('Use Private Service Connect')).toBeInTheDocument();
      expect(
        screen.getByRole('checkbox', {
          name: 'Use Private Service Connect',
        }),
      ).toBeChecked();
    });
  });
});

describe('<Configuration /> using WIF', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseIsOSDFromGoogleCloud.mockReturnValue(false);
    mockUseAnalytics.mockReturnValue(jest.fn());
  });

  describe('<Configuration /> using WIF with Public selected', () => {
    it('renders correctly with default fields', () => {
      render(
        prepareComponent({
          [FieldId.ClusterPrivacy]: ClusterPrivacyType.External,
          [FieldId.GcpAuthType]: GCPAuthType.WorkloadIdentityFederation,
          [FieldId.Byoc]: 'true',
          [FieldId.CloudProvider]: 'gcp',
        }),
      );
      expect(screen.queryByText('Install into an existing VPC')).toBeInTheDocument();
      expect(screen.queryByText('Configure a cluster-wide proxy')).toBeInTheDocument();
    });
    it('do not render PSC option for public', () => {
      render(
        prepareComponent({
          [FieldId.ClusterPrivacy]: ClusterPrivacyType.External,
          [FieldId.GcpAuthType]: GCPAuthType.WorkloadIdentityFederation,
          [FieldId.Byoc]: 'true',
          [FieldId.CloudProvider]: 'gcp',
        }),
      );
      expect(screen.queryByText('Install into an existing VPC')).toBeInTheDocument();
      expect(screen.queryByText('Configure a cluster-wide proxy')).toBeInTheDocument();
      expect(screen.queryByText('Use Private Service Connect')).not.toBeInTheDocument();
    });

    it('Shows default text for VPC install', async () => {
      render(
        prepareComponent({
          [FieldId.ClusterPrivacy]: ClusterPrivacyType.External, // public
          [FieldId.GcpAuthType]: GCPAuthType.WorkloadIdentityFederation,
          [FieldId.CloudProvider]: 'gcp',
        }),
      );
      await waitFor(() => {
        expect(screen.queryByText('Install into an existing VPC')).toBeInTheDocument();
      });

      expect(
        screen.getByText(
          'By default, a new VPC will be created for your cluster. Alternatively, you may opt to install to an existing VPC below.',
        ),
      ).toBeInTheDocument();
    });
  });

  describe('<Configuration /> using WIF with Private selected', () => {
    it('does render Private service connect checkbox option for private', async () => {
      render(
        prepareComponent({
          [FieldId.ClusterPrivacy]: ClusterPrivacyType.Internal,
          [FieldId.GcpAuthType]: GCPAuthType.WorkloadIdentityFederation,
          [FieldId.Byoc]: 'true',
          [FieldId.CloudProvider]: 'gcp',
        }),
      );
      await waitFor(() => {
        expect(screen.queryByText('Install into an existing VPC')).toBeInTheDocument();
      });
      expect(screen.queryByText('Configure a cluster-wide proxy')).toBeInTheDocument();
      expect(screen.queryByText('Use Private Service Connect')).toBeInTheDocument();
    });

    it('does render Private service connect checkbox, it is checked, and it is disabled', async () => {
      render(
        prepareComponent({
          [FieldId.ClusterPrivacy]: ClusterPrivacyType.Internal,
          [FieldId.GcpAuthType]: GCPAuthType.WorkloadIdentityFederation,
          [FieldId.Byoc]: 'true',
          [FieldId.CloudProvider]: 'gcp',
          [FieldId.PrivateServiceConnect]: true,
        }),
      );
      await waitFor(() => {
        expect(screen.queryByText('Install into an existing VPC')).toBeInTheDocument();
      });
      expect(screen.queryByText('Configure a cluster-wide proxy')).toBeInTheDocument();
      expect(screen.queryByText('Use Private Service Connect')).toBeInTheDocument();
      expect(
        screen.getByRole('checkbox', {
          name: 'Use Private Service Connect',
        }),
      ).toBeChecked();
      expect(
        screen.getByRole('checkbox', {
          name: 'Use Private Service Connect',
        }),
      ).toBeDisabled();
    });

    it('Does not show the text of the default functionality related to installing onto a new VPC', async () => {
      render(
        prepareComponent({
          [FieldId.ClusterPrivacy]: ClusterPrivacyType.Internal, // private
          [FieldId.GcpAuthType]: GCPAuthType.WorkloadIdentityFederation,
          [FieldId.CloudProvider]: 'gcp',
        }),
      );
      await waitFor(() => {
        expect(screen.queryByText('Install into an existing VPC')).toBeInTheDocument();
      });

      expect(
        screen.queryByText(
          'By default, a new VPC will be created for your cluster. Alternatively, you may opt to install to an existing VPC below.',
        ),
      ).not.toBeInTheDocument();
    });
  });

  describe('<Configuration /> using ServiceAccounts as the auth type', () => {
    it('Shows the text of the default functionality related to installing onto a new VPC', async () => {
      render(
        prepareComponent({
          [FieldId.ClusterPrivacy]: ClusterPrivacyType.Internal, // private
          [FieldId.GcpAuthType]: GCPAuthType.ServiceAccounts,
          [FieldId.CloudProvider]: 'gcp',
        }),
      );
      await waitFor(() => {
        expect(screen.queryByText('Install into an existing VPC')).toBeInTheDocument();
      });

      expect(
        screen.getByText(
          'By default, a new VPC will be created for your cluster. Alternatively, you may opt to install to an existing VPC below.',
        ),
      ).toBeInTheDocument();
    });
  });

  describe('<Configuration /> when AWS is chosen as the cloud provider', () => {
    it('Shows the text of the default functionality related to installing onto a new VPC', async () => {
      render(
        prepareComponent({
          [FieldId.ClusterPrivacy]: ClusterPrivacyType.Internal, // private
          [FieldId.CloudProvider]: 'aws',
        }),
      );
      await waitFor(() => {
        expect(screen.queryByText('Install into an existing VPC')).toBeInTheDocument();
      });

      expect(
        screen.getByText(
          'By default, a new VPC will be created for your cluster. Alternatively, you may opt to install to an existing VPC below.',
        ),
      ).toBeInTheDocument();
    });
  });
});

describe('when useIsOSDFromGoogleCloud returns true', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseIsOSDFromGoogleCloud.mockReturnValue(true);
    mockUseAnalytics.mockReturnValue(jest.fn());
  });

  it('Install to VPC checkbox remains checked and disabled when using Service Account', async () => {
    render(
      prepareComponent({
        [FieldId.ClusterPrivacy]: ClusterPrivacyType.External,
        [FieldId.GcpAuthType]: GCPAuthType.ServiceAccounts,
        [FieldId.Byoc]: 'true',
        [FieldId.CloudProvider]: 'gcp',
        [FieldId.InstallToVpc]: true,
      }),
    );

    const installToVpcCheckbox = screen.getByRole('checkbox', {
      name: 'Install into an existing VPC',
    });

    expect(installToVpcCheckbox).toBeInTheDocument();
    expect(installToVpcCheckbox).toBeChecked();
    expect(installToVpcCheckbox).toBeDisabled();
  });

  it('switches between Private and Public cluster privacy multiple times and checkbox stays checked and disabled', async () => {
    const { user } = render(
      prepareComponent({
        [FieldId.ClusterPrivacy]: ClusterPrivacyType.External,
        [FieldId.GcpAuthType]: GCPAuthType.WorkloadIdentityFederation,
        [FieldId.Byoc]: 'true',
        [FieldId.CloudProvider]: 'gcp',
        [FieldId.InstallToVpc]: true,
      }),
    );

    const installToVpcCheckbox = screen.getByRole('checkbox', {
      name: 'Install into an existing VPC',
    });

    // Initial state - Public
    expect(installToVpcCheckbox).toBeChecked();
    expect(installToVpcCheckbox).toBeDisabled();

    // Click Private
    await user.click(screen.getByRole('radio', { name: /Private/i }));
    await waitFor(() => {
      expect(installToVpcCheckbox).toBeChecked();
    });
    expect(installToVpcCheckbox).toBeDisabled();

    // Click Public
    await user.click(screen.getByRole('radio', { name: /Public/i }));
    await waitFor(() => {
      expect(installToVpcCheckbox).toBeChecked();
    });
    expect(installToVpcCheckbox).toBeDisabled();

    // Click Private again
    await user.click(screen.getByRole('radio', { name: /Private/i }));
    await waitFor(() => {
      expect(installToVpcCheckbox).toBeChecked();
    });
    expect(installToVpcCheckbox).toBeDisabled();

    // Click Public again
    await user.click(screen.getByRole('radio', { name: /Public/i }));
    await waitFor(() => {
      expect(installToVpcCheckbox).toBeChecked();
    });
    expect(installToVpcCheckbox).toBeDisabled();
  });
});

describe('<Configuration /> OpenShift 5 GCP WIF existing VPC', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseIsOSDFromGoogleCloud.mockReturnValue(false);
    mockUseAnalytics.mockReturnValue(jest.fn());
    mockUseFeatureGate([[OCP5_SUPPORT, true]]);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('checks and disables Install into an existing VPC and shows the OpenShift 5 warning when only OpenShift 5 requires an existing VPC', async () => {
    render(
      prepareComponent({
        [FieldId.ClusterPrivacy]: ClusterPrivacyType.External,
        [FieldId.GcpAuthType]: GCPAuthType.WorkloadIdentityFederation,
        [FieldId.Byoc]: 'true',
        [FieldId.CloudProvider]: 'gcp',
        [FieldId.ClusterVersion]: { raw_id: '5.1.0' },
        [FieldId.InstallToVpc]: false,
      }),
    );

    const checkbox = installIntoExistingVpc();
    expect(checkbox).toBeDisabled();
    expect(checkbox).toBeChecked();
    expect(screen.getByText(OCP5_EXISTING_VPC_ALERT_TITLE)).toBeInTheDocument();
    expect(screen.getByText(OCP5_EXISTING_VPC_ALERT_BODY)).toBeInTheDocument();
  });

  it('shows the combined warning and keeps Install into an existing VPC checked and disabled for a private OpenShift 5 cluster', async () => {
    render(
      prepareComponent({
        [FieldId.ClusterPrivacy]: ClusterPrivacyType.Internal,
        [FieldId.GcpAuthType]: GCPAuthType.WorkloadIdentityFederation,
        [FieldId.Byoc]: 'true',
        [FieldId.CloudProvider]: 'gcp',
        [FieldId.ClusterVersion]: { raw_id: '5.0.1' },
        [FieldId.InstallToVpc]: true,
      }),
    );

    const checkbox = installIntoExistingVpc();
    expect(checkbox).toBeDisabled();
    expect(checkbox).toBeChecked();
    expect(screen.getByText(PRIVATE_AND_OCP5_EXISTING_VPC_ALERT)).toBeInTheDocument();
  });

  it('leaves Install into an existing VPC unchecked and enabled for an OpenShift 4 version', () => {
    render(
      prepareComponent({
        [FieldId.ClusterPrivacy]: ClusterPrivacyType.External,
        [FieldId.GcpAuthType]: GCPAuthType.WorkloadIdentityFederation,
        [FieldId.Byoc]: 'true',
        [FieldId.CloudProvider]: 'gcp',
        [FieldId.ClusterVersion]: { raw_id: '4.18.1' },
        [FieldId.InstallToVpc]: false,
      }),
    );

    const checkbox = installIntoExistingVpc();
    expect(checkbox).toBeEnabled();
    expect(checkbox).not.toBeChecked();
    expect(screen.queryByText(OCP5_EXISTING_VPC_ALERT_TITLE)).not.toBeInTheDocument();
  });

  it('keeps the private WIF warning and a checked, disabled checkbox for a private OpenShift 4 cluster', async () => {
    render(
      prepareComponent({
        [FieldId.ClusterPrivacy]: ClusterPrivacyType.Internal,
        [FieldId.GcpAuthType]: GCPAuthType.WorkloadIdentityFederation,
        [FieldId.Byoc]: 'true',
        [FieldId.CloudProvider]: 'gcp',
        [FieldId.ClusterVersion]: { raw_id: '4.18.1' },
        [FieldId.InstallToVpc]: true,
      }),
    );

    const checkbox = installIntoExistingVpc();
    expect(checkbox).toBeDisabled();
    expect(checkbox).toBeChecked();
    expect(screen.getByText(PRIVATE_WIF_EXISTING_VPC_ALERT)).toBeInTheDocument();
  });

  it('switches the warning between OpenShift 5 and the combined private text while Install into an existing VPC stays checked and disabled', async () => {
    const { user } = render(
      prepareComponent({
        [FieldId.ClusterPrivacy]: ClusterPrivacyType.External,
        [FieldId.GcpAuthType]: GCPAuthType.WorkloadIdentityFederation,
        [FieldId.Byoc]: 'true',
        [FieldId.CloudProvider]: 'gcp',
        [FieldId.ClusterVersion]: { raw_id: '5.0.1' },
        [FieldId.InstallToVpc]: true,
      }),
    );

    const checkbox = installIntoExistingVpc();
    expect(checkbox).toBeDisabled();
    expect(checkbox).toBeChecked();
    expect(screen.getByText(OCP5_EXISTING_VPC_ALERT_TITLE)).toBeInTheDocument();

    await user.click(screen.getByRole('radio', { name: /Private/i }));

    expect(await screen.findByText(PRIVATE_AND_OCP5_EXISTING_VPC_ALERT)).toBeInTheDocument();
    expect(checkbox).toBeDisabled();
    expect(checkbox).toBeChecked();

    await user.click(screen.getByRole('radio', { name: /Public/i }));

    expect(await screen.findByText(OCP5_EXISTING_VPC_ALERT_TITLE)).toBeInTheDocument();
    expect(checkbox).toBeDisabled();
    expect(checkbox).toBeChecked();
  });

  it('leaves Install into an existing VPC optional when ocmui-ocp5-support is disabled', () => {
    mockUseFeatureGate([[OCP5_SUPPORT, false]]);

    render(
      prepareComponent({
        [FieldId.ClusterPrivacy]: ClusterPrivacyType.External,
        [FieldId.GcpAuthType]: GCPAuthType.WorkloadIdentityFederation,
        [FieldId.Byoc]: 'true',
        [FieldId.CloudProvider]: 'gcp',
        [FieldId.ClusterVersion]: { raw_id: '5.0.1' },
        [FieldId.InstallToVpc]: false,
      }),
    );

    const checkbox = installIntoExistingVpc();
    expect(checkbox).toBeEnabled();
    expect(checkbox).not.toBeChecked();
  });
});
