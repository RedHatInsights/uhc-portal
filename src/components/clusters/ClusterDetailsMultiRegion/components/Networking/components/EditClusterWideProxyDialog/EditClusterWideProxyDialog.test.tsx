import React from 'react';
import * as reactRedux from 'react-redux';

import * as useEditCluster from '~/queries/ClusterDetailsQueries/useEditCluster';
import * as invalidateClusterDetailsQueries from '~/queries/ClusterDetailsQueries/useFetchClusterDetails';
import { checkAccessibility, screen, waitFor, withState } from '~/testUtils';
import { ClusterFromSubscription } from '~/types/types';

import EditClusterWideProxyDialog from './EditClusterWideProxyDialog';

jest.mock('react-redux', () => {
  const config = {
    __esModule: true,
    ...jest.requireActual('react-redux'),
  };
  return config;
});

jest.mock('~/components/common/ReduxFormComponents_deprecated/ReduxFileUpload', () => ({
  __esModule: true,
  default: ({ input, meta }: any) => (
    <div>
      <label htmlFor="mock-upload">
        Additional trust bundle
        <textarea
          id="mock-upload"
          data-testid="additional_trust_bundle"
          value={input.value || ''}
          onChange={(e) => input.onChange(e.target.value)}
          onBlur={input.onBlur}
        />
      </label>
      {meta?.error && <div role="alert">{meta.error}</div>}
    </div>
  ),
}));

const mockedUseEditCluster = jest.spyOn(useEditCluster, 'useEditCluster');
const mockedInvalidateClusterDetailsQueries = jest.spyOn(
  invalidateClusterDetailsQueries,
  'invalidateClusterDetailsQueries',
);

describe('<EditClusterWideProxyDialog />', () => {
  const mockMutate = jest.fn();
  const mockReset = jest.fn();
  const useDispatchMock = jest.spyOn(reactRedux, 'useDispatch');
  const mockedDispatch = jest.fn();
  useDispatchMock.mockReturnValue(mockedDispatch);

  const baseCluster: ClusterFromSubscription = {
    id: 'test-cluster-123',
    display_name: 'Test Cluster',
    external_id: 'test-external-id',
    subscription: {
      id: 'test-subscription-123',
    },
    proxy: {
      http_proxy: 'http://proxy.example.com:8080',
      https_proxy: 'https://proxy.example.com:8443',
      no_proxy: 'localhost,127.0.0.1',
    },
    additional_trust_bundle: undefined,
  } as ClusterFromSubscription;

  const defaultState = {
    modal: {
      modalName: 'EDIT_CLUSTER_WIDE_PROXY',
      modalProps: {},
      data: {},
    },
  };

  const setMockingValues = () => {
    mockedUseEditCluster.mockReturnValue({
      isPending: false,
      isError: false,
      error: null,
      mutate: mockMutate,
      reset: mockReset,
      isSuccess: false,
      data: undefined,
    });
    mockedInvalidateClusterDetailsQueries.mockImplementation(() => {});
  };

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('is accessible on initial render', async () => {
    setMockingValues();

    const { container } = withState(defaultState, true).render(
      <EditClusterWideProxyDialog cluster={baseCluster} region="us-east-1" />,
    );

    expect(await screen.findByText('Edit cluster-wide Proxy')).toBeInTheDocument();
    await checkAccessibility(container);
  });

  describe('Regression: OCMUI-4183 - Conditional field inclusion', () => {
    it('only sends additional_trust_bundle when only CA cert changes on cluster with existing proxy', async () => {
      setMockingValues();

      // Capture the onSuccess callback that will be passed to mutate
      let onSuccessCallback: (() => void) | undefined;
      mockMutate.mockImplementation((data, options) => {
        onSuccessCallback = options?.onSuccess;
      });

      const { user } = withState(defaultState, true).render(
        <EditClusterWideProxyDialog cluster={baseCluster} region="us-east-1" />,
      );

      // Wait for dialog to render
      expect(await screen.findByText('Edit cluster-wide Proxy')).toBeInTheDocument();

      // Customer scenario: Add CA cert without touching proxy settings
      const certData = '-----BEGIN CERTIFICATE-----\nMOCK_CERT_DATA\n-----END CERTIFICATE-----';
      const uploadField = screen.getByTestId('additional_trust_bundle');

      // Clear any existing value and type new cert
      await user.clear(uploadField);
      await user.type(uploadField, certData);

      // Wait for button to be enabled (form is dirty)
      const saveButton = screen.getByRole('button', { name: /save/i });
      await waitFor(() => expect(saveButton).toBeEnabled(), { timeout: 3000 });
      await user.click(saveButton);

      await waitFor(() => {
        expect(mockMutate).toHaveBeenCalledTimes(1);
      });

      // The fix: Should NOT include proxy object, only trust bundle
      expect(mockMutate).toHaveBeenCalledWith(
        {
          clusterID: 'test-cluster-123',
          cluster: {
            additional_trust_bundle: certData,
            // proxy object should NOT be present
          },
        },
        expect.objectContaining({
          onSuccess: expect.any(Function),
        }),
      );

      // Verify proxy object is not in the request body
      const callArgs = mockMutate.mock.calls[0][0];
      expect(callArgs.cluster.proxy).toBeUndefined();

      // Manually trigger the onSuccess callback
      expect(onSuccessCallback).toBeDefined();
      onSuccessCallback!();

      // Verify that closeModal was dispatched
      expect(mockedDispatch).toHaveBeenCalled();
      expect(mockedDispatch.mock.calls[0][0].type).toEqual('CLOSE_MODAL');
      expect(mockedInvalidateClusterDetailsQueries).toHaveBeenCalled();
    });

    it('only sends proxy fields when only proxy settings change', async () => {
      setMockingValues();

      const clusterWithTrustBundle = {
        ...baseCluster,
        additional_trust_bundle:
          '-----BEGIN CERTIFICATE-----\nEXISTING_CERT\n-----END CERTIFICATE-----',
      };

      const { user } = withState(defaultState, true).render(
        <EditClusterWideProxyDialog cluster={clusterWithTrustBundle} region="us-east-1" />,
      );

      expect(await screen.findByText('Edit cluster-wide Proxy')).toBeInTheDocument();

      // Change only the HTTP proxy URL
      const httpProxyField = screen.getByLabelText('HTTP Proxy URL');
      await user.clear(httpProxyField);
      await user.type(httpProxyField, 'http://newproxy.example.com:8080');

      const saveButton = screen.getByRole('button', { name: /save/i });
      await waitFor(() => expect(saveButton).toBeEnabled());
      await user.click(saveButton);

      await waitFor(() => {
        expect(mockMutate).toHaveBeenCalledTimes(1);
      });

      // Should include proxy object with only http_proxy field, not additional_trust_bundle
      const callArgs = mockMutate.mock.calls[0][0];
      expect(callArgs.cluster.proxy).toBeDefined();
      expect(callArgs.cluster.proxy.http_proxy).toBe('http://newproxy.example.com:8080');
      expect(callArgs.cluster.additional_trust_bundle).toBeUndefined();
    });

    it('sends both proxy and trust bundle when both change', async () => {
      setMockingValues();

      const { user } = withState(defaultState, true).render(
        <EditClusterWideProxyDialog cluster={baseCluster} region="us-east-1" />,
      );

      expect(await screen.findByText('Edit cluster-wide Proxy')).toBeInTheDocument();

      // Change HTTP proxy
      const httpProxyField = screen.getByLabelText('HTTP Proxy URL');
      await user.clear(httpProxyField);
      await user.type(httpProxyField, 'http://newproxy.example.com:8080');

      // Add trust bundle
      const certData = '-----BEGIN CERTIFICATE-----\nNEW_CERT\n-----END CERTIFICATE-----';
      const uploadField = screen.getByTestId('additional_trust_bundle');
      await user.type(uploadField, certData);

      const saveButton = screen.getByRole('button', { name: /save/i });
      await waitFor(() => expect(saveButton).toBeEnabled());
      await user.click(saveButton);

      await waitFor(() => {
        expect(mockMutate).toHaveBeenCalledTimes(1);
      });

      // Should include both proxy and trust bundle
      const callArgs = mockMutate.mock.calls[0][0];
      expect(callArgs.cluster.proxy).toBeDefined();
      expect(callArgs.cluster.proxy.http_proxy).toBe('http://newproxy.example.com:8080');
      expect(callArgs.cluster.additional_trust_bundle).toBe(certData);
    });

    it('does not send proxy object when no proxy fields change on cluster without proxy', async () => {
      setMockingValues();

      const clusterWithoutProxy = {
        ...baseCluster,
        proxy: undefined,
      };

      const { user } = withState(defaultState, true).render(
        <EditClusterWideProxyDialog cluster={clusterWithoutProxy} region="us-east-1" />,
      );

      expect(await screen.findByText('Edit cluster-wide Proxy')).toBeInTheDocument();

      // Only add trust bundle, no proxy settings
      const certData = '-----BEGIN CERTIFICATE-----\nNEW_CERT\n-----END CERTIFICATE-----';
      const uploadField = screen.getByTestId('additional_trust_bundle');
      await user.type(uploadField, certData);

      const saveButton = screen.getByRole('button', { name: /save/i });
      await waitFor(() => expect(saveButton).toBeEnabled());
      await user.click(saveButton);

      await waitFor(() => {
        expect(mockMutate).toHaveBeenCalledTimes(1);
      });

      // Should only have trust bundle, no proxy object
      const callArgs = mockMutate.mock.calls[0][0];
      expect(callArgs.cluster.proxy).toBeUndefined();
      expect(callArgs.cluster.additional_trust_bundle).toBe(certData);
    });
  });

  describe('form behavior', () => {
    it('disables Save button when no changes made', async () => {
      setMockingValues();

      withState(defaultState, true).render(
        <EditClusterWideProxyDialog cluster={baseCluster} region="us-east-1" />,
      );

      expect(await screen.findByText('Edit cluster-wide Proxy')).toBeInTheDocument();

      const saveButton = screen.getByRole('button', { name: /save/i });
      expect(saveButton).toBeDisabled();
    });

    it('closes dialog when Cancel is clicked', async () => {
      setMockingValues();

      const { user } = withState(defaultState, true).render(
        <EditClusterWideProxyDialog cluster={baseCluster} region="us-east-1" />,
      );

      expect(await screen.findByText('Edit cluster-wide Proxy')).toBeInTheDocument();

      await user.click(screen.getByRole('button', { name: 'Cancel' }));

      expect(mockedDispatch).toHaveBeenCalled();
      expect(mockedDispatch.mock.calls[0][0].type).toEqual('CLOSE_MODAL');
    });
  });

  describe('error handling', () => {
    it('displays error when cluster edit fails', async () => {
      mockedUseEditCluster.mockReturnValue({
        isPending: false,
        isError: true,
        error: {
          errorMessage: 'CLUSTERS-MGMT-400: Invalid proxy configuration',
          operationID: 'test-operation-123',
        } as any,
        mutate: mockMutate,
        reset: mockReset,
        isSuccess: false,
        data: undefined,
      });

      withState(defaultState, true).render(
        <EditClusterWideProxyDialog cluster={baseCluster} region="us-east-1" />,
      );

      expect(await screen.findByText('Edit cluster-wide Proxy')).toBeInTheDocument();
      expect(
        screen.getByText(/CLUSTERS-MGMT-400: Invalid proxy configuration/),
      ).toBeInTheDocument();
    });
  });
});
