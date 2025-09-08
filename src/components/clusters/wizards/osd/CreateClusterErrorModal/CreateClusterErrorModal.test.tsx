import React from 'react';
import * as ReactRedux from 'react-redux';

import { checkAccessibility, render, screen } from '~/testUtils';

import CreateClusterErrorModal from './CreateClusterErrorModal';

jest.mock('react-redux', () => {
  const config = {
    __esModule: true,
    ...jest.requireActual('react-redux'),
  };
  return config;
});

describe('<CreateClusterErrorModal />', () => {
  const useSelectorSpy = jest.spyOn(ReactRedux, 'useSelector');

  it('shows default error modal with missing errorDetails and is accessible ', async () => {
    // Arrange
    useSelectorSpy.mockReturnValueOnce({
      error: true,
      errorDetails: null,
      errorMessage: '',
      fulfilled: false,
      pending: false,
    });
    const { container } = render(<CreateClusterErrorModal onRetry={jest.fn()} />);

    // Assert
    expect(screen.getByRole('dialog', { name: 'Error creating cluster' })).toBeInTheDocument();
    await checkAccessibility(container);
  });

  it('shows missing prereq error modal when errorDetails contains the corresponding key and is accessible', async () => {
    // Arrange
    useSelectorSpy.mockReturnValueOnce({
      error: true,
      errorDetails: [{ Error_Key: 'AWSCredsNotOSDCCSAdmin' }],
      errorMessage: '',
      fulfilled: false,
      pending: false,
    });
    const { container } = render(<CreateClusterErrorModal onRetry={jest.fn()} />);

    // Assert
    expect(screen.getByRole('dialog', { name: 'Missing prerequisite' })).toBeInTheDocument();
    await checkAccessibility(container);
  });

  it('returns no error', () => {
    // Arrange
    useSelectorSpy.mockReturnValueOnce({});
    const { container } = render(<CreateClusterErrorModal onRetry={jest.fn()} />);

    // Assert
    expect(container.firstChild).toBeNull();
  });
});
