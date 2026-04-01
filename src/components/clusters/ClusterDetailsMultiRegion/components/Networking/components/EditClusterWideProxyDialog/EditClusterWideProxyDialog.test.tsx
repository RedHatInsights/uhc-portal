import React from 'react';

import { render, screen, waitFor } from '~/testUtils';

import * as useEditClusterHook from '~/queries/ClusterDetailsQueries/useEditCluster';
import { ClusterFromSubscription } from '~/types/types';

import EditClusterWideProxyDialog from './EditClusterWideProxyDialog';

jest.mock('~/queries/ClusterDetailsQueries/useFetchClusterDetails', () => ({
  invalidateClusterDetailsQueries: jest.fn(),
}));

jest.mock('~/redux/hooks', () => ({
  useGlobalState: jest.fn(() => true), // Modal is open
}));

jest.mock('~/components/common/ReduxFormComponents_deprecated/ReduxFileUpload', () => ({
  __esModule: true,
  default: ({ input }: any) => (
    <textarea
      data-testid="trust-bundle-upload"
      value={input.value || ''}
      onChange={(e) => input.onChange(e.target.value)}
    />
  ),
}));

const createMockCluster = (overrides?: Partial<ClusterFromSubscription>): ClusterFromSubscription =>
  ({
    id: 'test-cluster-id',
    proxy: {
      http_proxy: 'http://proxy.example.com:8080',
      https_proxy: 'https://proxy.example.com:8443',
      no_proxy: '.cluster.local,.example.com',
    },
    additional_trust_bundle: undefined,
    ...overrides,
  }) as ClusterFromSubscription;

describe('<EditClusterWideProxyDialog />', () => {
  let mockMutate: jest.Mock;

  beforeEach(() => {
    mockMutate = jest.fn((args, callbacks) => {
      callbacks?.onSuccess?.();
    });

    jest.spyOn(useEditClusterHook, 'useEditCluster').mockReturnValue({
      isPending: false,
      isError: false,
      error: null,
      mutate: mockMutate,
      reset: jest.fn(),
      data: undefined,
      isSuccess: false,
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  const renderComponent = (cluster: ClusterFromSubscription) => {
    return render(<EditClusterWideProxyDialog cluster={cluster} region="us-east-1" />);
  };

  describe('OCMUI-4183: Conditional payload construction', () => {
    it('should only send additional_trust_bundle when only CA cert is changed', async () => {
      const cluster = createMockCluster();
      const { user } = renderComponent(cluster);

      // Change only the additional trust bundle
      const trustBundleField = await screen.findByTestId('trust-bundle-upload');
      await user.type(
        trustBundleField,
        '-----BEGIN CERTIFICATE-----\ntest cert\n-----END CERTIFICATE-----',
      );

      // Submit the form
      const saveButton = await screen.findByRole('button', { name: /save/i });
      await user.click(saveButton);

      await waitFor(() => {
        expect(mockMutate).toHaveBeenCalledTimes(1);
      });

      const callArgs = mockMutate.mock.calls[0][0];
      expect(callArgs.cluster).toEqual({
        additional_trust_bundle:
          '-----BEGIN CERTIFICATE-----\ntest cert\n-----END CERTIFICATE-----',
      });
      // Should NOT include proxy object when proxy fields are unchanged
      expect(callArgs.cluster.proxy).toBeUndefined();
    });

    it('should only send proxy when only proxy fields are changed', async () => {
      const cluster = createMockCluster();
      const { user } = renderComponent(cluster);

      // Change only the http_proxy field
      const httpProxyField = await screen.findByLabelText(/HTTP Proxy URL/i);
      await user.clear(httpProxyField);
      await user.type(httpProxyField, 'http://newproxy.example.com:8080');

      // Submit the form
      const saveButton = await screen.findByRole('button', { name: /save/i });
      await user.click(saveButton);

      await waitFor(() => {
        expect(mockMutate).toHaveBeenCalledTimes(1);
      });

      const callArgs = mockMutate.mock.calls[0][0];
      expect(callArgs.cluster).toEqual({
        proxy: {
          http_proxy: 'http://newproxy.example.com:8080',
          https_proxy: undefined,
          no_proxy: undefined,
        },
      });
      // Should NOT include additional_trust_bundle when it's unchanged
      expect(callArgs.cluster.additional_trust_bundle).toBeUndefined();
    });

    it('should send both proxy and additional_trust_bundle when both are changed', async () => {
      const cluster = createMockCluster();
      const { user } = renderComponent(cluster);

      // Change both http_proxy and trust bundle
      const httpProxyField = await screen.findByLabelText(/HTTP Proxy URL/i);
      await user.clear(httpProxyField);
      await user.type(httpProxyField, 'http://newproxy.example.com:8080');

      const trustBundleField = await screen.findByTestId('trust-bundle-upload');
      await user.type(
        trustBundleField,
        '-----BEGIN CERTIFICATE-----\ntest cert\n-----END CERTIFICATE-----',
      );

      // Submit the form
      const saveButton = await screen.findByRole('button', { name: /save/i });
      await user.click(saveButton);

      await waitFor(() => {
        expect(mockMutate).toHaveBeenCalledTimes(1);
      });

      const callArgs = mockMutate.mock.calls[0][0];
      expect(callArgs.cluster).toEqual({
        proxy: {
          http_proxy: 'http://newproxy.example.com:8080',
          https_proxy: undefined,
          no_proxy: undefined,
        },
        additional_trust_bundle:
          '-----BEGIN CERTIFICATE-----\ntest cert\n-----END CERTIFICATE-----',
      });
    });

    it('should send proxy with only changed fields when multiple proxy fields change', async () => {
      const cluster = createMockCluster();
      const { user } = renderComponent(cluster);

      // Change both http_proxy and https_proxy
      const httpProxyField = await screen.findByLabelText(/HTTP Proxy URL/i);
      await user.clear(httpProxyField);
      await user.type(httpProxyField, 'http://newproxy.example.com:8080');

      const httpsProxyField = await screen.findByLabelText(/HTTPS Proxy URL/i);
      await user.clear(httpsProxyField);
      await user.type(httpsProxyField, 'https://newproxy.example.com:8443');

      // Submit the form
      const saveButton = await screen.findByRole('button', { name: /save/i });
      await user.click(saveButton);

      await waitFor(() => {
        expect(mockMutate).toHaveBeenCalledTimes(1);
      });

      const callArgs = mockMutate.mock.calls[0][0];
      expect(callArgs.cluster.proxy).toEqual({
        http_proxy: 'http://newproxy.example.com:8080',
        https_proxy: 'https://newproxy.example.com:8443',
        no_proxy: undefined,
      });
    });

    it('should handle cluster with no existing proxy configuration', async () => {
      const cluster = createMockCluster({
        proxy: undefined,
        additional_trust_bundle: undefined,
      });
      const { user } = renderComponent(cluster);

      // Add only trust bundle
      const trustBundleField = await screen.findByTestId('trust-bundle-upload');
      await user.type(
        trustBundleField,
        '-----BEGIN CERTIFICATE-----\ntest cert\n-----END CERTIFICATE-----',
      );

      // Submit the form
      const saveButton = await screen.findByRole('button', { name: /save/i });
      await user.click(saveButton);

      await waitFor(() => {
        expect(mockMutate).toHaveBeenCalledTimes(1);
      });

      const callArgs = mockMutate.mock.calls[0][0];
      expect(callArgs.cluster).toEqual({
        additional_trust_bundle:
          '-----BEGIN CERTIFICATE-----\ntest cert\n-----END CERTIFICATE-----',
      });
      expect(callArgs.cluster.proxy).toBeUndefined();
    });
  });

  describe('Regression: OCMUI-4183 customer scenario', () => {
    it('should not send proxy object when adding CA cert to cluster with existing proxy', async () => {
      // This is the exact scenario from the bug report
      const cluster = createMockCluster({
        proxy: {
          http_proxy: 'http://existing-proxy.example.com:8080',
          https_proxy: 'https://existing-proxy.example.com:8443',
          no_proxy: '.cluster.local',
        },
        additional_trust_bundle: undefined,
      });

      const { user } = renderComponent(cluster);

      // Customer wants to add CA cert without touching proxy settings
      const trustBundleField = await screen.findByTestId('trust-bundle-upload');
      await user.type(
        trustBundleField,
        '-----BEGIN CERTIFICATE-----\nIntermediate CA\n-----END CERTIFICATE-----\n-----BEGIN CERTIFICATE-----\nRoot CA\n-----END CERTIFICATE-----',
      );

      // Submit the form
      const saveButton = await screen.findByRole('button', { name: /save/i });
      await user.click(saveButton);

      await waitFor(() => {
        expect(mockMutate).toHaveBeenCalledTimes(1);
      });

      const callArgs = mockMutate.mock.calls[0][0];

      // The fix: Should NOT include proxy object (would have caused the degradation)
      expect(callArgs.cluster.proxy).toBeUndefined();

      // Should only send the trust bundle
      expect(callArgs.cluster.additional_trust_bundle).toContain('BEGIN CERTIFICATE');
      expect(callArgs.cluster.additional_trust_bundle).toContain('Intermediate CA');
    });
  });
});
