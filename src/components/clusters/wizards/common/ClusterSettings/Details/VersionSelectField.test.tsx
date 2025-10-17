import * as React from 'react';
import { Form, Formik, FormikValues } from 'formik';

import { VersionSelectField } from '~/components/clusters/wizards/common/ClusterSettings/Details/VersionSelectField';
import {
  lifecycleResponseData,
  versionsData,
} from '~/components/clusters/wizards/common/ClusterSettings/Details/VersionSelectField.fixtures';
import { FieldId } from '~/components/clusters/wizards/common/constants';
import { GCPAuthType } from '~/components/clusters/wizards/osd/ClusterSettings/CloudProvider/types';
import { UNSTABLE_CLUSTER_VERSIONS } from '~/queries/featureGates/featureConstants';
import clusterService from '~/services/clusterService';
import getOCPLifeCycleStatus from '~/services/productLifeCycleService';
import { checkAccessibility, mockUseFeatureGate, screen, withState } from '~/testUtils';
import { SubscriptionCommonFieldsCluster_billing_model as SubscriptionCommonFieldsClusterBillingModel } from '~/types/accounts_mgmt.v1';

import * as versionsSelectHelper from './versionSelectHelper';

jest.mock('~/services/productLifeCycleService');
jest.mock('~/services/clusterService');

const standardValues: FormikValues = {
  [FieldId.BillingModel]: SubscriptionCommonFieldsClusterBillingModel.standard,
};
const clusterVersionValue: FormikValues = {
  [FieldId.ClusterVersion]: versionsData[0],
};
const standardValuesWithVersion: FormikValues = {
  ...standardValues,
  ...clusterVersionValue,
};
const marketplaceGcpValues = {
  [FieldId.BillingModel]: SubscriptionCommonFieldsClusterBillingModel.marketplace_gcp,
};
const wifValues = {
  [FieldId.BillingModel]: SubscriptionCommonFieldsClusterBillingModel.standard,
  [FieldId.GcpAuthType]: GCPAuthType.WorkloadIdentityFederation,
};

describe('<VersionSelectField />', () => {
  const notLoaded = {
    fulfilled: false,
    error: false,
    pending: false,
    versions: versionsData,
  };
  const loaded = {
    ...notLoaded,
    fulfilled: true,
    meta: {
      isMarketplaceGcp: false,
      isWIF: false,
      includeUnstableVersions: false,
    },
  };
  const notLoadedState = {
    clusters: {
      clusterVersions: notLoaded,
    },
  };
  const loadedState = {
    clusters: {
      clusterVersions: loaded,
    },
    features: {
      [UNSTABLE_CLUSTER_VERSIONS]: false,
    },
  };
  const loadedStateUnmatchedVersions = {
    ...loadedState,
    clusters: {
      clusterVersions: {
        ...loaded,
        meta: {
          isRosa: true,
        },
      },
    },
  };

  const defaultProps = {
    name: FieldId.ClusterVersion,
    label: 'Version',
    channelGroup: 'stable',
    isDisabled: false,
    onChange: jest.fn(),
    isEUSChannelEnabled: false,
  };

  beforeEach(() => {
    (getOCPLifeCycleStatus as jest.Mock).mockReturnValue({ data: lifecycleResponseData });
    (clusterService.getInstallableVersions as jest.Mock).mockReturnValue({
      data: { items: versionsData, kind: 'VersionList', page: 1, size: 1, total: 3 },
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it.each([
    ['with no params', standardValues, false, false, false],
    ['for GCP marketplace', marketplaceGcpValues, true, false, false],
    ['for WIF authentication', wifValues, false, true, false],
  ])(
    'fetches cluster version %s',
    async (title, formikValues, isMarketplaceGcp, isWIF, includeUnstableVersions) => {
      withState(notLoadedState).render(
        <Formik initialValues={formikValues} onSubmit={() => {}}>
          <VersionSelectField {...defaultProps} />
        </Formik>,
      );

      expect(clusterService.getInstallableVersions).toHaveBeenCalledWith({
        isMarketplaceGcp,
        isWIF,
        includeUnstableVersions,
      });
      expect(await screen.findByText('Version')).toBeInTheDocument();
    },
  );

  it('re-fetches cluster versions and reset selected version if the versions available do not match the existing cluster type', async () => {
    const onSubmit = jest.fn();
    const { user } = withState(loadedStateUnmatchedVersions).render(
      <Formik initialValues={standardValuesWithVersion} onSubmit={onSubmit}>
        <Form>
          <VersionSelectField {...defaultProps} />
          <button type="submit">Submit</button>
        </Form>
      </Formik>,
    );

    expect(clusterService.getInstallableVersions).toHaveBeenCalledWith({
      isMarketplaceGcp: false,
      isWIF: false,
      includeUnstableVersions: false,
    });

    await user.click(screen.getByRole('button', { name: 'Submit' }));

    expect(onSubmit).toHaveBeenCalledWith(
      expect.not.objectContaining(clusterVersionValue),
      expect.anything(),
    );
  });

  it('fetches versions and reset selected version when versions data is not present', async () => {
    const onSubmit = jest.fn();
    const { user } = withState(notLoadedState).render(
      <Formik initialValues={standardValuesWithVersion} onSubmit={onSubmit}>
        <Form>
          <VersionSelectField {...defaultProps} />
          <button type="submit">Submit</button>
        </Form>
      </Formik>,
    );

    expect(clusterService.getInstallableVersions).toHaveBeenCalledWith({
      isMarketplaceGcp: false,
      isWIF: false,
      includeUnstableVersions: false,
    });

    await user.click(screen.getByRole('button', { name: 'Submit' }));

    expect(onSubmit).toHaveBeenCalledWith(
      expect.not.objectContaining(clusterVersionValue),
      expect.anything(),
    );
  });

  it('is accessible', async () => {
    const { container } = withState(loadedState).render(
      <Formik initialValues={standardValues} onSubmit={() => {}}>
        <VersionSelectField {...defaultProps} />
      </Formik>,
    );

    expect(await screen.findByText('Version')).toBeInTheDocument();
    await checkAccessibility(container);
  });

  it('shows the right default version', async () => {
    withState(loadedState).render(
      <Formik initialValues={standardValues} onSubmit={() => {}}>
        <VersionSelectField {...defaultProps} />
      </Formik>,
    );

    expect(clusterService.getInstallableVersions).not.toHaveBeenCalled();
    expect(await screen.findByText('Version')).toBeInTheDocument();
    expect(screen.queryByText('4.13.1')).not.toBeInTheDocument();
    expect(await screen.findByText('4.12.13')).toBeInTheDocument();
  });

  it('handles opening the toggle', async () => {
    const { user } = withState(loadedState).render(
      <Formik initialValues={standardValues} onSubmit={() => {}}>
        <VersionSelectField {...defaultProps} />
      </Formik>,
    );

    expect(clusterService.getInstallableVersions).not.toHaveBeenCalled();
    expect(screen.queryByText('Version')).toBeInTheDocument();
    expect(screen.queryByText('Full support')).not.toBeInTheDocument();
    expect(
      screen.getByRole('button', {
        name: /options menu/i,
      }),
    ).toBeInTheDocument();
    await user.click(
      screen.getByRole('button', {
        name: /options menu/i,
      }),
    );
    expect(screen.getByText('Full support')).toBeInTheDocument();
  });

  it('shows only filtered version by channel group when isEUSEnabled', async () => {
    mockUseFeatureGate([[UNSTABLE_CLUSTER_VERSIONS, true]]);
    jest.spyOn(versionsSelectHelper, 'hasUnstableVersionsCapability').mockReturnValue(true);

    const newProps = {
      ...defaultProps,
      channelGroup: 'eus',
      isEUSChannelEnabled: true,
    };

    const { user } = withState(loadedState).render(
      <Formik initialValues={standardValues} onSubmit={() => {}}>
        <VersionSelectField {...newProps} />
      </Formik>,
    );

    const options = screen.getByRole('button', {
      name: /options menu/i,
    });

    expect(clusterService.getInstallableVersions).not.toHaveBeenCalled();
    expect(await screen.findByText('Version')).toBeInTheDocument();
    expect(options).toBeInTheDocument();
    await user.click(options);
    expect(screen.queryByText('4.13.1')).not.toBeInTheDocument();
    expect(screen.queryByText('4.12.13')).not.toBeInTheDocument();
    expect(screen.queryByText('4.17.9 (fast)')).not.toBeInTheDocument();
    expect(await screen.findByText('4.18.0 (eus)')).toBeInTheDocument();
  });
});
