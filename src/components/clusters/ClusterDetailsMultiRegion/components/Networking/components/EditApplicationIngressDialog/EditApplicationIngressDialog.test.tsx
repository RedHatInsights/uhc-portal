import React from 'react';
import { useFormikContext } from 'formik';
import * as reactRedux from 'react-redux';

import modals from '~/components/common/Modal/modals';
import * as useEditClusterIngressModule from '~/queries/ClusterDetailsQueries/NetworkingTab/useEditClusterIngress';
import { screen, withState } from '~/testUtils';
import { LoadBalancerFlavor } from '~/types/clusters_mgmt.v1/enums';

import EditApplicationIngressDialog from './EditApplicationIngressDialog';

jest.mock('react-redux', () => ({
  __esModule: true,
  ...jest.requireActual('react-redux'),
}));

jest.mock('~/hooks/useAnalytics', () => () => jest.fn());

jest.mock(
  '~/components/clusters/wizards/common/NetworkingSection/DefaultIngressFieldsFormik',
  () => ({
    DefaultIngressFieldsFormik: () => {
      const { setFieldValue } = useFormikContext();
      return (
        <button type="button" onClick={() => setFieldValue('private_default_router', true)}>
          Make dirty
        </button>
      );
    },
  }),
);

const mockedUseEditClusterIngressMutation = jest.spyOn(
  useEditClusterIngressModule,
  'useEditClusterIngressMutation',
);

describe('<EditApplicationIngressDialog />', () => {
  const refreshCluster = jest.fn();
  const mutate = jest.fn();

  const useDispatchMock = jest.spyOn(reactRedux, 'useDispatch');
  const mockedDispatch = jest.fn();

  const defaultReduxState = {
    modal: { modalName: modals.EDIT_APPLICATION_INGRESS, data: {} },
  };

  const defaultProps = {
    refreshCluster,
    clusterRouters: {
      default: {
        isDefault: true,
        isPrivate: false,
        isNamespaceOwnershipPolicyStrict: true,
        isWildcardPolicyAllowed: false,
        loadBalancer: LoadBalancerFlavor.nlb,
        address: 'apps.example.com',
      },
    },
    clusterID: 'cluster-123',
    provider: 'aws',
  };

  beforeEach(() => {
    useDispatchMock.mockReturnValue(mockedDispatch);
    mockedUseEditClusterIngressMutation.mockReturnValue({
      isPending: false,
      isSuccess: false,
      isError: false,
      error: null,
      mutate,
    });
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('does not call refreshCluster when cancelled', async () => {
    const { user } = withState(defaultReduxState).render(
      <EditApplicationIngressDialog {...defaultProps} />,
    );

    await user.click(screen.getByRole('button', { name: 'Cancel' }));

    expect(refreshCluster).not.toHaveBeenCalled();
    expect(mutate).not.toHaveBeenCalled();
    expect(mockedDispatch).toHaveBeenCalledWith(expect.objectContaining({ type: 'CLOSE_MODAL' }));
  });

  it('does not call refreshCluster when closed with the X button', async () => {
    const { user } = withState(defaultReduxState).render(
      <EditApplicationIngressDialog {...defaultProps} />,
    );

    await user.click(screen.getByRole('button', { name: 'Close' }));

    expect(refreshCluster).not.toHaveBeenCalled();
    expect(mutate).not.toHaveBeenCalled();
    expect(mockedDispatch).toHaveBeenCalledWith(expect.objectContaining({ type: 'CLOSE_MODAL' }));
  });

  it('calls refreshCluster when save succeeds', async () => {
    mutate.mockImplementation((_data, { onSuccess }) => {
      onSuccess?.();
    });

    const { user } = withState(defaultReduxState).render(
      <EditApplicationIngressDialog {...defaultProps} />,
    );

    await user.click(screen.getByRole('button', { name: 'Make dirty' }));
    await user.click(screen.getByRole('button', { name: 'Save' }));

    expect(mutate).toHaveBeenCalledTimes(1);
    expect(refreshCluster).toHaveBeenCalledTimes(1);
    expect(mockedDispatch).toHaveBeenCalledWith(expect.objectContaining({ type: 'CLOSE_MODAL' }));
  });

  it('submits HCP component route values from cluster routers', async () => {
    const { user } = withState(defaultReduxState).render(
      <EditApplicationIngressDialog
        {...defaultProps}
        isHypershiftCluster
        clusterRouters={{
          default: {
            ...defaultProps.clusterRouters.default,
            consoleHostname: 'console.example.com',
            consoleTlsSecretRef: 'console-tls',
            downloadsHostname: 'downloads.example.com',
            downloadsTlsSecretRef: 'downloads-tls',
          },
        }}
      />,
    );

    await user.click(screen.getByRole('button', { name: 'Make dirty' }));
    await user.click(screen.getByRole('button', { name: 'Save' }));

    expect(mutate).toHaveBeenCalledWith(
      expect.objectContaining({
        formData: expect.objectContaining({
          consoleHostname: 'console.example.com',
          consoleTlsSecretRef: 'console-tls',
          downloadsHostname: 'downloads.example.com',
          downloadsTlsSecretRef: 'downloads-tls',
        }),
      }),
      expect.any(Object),
    );
  });

  it('does not submit HCP component route fields for Classic', async () => {
    const { user } = withState(defaultReduxState).render(
      <EditApplicationIngressDialog {...defaultProps} />,
    );

    await user.click(screen.getByRole('button', { name: 'Make dirty' }));
    await user.click(screen.getByRole('button', { name: 'Save' }));

    const [{ formData }] = mutate.mock.calls[0];
    expect(formData).not.toHaveProperty('consoleHostname');
    expect(formData).not.toHaveProperty('consoleTlsSecretRef');
    expect(formData).not.toHaveProperty('downloadsHostname');
    expect(formData).not.toHaveProperty('downloadsTlsSecretRef');
  });

  it('submits empty HCP component route fields when unset', async () => {
    const { user } = withState(defaultReduxState).render(
      <EditApplicationIngressDialog {...defaultProps} isHypershiftCluster />,
    );

    await user.click(screen.getByRole('button', { name: 'Make dirty' }));
    await user.click(screen.getByRole('button', { name: 'Save' }));

    expect(mutate).toHaveBeenCalledWith(
      expect.objectContaining({
        formData: expect.objectContaining({
          consoleHostname: '',
          consoleTlsSecretRef: '',
          downloadsHostname: '',
          downloadsTlsSecretRef: '',
        }),
      }),
      expect.any(Object),
    );
  });
});
