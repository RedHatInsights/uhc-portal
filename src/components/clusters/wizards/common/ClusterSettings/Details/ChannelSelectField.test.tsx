import React from 'react';
import { Formik } from 'formik';

import { checkAccessibility, render, screen } from '~/testUtils';
import { Version } from '~/types/clusters_mgmt.v1';

import { ChannelSelectField, ChannelSelectFieldProps } from './ChannelSelectField';

const defaultVersion: Version = {
  kind: 'Version',
  id: 'openshift-v4.19.7-fast',
  href: '/api/clusters_mgmt/v1/versions/openshift-v4.19.7-fast',
  raw_id: '4.19.7',
  enabled: true,
  default: false,
  channel_group: 'fast',
  // @ts-ignore - `available_channels` isn't available in API schemas yet
  available_channels: [
    'candidate-4.19',
    'candidate-4.20',
    'eus-4.20',
    'fast-4.19',
    'fast-4.20',
    'stable-4.19',
    'stable-4.20',
  ],
  end_of_life_timestamp: '2026-12-17T00:00:00Z',
};

const noAvailableChannelsVersion = {
  ...defaultVersion,
  available_channels: [],
};

const buildComponent = (props: ChannelSelectFieldProps) =>
  render(
    <Formik initialValues={{}} onSubmit={() => {}}>
      <ChannelSelectField {...props} />
    </Formik>,
  );

describe('<ChannelSelectField />', () => {
  it('is accessible', async () => {
    const { container } = buildComponent({
      clusterVersion: defaultVersion,
    });

    await checkAccessibility(container);
  });

  it('renders channels when available', () => {
    buildComponent({ clusterVersion: defaultVersion });

    expect(screen.getByText('candidate-4.19')).toBeInTheDocument();
    expect(screen.getByText('candidate-4.20')).toBeInTheDocument();
    expect(screen.getByText('fast-4.19')).toBeInTheDocument();
  });

  it('renders popover hint', () => {
    buildComponent({ clusterVersion: defaultVersion });

    expect(
      screen.getByRole('button', { name: 'Version channels information' }),
    ).toBeInTheDocument();
  });

  describe('when version is missing', () => {
    it('is empty', () => {
      buildComponent({ clusterVersion: undefined });

      expect(
        screen.queryByText('No channels available for the selected version'),
      ).not.toBeInTheDocument();
      expect(screen.queryByText('candidate-4.19')).not.toBeInTheDocument();
    });

    it('is disabled', () => {
      buildComponent({ clusterVersion: undefined });

      expect(screen.getByRole('combobox', { name: 'Channel' })).toBeDisabled();
    });
  });

  describe('when channels are not available', () => {
    it('shows an empty message', () => {
      buildComponent({ clusterVersion: noAvailableChannelsVersion });

      expect(
        screen.getByText('No channels available for the selected version'),
      ).toBeInTheDocument();
    });

    it('is disabled', () => {
      buildComponent({ clusterVersion: noAvailableChannelsVersion });

      expect(screen.getByRole('combobox', { name: 'Channel' })).toBeDisabled();
    });
  });
});
