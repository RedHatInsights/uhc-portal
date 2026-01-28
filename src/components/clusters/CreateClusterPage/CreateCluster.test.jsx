import React from 'react';

import { checkAccessibility, render, screen, userEvent } from '../../../testUtils';

import CreateClusterPage from './CreateClusterPage';

describe('<CreateClusterPage />', () => {
  const getOrganizationAndQuota = jest.fn();
  const getAuthToken = jest.fn();

  afterEach(() => {
    jest.clearAllMocks();
  });

  const organization = {
    details: null,
    error: false,
    errorMessage: '',
    pending: false,
    fulfilled: false,
  };

  const props = {
    getOrganizationAndQuota,
    getAuthToken,
    hasOSDQuota: true,
    hasOSDTrialQuota: true,
    rosaCreationWizardFeature: false,
    organization: { ...organization, fulfilled: true },
    token: {},
  };

  it('is accessible', async () => {
    const { container } = render(<CreateClusterPage {...props} activeTab="" />);

    await checkAccessibility(container);
  });

  describe('Tabs rendered correctly', () => {
    it.each([
      ['cloud', 'Cloud'],
      ['datacenter', 'Datacenter'],
      ['local', 'Local'],
    ])('renders correct tab when %s', async (tabKey, tabValue) => {
      const { rerender } = render(<CreateClusterPage {...props} activeTab="" />);
      await userEvent.click(screen.getByRole('tab', { name: tabValue }));
      rerender(<CreateClusterPage {...props} activeTab={tabKey} />);
      expect(screen.getByRole('tab', { name: tabValue })).toHaveAttribute('aria-selected', 'true');
    });
  });

  describe('User with no quota', () => {
    it('should render', async () => {
      render(
        <CreateClusterPage
          hasOSDQuota={false}
          hasOSDTrialQuota={false}
          getOrganizationAndQuota={getOrganizationAndQuota}
          organization={{ ...organization, fulfilled: true }}
          token={{}}
          getAuthToken={getAuthToken}
          osdTrialFeature={false}
        />,
      );
      expect(
        await screen.findByText('Select an OpenShift cluster type to create'),
      ).toBeInTheDocument();
    });
  });

  describe('Quota not fetched yet', () => {
    it('should fetch quota', () => {
      render(
        <CreateClusterPage
          hasOSDQuota={false}
          hasOSDTrialQuota={false}
          getOrganizationAndQuota={getOrganizationAndQuota}
          organization={{ ...organization, fulfilled: false }}
          token={{}}
          activeTab=""
          getAuthToken={getAuthToken}
          osdTrialFeature={false}
        />,
      );
      expect(getOrganizationAndQuota).toHaveBeenCalled();
    });
  });
});
