import * as React from 'react';
import { FieldInputProps, Formik } from 'formik';

import { waitFor } from '@testing-library/react';

import { multiRegions } from '~/common/__tests__/regions.fixtures';
import { CloudProviderType } from '~/components/clusters/wizards/common';
import { FieldId, initialValues } from '~/components/clusters/wizards/rosa/constants';
import { useFetchGetMultiRegionAvailableRegions } from '~/queries/RosaWizardQueries/useFetchGetMultiRegionAvailableRegions';
import { render, screen } from '~/testUtils';

import { MultiRegionCloudRegionSelectField } from './MultiRegionCloudRegionSelectField';

jest.mock('~/queries/RosaWizardQueries/useFetchGetMultiRegionAvailableRegions', () => ({
  useFetchGetMultiRegionAvailableRegions: jest.fn(),
}));

describe('<MultiRegionCloudRegionSeletField />', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });
  const defaultValues = {
    ...initialValues,
    [FieldId.Hypershift]: 'true',
  };

  const defaultProps = {
    field: { name: 'region' } as FieldInputProps<string>,
    cloudProviderID: CloudProviderType.Aws,
  };

  const mockedUseFetchGetMultiRegionAvailableRegions = useFetchGetMultiRegionAvailableRegions;

  it('displays a spinner while regions are fetching', async () => {
    (mockedUseFetchGetMultiRegionAvailableRegions as jest.Mock).mockReturnValue({
      data: undefined,
      error: undefined,
      isError: false,
      isFetching: true,
    });

    render(
      <Formik initialValues={defaultValues} onSubmit={() => {}}>
        <MultiRegionCloudRegionSelectField {...defaultProps} />
      </Formik>,
    );

    expect(await screen.findByText('Loading region list...')).toBeInTheDocument();
  });

  it('displays the error box when query fails', async () => {
    (mockedUseFetchGetMultiRegionAvailableRegions as jest.Mock).mockReturnValue({
      data: undefined,
      error: true,
      isError: true,
      isFetching: false,
    });

    render(
      <Formik initialValues={defaultValues} onSubmit={() => {}}>
        <MultiRegionCloudRegionSelectField {...defaultProps} />
      </Formik>,
    );

    expect(await screen.findByText('Error loading region list')).toBeInTheDocument();
  });

  it('displays the available regions when they are loaded', async () => {
    (mockedUseFetchGetMultiRegionAvailableRegions as jest.Mock).mockReturnValue({
      data: multiRegions,
      error: false,
      isFetching: false,
      isError: false,
      isSuccess: true,
    });

    const { user } = render(
      <Formik initialValues={defaultValues} onSubmit={() => {}}>
        <MultiRegionCloudRegionSelectField {...defaultProps} />
      </Formik>,
    );

    await waitFor(() => {
      expect(screen.queryByText('Loading region list...')).not.toBeInTheDocument();
    });

    await user.click(await screen.findByRole('button', { name: 'Region' }));

    expect(
      await screen.findByRole('option', { name: 'ap-southeast-1, Asia Pacific, Singapore' }),
    ).toBeInTheDocument();
    expect(
      await screen.findByRole('option', { name: 'us-west-2, US West, Oregon' }),
    ).toBeInTheDocument();
  });

  it('displays the warning when regionalized endpoint fails', async () => {
    (mockedUseFetchGetMultiRegionAvailableRegions as jest.Mock).mockReturnValue({
      data: multiRegions,
      error: false,
      isError: false,
      isFetching: false,
      isSuccess: true,
      isFailedRegionalizedRegions: true,
      isFailedGlobalRegions: false,
      isFailedRegionalAndGlobal: false,
    });

    render(
      <Formik initialValues={defaultValues} onSubmit={() => {}}>
        <MultiRegionCloudRegionSelectField {...defaultProps} />
      </Formik>,
    );

    expect(await screen.findByText('Some regions failed to load')).toBeInTheDocument();
  });

  it('displays the warning when global endpoint fails', async () => {
    (mockedUseFetchGetMultiRegionAvailableRegions as jest.Mock).mockReturnValue({
      data: multiRegions,
      error: false,
      isError: false,
      isFetching: false,
      isSuccess: true,
      isFailedRegionalizedRegions: false,
      isFailedGlobalRegions: true,
      isFailedRegionalAndGlobal: false,
    });

    render(
      <Formik initialValues={defaultValues} onSubmit={() => {}}>
        <MultiRegionCloudRegionSelectField {...defaultProps} />
      </Formik>,
    );

    expect(await screen.findByText('Some regions failed to load')).toBeInTheDocument();
  });
});
