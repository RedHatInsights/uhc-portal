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
    const { container } = render(<CreateClusterErrorModal />);

    // Assert
    expect(screen.getByRole('dialog', { name: 'Error creating cluster' })).toBeInTheDocument();
    await checkAccessibility(container);
  });

  it('returns no error', () => {
    // Arrange
    useSelectorSpy.mockReturnValueOnce({});
    const { container } = render(<CreateClusterErrorModal />);

    // Assert
    expect(container.firstChild).toBeNull();
  });
});
