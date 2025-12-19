import React from 'react';

import { checkAccessibility, render, screen, waitFor, withState } from '~/testUtils';

import { addonsQuotaList } from '../../../../../common/__tests__/quota.fixtures';
import fixtures from '../../../../__tests__/ClusterDetails.fixtures';
import { mockAddOns, mockClusterAddOns } from '../../__tests__/AddOns.fixtures';
import * as AddOnsActions from '../../AddOnsActions';
import AddOnsDrawer from '../AddOnsDrawer';

jest.mock('react-redux', () => {
  const config = {
    __esModule: true,
    ...jest.requireActual('react-redux'),
  };
  return config;
});

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

  it('ensure drawer is expanded when card clicked', async () => {
    const firstAddOn = mockAddOns.items[0];
    const initialState = {
      addOns: {
        drawer: {
          open: false,
          activeCard: null,
          activeCardRequirementsFulfilled: true,
          activeCardRequirements: null,
          installedAddOn: null,
          billingQuota: null,
          activeTabKey: 0,
          subscriptionModels: {},
        },
      },
    };

    // Save the original implementation before spying to avoid circular reference
    const originalSetAddonsDrawer = AddOnsActions.setAddonsDrawer;
    // Spy on setAddonsDrawer to verify it's called with correct arguments
    const setAddonsDrawerSpy = jest.spyOn(AddOnsActions, 'setAddonsDrawer');
    // Make the spy call through to the actual implementation so the action is dispatched
    setAddonsDrawerSpy.mockImplementation(originalSetAddonsDrawer);

    const testState = withState(initialState, true);
    const { user } = testState.render(<AddOnsDrawer {...props} />);

    // Verify drawer is initially closed - "Details" tab should not be visible (only appears in drawer panel)
    expect(screen.queryByRole('tab', { name: 'Details' })).not.toBeInTheDocument();

    // Get the first card
    const cards = screen.getAllByTestId('addOnCard');
    const firstCard = cards[0];

    // Click the radio button input to trigger the onChange handler
    const radioInput = firstCard.querySelector('input[type="radio"]');
    expect(radioInput).toBeInTheDocument();
    await user.click(radioInput);

    // Verify that setAddonsDrawer was called with the correct arguments
    // The component dispatches setAddonsDrawer when a card is clicked
    expect(setAddonsDrawerSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        open: true,
        activeCard: firstAddOn,
        activeCardRequirementsFulfilled: expect.any(Boolean),
        activeTabKey: 0,
      }),
    );

    // Wait for the drawer to expand - verify the "Details" tab appears (only in drawer panel)
    // The component should re-render automatically when Redux state changes
    await waitFor(
      () => {
        expect(screen.getByRole('tab', { name: 'Details' })).toBeInTheDocument();
      },
      { timeout: 3000 },
    );

    // Also verify the add-on name appears in the drawer panel (as h2 heading)
    expect(screen.getByRole('heading', { name: firstAddOn.name, level: 2 })).toBeInTheDocument();

    // Clean up spy
    setAddonsDrawerSpy.mockRestore();
  });
});
