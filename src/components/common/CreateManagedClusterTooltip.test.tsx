import React from 'react';

import { Button } from '@patternfly/react-core';
import { UserEvent } from '@testing-library/user-event';

import { checkAccessibility, render, screen, waitFor } from '~/testUtils';

import { CreateManagedClusterButtonWithTooltip } from './CreateManagedClusterTooltip';

// Mock the hook
jest.mock('~/queries/ClusterDetailsQueries/useFetchActionsPermissions', () => ({
  useCanCreateManagedCluster: jest.fn(),
}));

const mockUseCanCreateManagedCluster = jest.requireMock(
  '~/queries/ClusterDetailsQueries/useFetchActionsPermissions',
).useCanCreateManagedCluster;

const testForTooltip = async (user: UserEvent) => {
  await user.hover(screen.getByRole('button'));
  await waitFor(() => {
    expect(screen.getByRole('tooltip')).toBeVisible();
  });
  expect(screen.getByRole('tooltip')).toHaveTextContent(
    'You do not have permission to create a managed cluster.',
  );
};

describe('<CreateManagedClusterButtonWithTooltip>', () => {
  beforeEach(() => {
    mockUseCanCreateManagedCluster.mockReturnValue({
      canCreateManagedCluster: true,
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly when user has permission and using child component', () => {
    render(
      <CreateManagedClusterButtonWithTooltip>
        <button type="button">Create cluster</button>
      </CreateManagedClusterButtonWithTooltip>,
    );

    expect(screen.getByRole('button', { name: 'Create cluster' })).toBeInTheDocument();
  });

  it('renders correctly when user has permission and using childComponent prop', () => {
    render(
      <CreateManagedClusterButtonWithTooltip childComponent={Button}>
        Create cluster
      </CreateManagedClusterButtonWithTooltip>,
    );

    expect(screen.getByRole('button', { name: 'Create cluster' })).toBeInTheDocument();
  });

  it('shows tooltip when user lacks permission to create managed cluster', async () => {
    mockUseCanCreateManagedCluster.mockReturnValue({
      canCreateManagedCluster: false,
    });

    const { container, user } = render(
      <CreateManagedClusterButtonWithTooltip>
        <button type="button">Create cluster</button>
      </CreateManagedClusterButtonWithTooltip>,
    );

    await testForTooltip(user);
    await checkAccessibility(container);
  });

  it('shows tooltip when component is aria-disabled', async () => {
    const { container, user } = render(
      <CreateManagedClusterButtonWithTooltip isAriaDisabled childComponent={Button}>
        Create cluster
      </CreateManagedClusterButtonWithTooltip>,
    );

    await testForTooltip(user);
    await checkAccessibility(container);
    expect(screen.getByRole('button')).toHaveAttribute('aria-disabled', 'true');
  });

  it('shows tooltip when component is disabled', async () => {
    const { container, user } = render(
      <CreateManagedClusterButtonWithTooltip isDisabled>
        <button type="button">Create cluster</button>
      </CreateManagedClusterButtonWithTooltip>,
    );

    await testForTooltip(user);
    await checkAccessibility(container);
  });

  it('shows tooltip when component is read-only', async () => {
    const { user } = render(
      <CreateManagedClusterButtonWithTooltip isReadOnly>
        <button type="button">Create cluster</button>
      </CreateManagedClusterButtonWithTooltip>,
    );

    await testForTooltip(user);
  });

  it('shows tooltip when component has disabled prop', async () => {
    const { user } = render(
      <CreateManagedClusterButtonWithTooltip disabled>
        <button type="button">Create cluster</button>
      </CreateManagedClusterButtonWithTooltip>,
    );

    await testForTooltip(user);
  });

  it('does not show tooltip when user has permission and component is not disabled', async () => {
    const { user } = render(
      <CreateManagedClusterButtonWithTooltip>
        <button type="button">Create cluster</button>
      </CreateManagedClusterButtonWithTooltip>,
    );

    await user.hover(screen.getByRole('button'));

    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
  });

  it('wraps content in a div when wrap prop is true', async () => {
    render(
      <CreateManagedClusterButtonWithTooltip wrap>
        <button type="button">Create cluster</button>
      </CreateManagedClusterButtonWithTooltip>,
    );

    expect(screen.getByTestId('create-cluster-tooltip-wrapper')).toBeInTheDocument();
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('wraps content in a div when wrap prop is true and tooltip is shown', async () => {
    mockUseCanCreateManagedCluster.mockReturnValue({
      canCreateManagedCluster: false,
    });

    const { user } = render(
      <CreateManagedClusterButtonWithTooltip wrap>
        <button type="button">Create cluster</button>
      </CreateManagedClusterButtonWithTooltip>,
    );

    expect(screen.getByTestId('create-cluster-tooltip-wrapper')).toBeInTheDocument();

    await testForTooltip(user);
  });

  it('returns null when no children content is provided', () => {
    const { container } = render(
      <CreateManagedClusterButtonWithTooltip>{undefined}</CreateManagedClusterButtonWithTooltip>,
    );

    expect(container).toBeEmptyDOMElement();
  });

  it('passes through additional props to child component', () => {
    const CustomButton = ({ children, className, ...props }: any) => (
      <button type="button" className={className} {...props}>
        {children}
      </button>
    );

    render(
      <CreateManagedClusterButtonWithTooltip
        childComponent={CustomButton}
        className="test-class"
        data-testid="test-button"
      >
        Create cluster
      </CreateManagedClusterButtonWithTooltip>,
    );

    const button = screen.getByRole('button');
    expect(button).toHaveClass('test-class');
    expect(button).toHaveAttribute('data-testid', 'test-button');
  });
});
