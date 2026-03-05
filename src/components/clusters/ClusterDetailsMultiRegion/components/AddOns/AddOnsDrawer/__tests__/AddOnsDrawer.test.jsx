import React from 'react';

import { checkAccessibility, render, screen } from '~/testUtils';

import { addonsQuotaList } from '../../../../../common/__tests__/quota.fixtures';
import fixtures from '../../../../__tests__/ClusterDetails.fixtures';
import { mockAddOns, mockClusterAddOns } from '../../__tests__/AddOns.fixtures';
import AddOnsDrawer from '../AddOnsDrawer';

describe('<AddOnsDrawer />', () => {
  const openModal = jest.fn();
  const addClusterAddOn = jest.fn();
  const updateClusterAddOn = jest.fn();
  const setAddonsDrawer = jest.fn();
  const addClusterAddOnResponse = {};
  const deleteClusterAddOnResponse = {};
  const submitClusterAddOnResponse = {};
  const drawer = {
    open: false,
    activeCard: mockAddOns.items[0],
  };

  const { clusterDetails, organization } = fixtures;

  const props = {
    addOnsList: mockAddOns.items,
    mockClusterAddOns,
    cluster: clusterDetails.cluster,
    clusterAddOns: mockClusterAddOns,
    organization,
    quota: addonsQuotaList,
    openModal,
    clusterMachinePools: {},
    addClusterAddOn,
    addClusterAddOnResponse,
    deleteClusterAddOnResponse,
    updateClusterAddOn,
    submitClusterAddOnResponse,
    setAddonsDrawer,
    drawer,
    isAddClusterAddOnPending: false,
    isUpdateClusterAddOnError: false,
    isUpdateClusterAddOnPending: false,
    isAddClusterAddOnError: false,
    isDeleteClusterAddOnError: false,
    isDeleteClusterAddOnPending: false,
    addClusterAddOnError: {},
    updateClusterAddOnError: {},
    deleteClusterAddOn: jest.fn(),
    activeCard: {},
    installedAddOn: {},
    isOpen: false,
    deleteClusterAddOnError: {},
  };

  afterEach(() => {
    openModal.mockClear();
    addClusterAddOn.mockClear();
    updateClusterAddOn.mockClear();
    setAddonsDrawer.mockClear();
  });

  it('is accessible', async () => {
    const { container } = render(<AddOnsDrawer {...props} />);
    await checkAccessibility(container);
  });

  it('expect 7 rendered cards', () => {
    render(<AddOnsDrawer {...props} />);

    expect(screen.getAllByTestId('addOnCard')).toHaveLength(7);
  });

  it.skip('ensure  drawer is expanded when card clicked', () => {});
});
