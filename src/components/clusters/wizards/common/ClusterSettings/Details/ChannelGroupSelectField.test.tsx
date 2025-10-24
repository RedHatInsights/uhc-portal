import * as React from 'react';
import { FieldInputProps, Formik } from 'formik';

import { render, screen, waitFor } from '~/testUtils';

import { initialValues } from '../../../osd/constants';

import { ChannelGroupSelectField } from './ChannelGroupSelectField';
import { versionsData } from './VersionSelectField.fixtures';

describe('<ChannelGroupSelectField />', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });
  const defaultValues = {
    ...initialValues,
  };

  const defaultInstallableVersionsResponse = {
    error: false,
    fulfilled: true,
    pending: false,
    valid: true,
    versions: versionsData,
    meta: {
      includeUnstableVersions: true,
      isMarketplaceGcp: false,
      isWIF: true,
    },
    errorMessage: '',
  };

  const defaultProps = {
    field: { name: 'channel_group' } as FieldInputProps<string>,
    getInstallableVersionsResponse: defaultInstallableVersionsResponse,
  };

  it('displays a spinner versions are fetching', async () => {
    const newProps = {
      ...defaultProps,
      getInstallableVersionsResponse: {
        ...defaultInstallableVersionsResponse,
        fulfilled: false,
        pending: true,
      },
    };
    render(
      <Formik initialValues={defaultValues} onSubmit={() => {}}>
        <ChannelGroupSelectField {...newProps} />
      </Formik>,
    );

    expect(screen.getByRole('progressbar')).toBeInTheDocument();
    expect(await screen.findByText('Loading...')).toBeInTheDocument();
  });

  it('displays an error when versions response fails', async () => {
    const newProps = {
      ...defaultProps,
      getInstallableVersionsResponse: {
        ...defaultInstallableVersionsResponse,
        fulfilled: false,
        error: true,
      },
    };
    render(
      <Formik initialValues={defaultValues} onSubmit={() => {}}>
        <ChannelGroupSelectField {...newProps} />
      </Formik>,
    );

    expect(await screen.findByText('Error getting channel groups')).toBeInTheDocument();
  });

  it('displays the available channel groups when feature gate enabled', async () => {
    render(
      <Formik initialValues={defaultValues} onSubmit={() => {}}>
        <ChannelGroupSelectField {...defaultProps} />
      </Formik>,
    );

    await waitFor(() => {
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
    });

    expect(await screen.findByText('Stable')).toBeInTheDocument();
    expect(await screen.findByText('Extended Update Support (EUS)')).toBeInTheDocument();
    expect(await screen.findByText('Fast')).toBeInTheDocument();
  });
});
