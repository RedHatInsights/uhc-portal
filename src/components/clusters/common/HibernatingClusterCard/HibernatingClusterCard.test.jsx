import React from 'react';
import * as reactRedux from 'react-redux';

import { openModal } from '~/components/common/Modal/ModalActions';
import modals from '~/components/common/Modal/modals';
import { checkAccessibility, render, screen } from '~/testUtils';

import clusterStates from '../clusterStates';

import HibernatingClusterCard from './HibernatingClusterCard';

jest.mock('react-redux', () => {
  const config = {
    __esModule: true,
    ...jest.requireActual('react-redux'),
  };
  return config;
});

describe('<HibernatingClusterCard />', () => {
  const mockedDispatch = jest.fn();
  jest.spyOn(reactRedux, 'useDispatch').mockReturnValue(mockedDispatch);

  const cluster = {
    id: 'test-id',
    name: 'test-cluster',
    canEdit: true,
    subscription: {
      id: 'subscription-id',
    },
    state: clusterStates.hibernating,
  };

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('is accessible', async () => {
    const { container } = render(<HibernatingClusterCard cluster={cluster} />);

    expect(screen.getByText('Cluster is currently hibernating')).toBeInTheDocument();
    await checkAccessibility(container);
  });

  it('opens resume cluster modal with isROSA when cluster is ROSA', async () => {
    const rosaCluster = {
      ...cluster,
      product: { id: 'ROSA' },
      subscription: {
        id: 'subscription-id',
        plan: { type: 'ROSA' },
      },
    };

    const { user } = render(<HibernatingClusterCard cluster={rosaCluster} />);
    await user.click(screen.getByRole('button', { name: 'Resume from Hibernation' }));

    expect(mockedDispatch).toHaveBeenCalledWith(
      openModal(modals.RESUME_CLUSTER, {
        clusterID: 'test-id',
        clusterName: 'test-cluster',
        subscriptionID: 'subscription-id',
        isROSA: true,
      }),
    );
  });

  it('opens resume cluster modal with isROSA false for non-ROSA cluster', async () => {
    const { user } = render(<HibernatingClusterCard cluster={cluster} />);
    await user.click(screen.getByRole('button', { name: 'Resume from Hibernation' }));

    expect(mockedDispatch).toHaveBeenCalledWith(
      openModal(modals.RESUME_CLUSTER, {
        clusterID: 'test-id',
        clusterName: 'test-cluster',
        subscriptionID: 'subscription-id',
        isROSA: false,
      }),
    );
  });
});
