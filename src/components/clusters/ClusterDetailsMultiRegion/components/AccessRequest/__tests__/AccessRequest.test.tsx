import React from 'react';

import { TABBED_CLUSTERS } from '~/queries/featureGates/featureConstants';
import { checkAccessibility, mockUseFeatureGate, render, screen } from '~/testUtils';

import { AccessRequest } from '../AccessRequest';

jest.mock('~/components/CLILoginPage/useOrganization', () => ({
  __esModule: true,
  default: () => ({ organization: { id: 'test-org-id' } }),
}));
jest.mock('~/components/common/Modal/ConnectedModal', () => () => <div>connected modal</div>);
jest.mock('../components/AccessRequestTable', () => () => <div>access request table</div>);
jest.mock('../components/AccessRequestTablePagination', () => () => (
  <div>access request table pagination</div>
));

describe('AccessRequest', () => {
  it('is accessible empty content with card variant', async () => {
    // Arrange
    mockUseFeatureGate([[TABBED_CLUSTERS, false]]);

    // Act
    const { container } = render(<AccessRequest showClusterName={false} />);

    // Assert
    await checkAccessibility(container);
  });

  it('properly renders card variant', () => {
    // Arrange
    mockUseFeatureGate([[TABBED_CLUSTERS, false]]);

    // Act
    render(<AccessRequest subscriptionId="sub-123" showClusterName={false} />);

    // Assert
    expect(screen.queryAllByText(/access request table pagination/i)).toHaveLength(2);
    expect(screen.getByText(/^access request table$/i)).toBeInTheDocument();
    expect(screen.getByText(/connected modal/i)).toBeInTheDocument();
    expect(
      screen.getByText(/access requests to customer data on red hat openshift/i),
    ).toBeInTheDocument();
  });

  it('properly renders with tabbed clusters enabled', () => {
    // Arrange
    mockUseFeatureGate([[TABBED_CLUSTERS, true]]);

    // Act
    render(<AccessRequest showClusterName />);

    // Assert
    expect(screen.queryAllByText(/access request table pagination/i)).toHaveLength(2);
    expect(screen.getByText(/^access request table$/i)).toBeInTheDocument();
    expect(screen.getByText(/connected modal/i)).toBeInTheDocument();
    expect(screen.getByText(/cluster access requests/i)).toBeInTheDocument();
  });
});
