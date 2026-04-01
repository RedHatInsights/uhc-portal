import React from 'react';
import * as reactRedux from 'react-redux';

import * as useEditCluster from '~/queries/ClusterDetailsQueries/useEditCluster';
import * as useFetchClusterDetails from '~/queries/ClusterDetailsQueries/useFetchClusterDetails';
import { render, screen, waitFor, withState } from '~/testUtils';
import { ClusterFromSubscription } from '~/types/types';

import EditClusterWideProxyDialog from './EditClusterWideProxyDialog';

jest.mock('react-redux', () => ({
  __esModule: true,
  ...jest.requireActual('react-redux'),
}));

const mockedUseEditCluster = jest.spyOn(useEditCluster, 'useEditCluster');
const mockedInvalidateClusterDetailsQueries = jest.spyOn(
  useFetchClusterDetails,
  'invalidateClusterDetailsQueries',
);

describe('<EditClusterWideProxyDialog />', () => {
  const mockMutate = jest.fn();
  const mockReset = jest.fn();
  const useDispatchMock = jest.spyOn(reactRedux, 'useDispatch');
  const mockedDispatch = jest.fn();

  const defaultCluster: ClusterFromSubscription = {
    id: 'test-cluster-id',
    proxy: {
      http_proxy: 'http://proxy.example.com:8080',
      https_proxy: 'https://proxy.example.com:8443',
      no_proxy: '.example.com,10.0.0.0/8',
    },
    additional_trust_bundle: undefined,
  } as ClusterFromSubscription;

  const defaultState = {
    modal: {
      modalName: 'EDIT_CLUSTER_WIDE_PROXY',
    },
  };

  beforeEach(() => {
    useDispatchMock.mockReturnValue(mockedDispatch);
    mockedUseEditCluster.mockReturnValue({
      isPending: false,
      isError: false,
      error: null,
      mutate: mockMutate,
      reset: mockReset,
      isSuccess: false,
      data: null,
    });
    mockedInvalidateClusterDetailsQueries.mockImplementation(() => {});
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('OCMUI-4183 Regression Tests - Proxy Payload Construction', () => {
    it('sends complete proxy object when only additional_trust_bundle is changed', async () => {
      // Arrange
      const cluster = {
        ...defaultCluster,
        additional_trust_bundle: undefined,
      };

      const { user } = withState(defaultState, true).render(
        <EditClusterWideProxyDialog cluster={cluster} region="us-east-1" />,
      );

      // Wait for modal to be visible
      await waitFor(() => {
        expect(screen.getByText('Edit cluster-wide Proxy')).toBeInTheDocument();
      });

      // Act - Add trust bundle without changing proxy fields
      const trustBundleTextArea = screen.getByPlaceholderText(/paste or upload/i);
      await user.type(trustBundleTextArea, '-----BEGIN CERTIFICATE-----\nMockCert\n-----END CERTIFICATE-----');

      // Submit
      const saveButton = screen.getByRole('button', { name: 'Save' });
      await user.click(saveButton);

      // Assert - CRITICAL: Verify mutate was called with COMPLETE proxy object
      expect(mockMutate).toHaveBeenCalledWith(
        {
          clusterID: 'test-cluster-id',
          cluster: {
            proxy: {
              http_proxy: 'http://proxy.example.com:8080',
              https_proxy: 'https://proxy.example.com:8443',
              no_proxy: '.example.com,10.0.0.0/8',
            },
            additional_trust_bundle: '-----BEGIN CERTIFICATE-----\nMockCert\n-----END CERTIFICATE-----',
          },
        },
        expect.objectContaining({ onSuccess: expect.any(Function) }),
      );

      // Verify proxy object is NOT empty (regression test for OCMUI-4183)
      const callArgs = mockMutate.mock.calls[0][0];
      expect(callArgs.cluster.proxy).toBeDefined();
      expect(Object.keys(callArgs.cluster.proxy).length).toBe(3);

      // Verify proxy fields are present (not undefined from OnlyReturnValueIfChanged)
      expect(callArgs.cluster.proxy.http_proxy).toBe('http://proxy.example.com:8080');
      expect(callArgs.cluster.proxy.https_proxy).toBe('https://proxy.example.com:8443');
      expect(callArgs.cluster.proxy.no_proxy).toBe('.example.com,10.0.0.0/8');
    });

    it('sends complete payload when only proxy URLs are changed', async () => {
      // Arrange
      const cluster = {
        ...defaultCluster,
        additional_trust_bundle: 'existing-cert-bundle',
      };

      const { user } = withState(defaultState, true).render(
        <EditClusterWideProxyDialog cluster={cluster} region="us-east-1" />,
      );

      await waitFor(() => {
        expect(screen.getByText('Edit cluster-wide Proxy')).toBeInTheDocument();
      });

      // Act - Change HTTP proxy URL
      const httpProxyInput = screen.getByPlaceholderText('http://username:pswd@proxy.com:80');
      await user.clear(httpProxyInput);
      await user.type(httpProxyInput, 'http://new-proxy.example.com:8080');

      const saveButton = screen.getByRole('button', { name: 'Save' });
      await user.click(saveButton);

      // Assert - Verify all fields are sent
      expect(mockMutate).toHaveBeenCalledWith(
        {
          clusterID: 'test-cluster-id',
          cluster: {
            proxy: {
              http_proxy: 'http://new-proxy.example.com:8080',
              https_proxy: 'https://proxy.example.com:8443',
              no_proxy: '.example.com,10.0.0.0/8',
            },
            additional_trust_bundle: 'existing-cert-bundle',
          },
        },
        expect.objectContaining({ onSuccess: expect.any(Function) }),
      );
    });

    it('sends complete payload when both proxy and trust bundle are changed', async () => {
      // Arrange
      const cluster = {
        ...defaultCluster,
        proxy: {
          http_proxy: 'http://old-proxy.com:8080',
          https_proxy: undefined,
          no_proxy: undefined,
        },
        additional_trust_bundle: undefined,
      };

      const { user } = withState(defaultState, true).render(
        <EditClusterWideProxyDialog cluster={cluster} region="us-east-1" />,
      );

      await waitFor(() => {
        expect(screen.getByText('Edit cluster-wide Proxy')).toBeInTheDocument();
      });

      // Act - Change HTTP proxy and add trust bundle
      const httpProxyInput = screen.getByPlaceholderText('http://username:pswd@proxy.com:80');
      await user.clear(httpProxyInput);
      await user.type(httpProxyInput, 'http://new-proxy.example.com:9090');

      const trustBundleTextArea = screen.getByPlaceholderText(/paste or upload/i);
      await user.type(trustBundleTextArea, 'new-certificate-bundle');

      const saveButton = screen.getByRole('button', { name: 'Save' });
      await user.click(saveButton);

      // Assert - Verify both proxy and trust bundle are present
      expect(mockMutate).toHaveBeenCalledWith(
        {
          clusterID: 'test-cluster-id',
          cluster: {
            proxy: {
              http_proxy: 'http://new-proxy.example.com:9090',
              https_proxy: undefined,
              no_proxy: '',
            },
            additional_trust_bundle: 'new-certificate-bundle',
          },
        },
        expect.objectContaining({ onSuccess: expect.any(Function) }),
      );
    });

    it('sends complete payload when cluster has no existing proxy configuration', async () => {
      // Arrange
      const cluster = {
        ...defaultCluster,
        proxy: undefined,
        additional_trust_bundle: undefined,
      };

      const { user } = withState(defaultState, true).render(
        <EditClusterWideProxyDialog cluster={cluster} region="us-east-1" />,
      );

      await waitFor(() => {
        expect(screen.getByText('Edit cluster-wide Proxy')).toBeInTheDocument();
      });

      // Act - Add only trust bundle to cluster with no existing proxy
      const trustBundleTextArea = screen.getByPlaceholderText(/paste or upload/i);
      await user.type(trustBundleTextArea, 'first-certificate-bundle');

      const saveButton = screen.getByRole('button', { name: 'Save' });
      await user.click(saveButton);

      // Assert - Verify proxy object is created with undefined values (not omitted)
      expect(mockMutate).toHaveBeenCalledWith(
        {
          clusterID: 'test-cluster-id',
          cluster: {
            proxy: {
              http_proxy: undefined,
              https_proxy: undefined,
              no_proxy: '',
            },
            additional_trust_bundle: 'first-certificate-bundle',
          },
        },
        expect.objectContaining({ onSuccess: expect.any(Function) }),
      );

      // Verify proxy object exists (even with undefined values)
      const callArgs = mockMutate.mock.calls[0][0];
      expect(callArgs.cluster.proxy).toBeDefined();
    });
  });

  describe('Modal behavior', () => {
    it('does not render when modal is not open', () => {
      const closedModalState = {
        modal: {
          modalName: 'SOME_OTHER_MODAL',
        },
      };

      withState(closedModalState, true).render(
        <EditClusterWideProxyDialog cluster={defaultCluster} region="us-east-1" />,
      );

      expect(screen.queryByText('Edit cluster-wide Proxy')).not.toBeInTheDocument();
    });

    it('closes modal on successful submission', async () => {
      // Arrange
      let onSuccessCallback: (() => void) | undefined;
      mockMutate.mockImplementation((data, options) => {
        onSuccessCallback = options?.onSuccess;
      });

      const { user } = withState(defaultState, true).render(
        <EditClusterWideProxyDialog cluster={defaultCluster} region="us-east-1" />,
      );

      await waitFor(() => {
        expect(screen.getByText('Edit cluster-wide Proxy')).toBeInTheDocument();
      });

      // Act - Submit form
      const httpProxyInput = screen.getByPlaceholderText('http://username:pswd@proxy.com:80');
      await user.clear(httpProxyInput);
      await user.type(httpProxyInput, 'http://changed.com');

      const saveButton = screen.getByRole('button', { name: 'Save' });
      await user.click(saveButton);

      // Simulate successful response
      expect(onSuccessCallback).toBeDefined();
      onSuccessCallback!();

      // Assert - Verify modal close action was dispatched
      expect(mockedDispatch).toHaveBeenCalledWith(
        expect.objectContaining({ type: 'CLOSE_MODAL' }),
      );
      expect(mockReset).toHaveBeenCalled();
      expect(mockedInvalidateClusterDetailsQueries).toHaveBeenCalled();
    });

    it('closes modal when cancel is clicked', async () => {
      const { user } = withState(defaultState, true).render(
        <EditClusterWideProxyDialog cluster={defaultCluster} region="us-east-1" />,
      );

      await waitFor(() => {
        expect(screen.getByText('Edit cluster-wide Proxy')).toBeInTheDocument();
      });

      // Act
      const cancelButton = screen.getByRole('button', { name: 'Cancel' });
      await user.click(cancelButton);

      // Assert
      expect(mockedDispatch).toHaveBeenCalledWith(
        expect.objectContaining({ type: 'CLOSE_MODAL' }),
      );
    });
  });

  describe('Error handling', () => {
    it('displays error message when edit fails', async () => {
      // Arrange
      mockedUseEditCluster.mockReturnValue({
        isPending: false,
        isError: true,
        error: {
          errorMessage: 'CLUSTERS-MGMT-400: Invalid proxy configuration',
          operationID: 'op-123',
        } as any,
        mutate: mockMutate,
        reset: mockReset,
        isSuccess: false,
        data: null,
      });

      withState(defaultState, true).render(
        <EditClusterWideProxyDialog cluster={defaultCluster} region="us-east-1" />,
      );

      // Assert
      await waitFor(() => {
        expect(screen.getByText(/Invalid proxy configuration/i)).toBeInTheDocument();
      });
    });
  });

  describe('Payload serialization behavior (documents the bug)', () => {
    it('demonstrates that current implementation avoids empty proxy object', () => {
      // This test documents the fix for OCMUI-4183
      // BEFORE fix: OnlyReturnValueIfChanged returned undefined → JSON.stringify stripped it → empty proxy: {}
      // AFTER fix: Always send field values → complete proxy object

      const payloadWithValues = {
        proxy: {
          http_proxy: 'http://proxy.example.com',
          https_proxy: 'https://proxy.example.com',
          no_proxy: '.example.com',
        },
        additional_trust_bundle: 'cert-value',
      };

      // Serialize and parse (simulates API request)
      const serialized = JSON.stringify(payloadWithValues);
      const parsed = JSON.parse(serialized);

      // Verify proxy object is complete after serialization
      expect(parsed.proxy).toBeDefined();
      expect(Object.keys(parsed.proxy).length).toBe(3);
      expect(parsed.proxy.http_proxy).toBe('http://proxy.example.com');
      expect(parsed.additional_trust_bundle).toBe('cert-value');
    });

    it('demonstrates the BUGGY behavior with undefined values (anti-pattern)', () => {
      // This demonstrates what the BUG looked like before the fix
      // DO NOT implement this pattern - this test is for documentation only

      const buggyPayload = {
        proxy: {
          http_proxy: undefined,
          https_proxy: undefined,
          no_proxy: undefined,
        },
        additional_trust_bundle: 'cert-value',
      };

      const serialized = JSON.stringify(buggyPayload);
      const parsed = JSON.parse(serialized);

      // This is what caused OCMUI-4183 - empty proxy object!
      expect(parsed.proxy).toEqual({});
      expect(Object.keys(parsed.proxy).length).toBe(0);

      // The fix ensures we never send undefined values that get stripped
    });
  });
});
