// Some components under Details have their own tests;
// this file tries to take a more "black box integration" approach.

import * as React from 'react';
import { Formik } from 'formik';

import {
  fulfilledProviders,
  noProviders,
  providersResponse,
} from '~/common/__tests__/regions.fixtures';
import * as quotaSelectors from '~/components/clusters/common/quotaSelectors';
import {
  lifecycleResponseData,
  versionsData,
} from '~/components/clusters/wizards/common/ClusterSettings/Details/VersionSelectField.fixtures';
import { FieldId, initialValues } from '~/components/clusters/wizards/osd/constants';
import ocpLifeCycleStatuses from '~/components/releases/__mocks__/ocpLifeCycleStatuses';
import { UNSTABLE_CLUSTER_VERSIONS } from '~/queries/featureGates/featureConstants';
import clusterService from '~/services/clusterService';
import getOCPLifeCycleStatus from '~/services/productLifeCycleService';
import { mockUseFeatureGate, render, screen, withState } from '~/testUtils';

import { ClusterPrivacyType } from '../../Networking/constants';

import Details from './Details';

jest.mock('~/services/clusterService');
jest.mock('~/services/productLifeCycleService');

const version = { id: '4.14.0' };

describe('<Details />', () => {
  beforeEach(() => {
    mockUseFeatureGate([[UNSTABLE_CLUSTER_VERSIONS, false]]);
  });
  const defaultValues = {
    ...initialValues,
    [FieldId.CloudProvider]: 'aws',
    [FieldId.ClusterVersion]: version,
    [FieldId.Region]: 'eu-north-1',
    [FieldId.HasDomainPrefix]: true,
  };

  describe('Region dropdown', () => {
    beforeEach(() => {
      jest.resetAllMocks();
      (clusterService.getInstallableVersions as jest.Mock).mockResolvedValue({
        data: { items: [version] },
      });
      (getOCPLifeCycleStatus as jest.Mock).mockResolvedValue(ocpLifeCycleStatuses);
    });

    it('displays a spinner while regions are loading', async () => {
      const notLoadedState = {
        cloudProviders: noProviders,
      };
      (clusterService.getCloudProviders as jest.Mock).mockReturnValue(
        // a promise that won't be resolved, so providers become pending but not fulfilled.
        new Promise(() => {}),
      );

      withState(notLoadedState).render(
        <Formik initialValues={defaultValues} onSubmit={() => {}}>
          <Details />
        </Formik>,
      );

      expect(await screen.findByText('Loading region list...')).toBeInTheDocument();
    });

    it('displays the available regions when they are loaded', async () => {
      const loadedState = {
        cloudProviders: fulfilledProviders,
      };
      // Even if we already have data ^, Details makes a request on mount.
      (clusterService.getCloudProviders as jest.Mock).mockResolvedValue(providersResponse);

      withState(loadedState).render(
        <Formik initialValues={defaultValues} onSubmit={() => {}}>
          <Details />
        </Formik>,
      );

      expect(await screen.findByText('eu-west-0, Avalon')).toBeInTheDocument();
      expect(await screen.findByText('single-az-3, Antarctica')).toBeInTheDocument();
    });
  });

  describe('Domain prefix', () => {
    it('displays the field when has_domain_prefix is selected', async () => {
      render(
        <Formik initialValues={defaultValues} onSubmit={() => {}}>
          <Details />
        </Formik>,
      );

      expect(screen.queryByText('Domain prefix')).toBeInTheDocument();
    });

    it('is hidden when has_domain_prefix is false', async () => {
      const newValues = { ...defaultValues, [FieldId.HasDomainPrefix]: false };

      render(
        <Formik initialValues={newValues} onSubmit={() => {}}>
          <Details />
        </Formik>,
      );

      expect(screen.queryByText('Domain prefix')).toBe(null);
    });
  });

  describe('Availability', () => {
    it('displays the single AZ as selected when there are enough quota', async () => {
      render(
        <Formik initialValues={defaultValues} onSubmit={() => {}}>
          <Details />
        </Formik>,
      );
      const multiAzInput = screen.getByRole('radio', { name: /Single zone/i });
      expect(multiAzInput).toBeChecked();
    });

    it('displays the multi AZ as selected when there are not enough quota', async () => {
      const mockAvailableQuota = jest.spyOn(quotaSelectors, 'availableQuota');
      mockAvailableQuota.mockReturnValueOnce(0).mockReturnValueOnce(2);
      render(
        <Formik initialValues={defaultValues} onSubmit={() => {}}>
          <Details />
        </Formik>,
      );

      const multiAzInput = screen.getByRole('radio', { name: /Multi-zone/i });
      expect(multiAzInput).toBeChecked();
    });
  });

  describe('Version Change', () => {
    const loaded = {
      error: false,
      pending: false,
      versions: versionsData,
      fulfilled: true,
      meta: {
        isMarketplaceGcp: false,
        isWIF: false,
        includeUnstableVersions: false,
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
    beforeEach(() => {
      (getOCPLifeCycleStatus as jest.Mock).mockReturnValue({ data: lifecycleResponseData });
      (clusterService.getInstallableVersions as jest.Mock).mockReturnValue({
        data: { items: versionsData, kind: 'VersionList', page: 1, size: 1, total: 5 },
      });
    });
    it.each([
      [
        'PSC remains undefined when cluster is external',
        undefined,
        false,
        ClusterPrivacyType.External,
        '4.18.1',
        undefined,
        false,
      ],
      [
        'PSC and InstalltoVpc to true on PSC enabled version change',
        undefined,
        false,
        ClusterPrivacyType.Internal,
        '4.18.1',
        true,
        true,
      ],
      [
        'PSC to false when version does not support it',
        undefined,
        false,
        ClusterPrivacyType.Internal,
        '4.13.1',
        false,
        false,
      ],
    ])(
      '"%s"',
      async (
        description: string,
        pscInitial: boolean | undefined,
        vpcInitial: boolean | undefined,
        privacy: ClusterPrivacyType,
        version: string,
        pscFinal: boolean | undefined,
        vpcFinal: boolean | undefined,
      ) => {
        const formValues = {
          ...initialValues,
          [FieldId.PrivateServiceConnect]: pscInitial,
          [FieldId.InstallToVpc]: vpcInitial,
          [FieldId.ClusterPrivacy]: privacy,
        };
        const handleSubmit = jest.fn();
        const { user } = withState(loadedState).render(
          <Formik initialValues={formValues} onSubmit={() => {}}>
            {({ values }) => (
              <div>
                <Details />
                <button type="button" onClick={() => handleSubmit(values)}>
                  test
                </button>
              </div>
            )}
          </Formik>,
        );

        expect(await screen.findByText('Version')).toBeInTheDocument();
        // Need to click on the version dropdown to open it
        await user.click(screen.getByRole('button', { name: 'Options menu' }));
        await user.click(screen.getByText(version));

        await user.click(screen.getByRole('button', { name: 'test' }));

        expect(handleSubmit).toHaveBeenCalledTimes(1);
        expect(handleSubmit).toHaveBeenCalledWith(
          expect.objectContaining({
            [FieldId.PrivateServiceConnect]: pscFinal,
            [FieldId.InstallToVpc]: vpcFinal,
          }),
        );
      },
    );
  });
});
