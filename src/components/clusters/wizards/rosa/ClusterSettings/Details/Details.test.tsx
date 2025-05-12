// Some components under Details have their own tests;
// this file tries to take a more "black box integration" approach.

import * as React from 'react';
import { Formik } from 'formik';

import { waitFor } from '@testing-library/react';

import { fulfilledProviders, multiRegions, noProviders } from '~/common/__tests__/regions.fixtures';
import { FieldId, initialValues } from '~/components/clusters/wizards/rosa/constants';
import ocpLifeCycleStatuses from '~/components/releases/__mocks__/ocpLifeCycleStatuses';
import { MULTIREGION_PREVIEW_ENABLED } from '~/queries/featureGates/featureConstants';
import { useFetchGetMultiRegionAvailableRegions } from '~/queries/RosaWizardQueries/useFetchGetMultiRegionAvailableRegions';
import clusterService from '~/services/clusterService';
import getOCPLifeCycleStatus from '~/services/productLifeCycleService';
import { mockUseFeatureGate, render, screen, withState } from '~/testUtils';

import Details from './Details';

jest.mock('~/services/clusterService');
jest.mock('~/services/productLifeCycleService');

jest.mock('~/queries/RosaWizardQueries/useFetchGetMultiRegionAvailableRegions', () => ({
  useFetchGetMultiRegionAvailableRegions: jest.fn(),
}));

const version = { id: '4.14.0' };

describe('<Details />', () => {
  const defaultValues = {
    ...initialValues,
    [FieldId.Hypershift]: 'false',
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
      (clusterService.getMachineTypesByRegionARN as jest.Mock).mockResolvedValue({
        data: { items: [] },
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

      withState(loadedState).render(
        <Formik initialValues={defaultValues} onSubmit={() => {}}>
          <Details />
        </Formik>,
      );

      expect(await screen.findByText('eu-west-0, Avalon')).toBeInTheDocument();
      expect(await screen.findByText('single-az-3, Antarctica')).toBeInTheDocument();
    });

    it('displays multi region dropdown and shows a spinner while fetching', async () => {
      mockUseFeatureGate([[MULTIREGION_PREVIEW_ENABLED, true]]);
      const mockedUseFetchGetMultiRegionAvailableRegions = useFetchGetMultiRegionAvailableRegions;

      (mockedUseFetchGetMultiRegionAvailableRegions as jest.Mock).mockReturnValue({
        data: undefined,
        error: undefined,
        isError: false,
        isFetching: true,
      });

      const newValues = {
        ...defaultValues,
        [FieldId.Hypershift]: 'true',
      };

      render(
        <Formik initialValues={newValues} onSubmit={() => {}}>
          <Details />
        </Formik>,
      );
      expect(await screen.findByText('Loading region list...')).toBeInTheDocument();
    });

    it('displays the available multi regions when they are fetched', async () => {
      mockUseFeatureGate([[MULTIREGION_PREVIEW_ENABLED, true]]);
      const mockedUseFetchGetMultiRegionAvailableRegions = useFetchGetMultiRegionAvailableRegions;

      (mockedUseFetchGetMultiRegionAvailableRegions as jest.Mock).mockReturnValue({
        data: multiRegions,
        error: false,
        isFetching: false,
        isError: false,
        isSuccess: true,
      });

      const newValues = {
        ...defaultValues,
        [FieldId.Hypershift]: 'true',
      };

      render(
        <Formik initialValues={newValues} onSubmit={() => {}}>
          <Details />
        </Formik>,
      );
      await waitFor(() => {
        expect(screen.queryByText('Loading region list...')).not.toBeInTheDocument();
      });

      expect(
        await screen.findByText('ap-southeast-1, Asia Pacific, Singapore'),
      ).toBeInTheDocument();
      expect(await screen.findByText('us-west-2, US West, Oregon')).toBeInTheDocument();
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
});
