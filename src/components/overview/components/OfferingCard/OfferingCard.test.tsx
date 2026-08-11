import React from 'react';

import docLinks from '~/common/docLinks.mjs';
import { useCanCreateManagedCluster } from '~/queries/ClusterDetailsQueries/useFetchActionsPermissions';
import { render, screen } from '~/testUtils';

import OfferingCard from './OfferingCard';

jest.mock('@scalprum/react-core', () => ({
  ...jest.requireActual('@scalprum/react-core'),
  useRemoteHook: jest.fn(() => ({ hookResult: null })),
}));

jest.mock('~/queries/ClusterDetailsQueries/useFetchActionsPermissions', () => ({
  useCanCreateManagedCluster: jest.fn(),
}));

describe('<OfferingCard />', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });
  it('Disables create cluster button if user has no permissions', async () => {
    (useCanCreateManagedCluster as jest.Mock).mockReturnValue({
      canCreateManagedCluster: false,
    });
    render(<OfferingCard offeringType="AWS" canCreateManagedCluster={false} />);
    expect(screen.getByTestId('create-cluster')).toHaveAttribute('aria-disabled', 'true');
  });
  it('Enables create cluster button if user has permissions', async () => {
    (useCanCreateManagedCluster as jest.Mock).mockReturnValue({
      canCreateManagedCluster: true,
    });
    render(<OfferingCard offeringType="AWS" canCreateManagedCluster />);
    expect(screen.getByTestId('create-cluster')).not.toHaveAttribute('aria-disabled');
  });
  it('Shows Developer Preview support level badge for MIGRATION offering', () => {
    render(<OfferingCard offeringType="MIGRATION" canCreateManagedCluster />);
    expect(screen.getByText('Developer Preview')).toBeInTheDocument();
  });
  it('Does not show support level badge for non-migration offerings', () => {
    render(<OfferingCard offeringType="AWS" canCreateManagedCluster />);
    expect(screen.queryByText('Developer Preview')).not.toBeInTheDocument();
  });
  it('Shows ROVS offering title and IBM learn more link', () => {
    render(<OfferingCard offeringType="ROVS" />);
    expect(
      screen.getByText('Red Hat OpenShift Virtualization Service on IBM Cloud'),
    ).toBeInTheDocument();
    expect(screen.getByText('Learn more on IBM')).toHaveAttribute('href', docLinks.IBM_CLOUD_ROVS);
  });
});
