import React from 'react';
import * as reactRedux from 'react-redux';

import docLinks from '~/common/docLinks.mjs';
import { useGlobalState } from '~/redux/hooks';
import { render, screen } from '~/testUtils';

import AddGrantModal from './AddGrantModal';

jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useDispatch: jest.fn(),
}));

jest.mock('~/redux/hooks', () => ({
  useGlobalState: jest.fn(),
}));

describe('<AddGrantModal />', () => {
  const useDispatchMock = jest.spyOn(reactRedux, 'useDispatch');
  const useGlobalStateMock = useGlobalState;

  const defaultProps = {
    addGrantsMutate: jest.fn(),
    roles: [
      {
        id: 'network-mgmt',
        displayName: 'Network Management',
        description: 'Manage network resources',
      },
    ],
    isAddGrantsPending: false,
    isAddGrantsError: false,
    addGrantsError: null,
    resetAddGrantsMutate: jest.fn(),
  };

  beforeEach(() => {
    useDispatchMock.mockReturnValue(jest.fn());
    useGlobalStateMock.mockReturnValue(true);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders the AWS ARN documentation link in the help popover', async () => {
    const { user } = render(<AddGrantModal {...defaultProps} />);

    await user.click(screen.getByRole('button', { name: 'More information' }));

    const link = screen.getByRole('link', { name: 'Check the AWS documentation.' });
    expect(link).toHaveAttribute('href', docLinks.AWS_ARN_CONFIG);
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noreferrer noopener');
  });
});
