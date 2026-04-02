import React from 'react';
import type { FormikProps } from 'formik';
import * as reactRedux from 'react-redux';

import { useEditCluster } from '~/queries/ClusterDetailsQueries/useEditCluster';
import { invalidateClusterDetailsQueries } from '~/queries/ClusterDetailsQueries/useFetchClusterDetails';
import { useGlobalState } from '~/redux/hooks';
import { act, render, screen, waitFor } from '~/testUtils';
import type { ClusterFromSubscription } from '~/types/types';

import EditClusterWideProxyDialog from './EditClusterWideProxyDialog';

jest.mock('~/redux/hooks', () => ({
  useGlobalState: jest.fn(),
}));

jest.mock('~/queries/ClusterDetailsQueries/useEditCluster', () => ({
  useEditCluster: jest.fn(),
}));

jest.mock('~/queries/ClusterDetailsQueries/useFetchClusterDetails', () => ({
  invalidateClusterDetailsQueries: jest.fn(),
}));

// Mock the form component to expose Formik's setFieldValue and submitForm
let formikRef: FormikProps<any> | null = null;

jest.mock('./EditClusterWideProxyForm', () => {
  const MockForm = ({ submitForm }: { submitForm: () => void }) => {
    return (
      <div data-testid="mock-form">
        <button data-testid="submit-btn" onClick={submitForm}>
          Save
        </button>
      </div>
    );
  };
  MockForm.displayName = 'MockForm';
  return MockForm;
});

jest.mock('react-redux', () => ({
  __esModule: true,
  ...jest.requireActual('react-redux'),
}));

// Intercept Formik to capture setFieldValue
jest.mock('formik', () => {
  const actual = jest.requireActual('formik');
  return {
    ...actual,
    Formik: (props: any) => {
      const FormikWrapper = actual.Formik;
      return (
        <FormikWrapper {...props}>
          {(formikProps: FormikProps<any>) => {
            formikRef = formikProps;
            return props.children(formikProps);
          }}
        </FormikWrapper>
      );
    },
  };
});

const useGlobalStateMock = useGlobalState as jest.Mock;
const useEditClusterMock = useEditCluster as jest.Mock;

describe('<EditClusterWideProxyDialog />', () => {
  const useDispatchMock = jest.spyOn(reactRedux, 'useDispatch');
  const dispatchMock = jest.fn();
  const mutateMock = jest.fn();
  const resetMock = jest.fn();

  const baseCluster = {
    id: 'cluster-123',
    proxy: {
      http_proxy: 'http://proxy.example.com:8080',
      https_proxy: 'https://proxy.example.com:8443',
      no_proxy: '.example.com',
    },
    additional_trust_bundle: undefined,
  } as unknown as ClusterFromSubscription;

  beforeEach(() => {
    jest.clearAllMocks();
    formikRef = null;
    useDispatchMock.mockReturnValue(dispatchMock);
    useGlobalStateMock.mockReturnValue(true);

    useEditClusterMock.mockReturnValue({
      isPending: false,
      isError: false,
      error: null,
      mutate: mutateMock,
      reset: resetMock,
      isSuccess: false,
    });
  });

  describe('Regression: OCMUI-4183', () => {
    it('does not include proxy object when only additional_trust_bundle changes', async () => {
      // Arrange
      render(<EditClusterWideProxyDialog cluster={baseCluster} region="us-east-1" />);

      // Act - simulate changing only the trust bundle via Formik
      await act(async () => {
        formikRef?.setFieldValue(
          'additional_trust_bundle',
          '-----BEGIN CERTIFICATE-----\ntest\n-----END CERTIFICATE-----',
        );
      });

      await act(async () => {
        formikRef?.submitForm();
      });

      // Assert - mutate should be called without proxy key
      await waitFor(() => {
        expect(mutateMock).toHaveBeenCalledTimes(1);
      });

      const callArgs = mutateMock.mock.calls[0][0];
      expect(callArgs.clusterID).toBe('cluster-123');
      expect(callArgs.cluster).not.toHaveProperty('proxy');
      expect(callArgs.cluster.additional_trust_bundle).toBe(
        '-----BEGIN CERTIFICATE-----\ntest\n-----END CERTIFICATE-----',
      );
    });

    it('includes proxy object when proxy fields change', async () => {
      // Arrange - cluster with no existing proxy
      const clusterNoProxy = {
        ...baseCluster,
        proxy: undefined,
      } as unknown as ClusterFromSubscription;

      render(<EditClusterWideProxyDialog cluster={clusterNoProxy} region="us-east-1" />);

      // Act - change the HTTP proxy URL
      await act(async () => {
        formikRef?.setFieldValue('http_proxy_url', 'http://new-proxy.example.com:8080');
      });

      await act(async () => {
        formikRef?.submitForm();
      });

      // Assert - mutate should be called with proxy key
      await waitFor(() => {
        expect(mutateMock).toHaveBeenCalledTimes(1);
      });

      const callArgs = mutateMock.mock.calls[0][0];
      expect(callArgs.cluster).toHaveProperty('proxy');
      expect(callArgs.cluster.proxy.http_proxy).toBe('http://new-proxy.example.com:8080');
    });

    it('includes both proxy and trust bundle when both change', async () => {
      // Arrange - cluster with no proxy or trust bundle
      const emptyCluster = {
        ...baseCluster,
        proxy: undefined,
        additional_trust_bundle: undefined,
      } as unknown as ClusterFromSubscription;

      render(<EditClusterWideProxyDialog cluster={emptyCluster} region="us-east-1" />);

      // Act - change both proxy and trust bundle
      await act(async () => {
        formikRef?.setFieldValue('http_proxy_url', 'http://proxy.example.com:8080');
        formikRef?.setFieldValue(
          'additional_trust_bundle',
          '-----BEGIN CERTIFICATE-----\ntest\n-----END CERTIFICATE-----',
        );
      });

      await act(async () => {
        formikRef?.submitForm();
      });

      // Assert
      await waitFor(() => {
        expect(mutateMock).toHaveBeenCalledTimes(1);
      });

      const callArgs = mutateMock.mock.calls[0][0];
      expect(callArgs.cluster).toHaveProperty('proxy');
      expect(callArgs.cluster).toHaveProperty('additional_trust_bundle');
    });

    it('omits unchanged proxy fields within proxy object', async () => {
      // Arrange - cluster with existing proxy
      render(<EditClusterWideProxyDialog cluster={baseCluster} region="us-east-1" />);

      // Act - change only http_proxy (https_proxy and no_proxy unchanged)
      await act(async () => {
        formikRef?.setFieldValue('http_proxy_url', 'http://different-proxy.example.com:9090');
      });

      await act(async () => {
        formikRef?.submitForm();
      });

      // Assert
      await waitFor(() => {
        expect(mutateMock).toHaveBeenCalledTimes(1);
      });

      const callArgs = mutateMock.mock.calls[0][0];
      expect(callArgs.cluster.proxy.http_proxy).toBe('http://different-proxy.example.com:9090');
      // Unchanged fields should be undefined (not sent)
      expect(callArgs.cluster.proxy.https_proxy).toBeUndefined();
      expect(callArgs.cluster.proxy.no_proxy).toBeUndefined();
    });
  });

  it('does not render when modal is closed', () => {
    useGlobalStateMock.mockReturnValue(false);

    const { container } = render(
      <EditClusterWideProxyDialog cluster={baseCluster} region="us-east-1" />,
    );

    expect(container).toBeEmptyDOMElement();
  });
});
