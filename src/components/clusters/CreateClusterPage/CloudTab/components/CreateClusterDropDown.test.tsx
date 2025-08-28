import React from 'react';
import { createMemoryHistory } from 'history';
import { Router } from 'react-router-dom';

import { checkAccessibility, render, screen } from '~/testUtils';

import CreateClusterDropDown from './CreateClusterDropDown';

const getStartedPath = '/openshift/create/rosa/getstarted';
const rosaWizardPath = '/openshift/create/rosa/wizard';

describe('<CreateClusterDropDown />', () => {
  afterAll(() => {
    jest.resetAllMocks();
  });

  it('is accessible', async () => {
    // Arrange
    const { container } = render(<CreateClusterDropDown isDisabled={false} />);

    // Assert
    await checkAccessibility(container);
  });

  it('is accessible expanded', async () => {
    // Arrange
    const { container, user } = render(<CreateClusterDropDown isDisabled={false} />);

    // Act
    await user.click(screen.getByRole('button', { name: 'Create cluster' }));
    expect(screen.getByText(/With CLI/)).toBeInTheDocument();

    // Assert
    await checkAccessibility(container);
  });

  it('disables the create cluster button when user has no permissions', async () => {
    render(<CreateClusterDropDown isDisabled />);
    expect(screen.getByRole('button', { name: 'Create cluster' })).toHaveAttribute('disabled');
  });

  it('enables the create cluster button when user has permissions', async () => {
    render(<CreateClusterDropDown isDisabled={false} />);
    expect(screen.getByRole('button', { name: 'Create cluster' })).not.toHaveAttribute('disabled');
  });

  it('With CLI option goes to getting started page', async () => {
    // Arrange
    const history = createMemoryHistory();
    const { user } = render(
      <Router location={history.location} navigator={history}>
        <CreateClusterDropDown isDisabled={false} />
      </Router>,
      { withRouter: false }, // set to false so we can wrap with router to check routing
    );

    // Act
    await user.click(screen.getByRole('button', { name: 'Create cluster' }));
    await user.click(screen.getByText(/With CLI/));

    // Assert
    expect(history.location.pathname).toBe(getStartedPath);
  });

  it('With web interface option goes to ROSA Wizard', async () => {
    // Arrange
    const history = createMemoryHistory();

    const { user } = render(
      // @ts-ignore
      <Router location={history.location} navigator={history}>
        <CreateClusterDropDown isDisabled={false} />
      </Router>,
      { withRouter: false },
    );

    // Act
    await user.click(screen.getByRole('button', { name: 'Create cluster' }));
    await user.click(screen.getByText(/With web interface/));

    // Assert
    expect(history.location.pathname).toBe(rosaWizardPath);
  });

  it('Prerequisites link goes to getting started page', async () => {
    // Arrange
    const history = createMemoryHistory();
    const { user } = render(
      <Router location={history.location} navigator={history}>
        <CreateClusterDropDown isDisabled={false} />
      </Router>,
      { withRouter: false }, // set to false so we can wrap with router to check routing
    );

    // Act
    await user.click(screen.getByRole('link', { name: 'Prerequisites' }));

    // Assert
    expect(history.location.pathname).toBe(getStartedPath);
  });
});
