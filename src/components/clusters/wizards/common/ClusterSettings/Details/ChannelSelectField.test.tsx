import React from 'react';
import { Formik } from 'formik';

import { subscriptionCapabilities } from '~/common/subscriptionCapabilities';
import { UNSTABLE_CLUSTER_VERSIONS } from '~/queries/featureGates/featureConstants';
import * as featureGates from '~/queries/featureGates/useFetchFeatureGate';
import { useGlobalState } from '~/redux/hooks';
import { checkAccessibility, render, screen } from '~/testUtils';
import { Version } from '~/types/clusters_mgmt.v1';

import { ChannelSelectField, ChannelSelectFieldProps } from './ChannelSelectField';

jest.mock('~/redux/hooks', () => ({
  ...jest.requireActual('~/redux/hooks'),
  useGlobalState: jest.fn(),
}));

const useGlobalStateMock = useGlobalState as jest.Mock;

const defaultVersion: Version = {
  kind: 'Version',
  id: 'openshift-v4.19.7-fast',
  href: '/api/clusters_mgmt/v1/versions/openshift-v4.19.7-fast',
  raw_id: '4.19.7',
  enabled: true,
  default: false,
  channel_group: 'fast',
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
  beforeEach(() => {
    useGlobalStateMock.mockImplementation((selector: (state: unknown) => unknown) =>
      selector({
        userProfile: {
          organization: {
            details: {
              capabilities: [
                {
                  name: subscriptionCapabilities.NON_STABLE_CHANNEL_GROUP,
                  value: 'true',
                  inherited: false,
                },
              ],
            },
          },
        },
      }),
    );
    jest.spyOn(featureGates, 'useFeatureGate').mockImplementation((feature) => {
      if (feature === UNSTABLE_CLUSTER_VERSIONS) {
        return true;
      }
      return false;
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

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

    expect(screen.getByRole('button', { name: 'Update channels information' })).toBeInTheDocument();
  });

  describe('when version is missing', () => {
    it('disables the select and does not show channel options or empty-version message', () => {
      buildComponent({ clusterVersion: undefined });

      expect(
        screen.queryByText('No channels available for the selected version'),
      ).not.toBeInTheDocument();
      expect(screen.queryByText('candidate-4.19')).not.toBeInTheDocument();
      expect(screen.getByRole('combobox', { name: 'Channel' })).toBeDisabled();
    });
  });

  describe('when channels are not available', () => {
    it('shows empty message and disables the select', () => {
      buildComponent({ clusterVersion: noAvailableChannelsVersion });

      expect(
        screen.getByText('No channels available for the selected version'),
      ).toBeInTheDocument();
      expect(screen.getByRole('combobox', { name: 'Channel' })).toBeDisabled();
    });
  });

  describe('when unstable cluster versions feature is off', () => {
    beforeEach(() => {
      jest.spyOn(featureGates, 'useFeatureGate').mockImplementation((feature) => {
        if (feature === UNSTABLE_CLUSTER_VERSIONS) {
          return false;
        }
        return false;
      });
    });

    it('does not list candidate or fast channels', () => {
      buildComponent({ clusterVersion: defaultVersion });

      expect(screen.queryByText('candidate-4.19')).not.toBeInTheDocument();
      expect(screen.queryByText('candidate-4.20')).not.toBeInTheDocument();
      expect(screen.queryByText('fast-4.19')).not.toBeInTheDocument();
      expect(screen.queryByText('fast-4.20')).not.toBeInTheDocument();
      expect(screen.getByText('eus-4.20')).toBeInTheDocument();
      expect(screen.getByText('stable-4.19')).toBeInTheDocument();
    });
  });
});
