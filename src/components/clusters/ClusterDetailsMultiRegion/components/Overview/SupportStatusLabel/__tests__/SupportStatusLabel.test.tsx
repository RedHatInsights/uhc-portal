import React from 'react';
import * as reactRedux from 'react-redux';

import { getSupportStatus } from '~/redux/actions/supportStatusActions';
import { useGlobalState } from '~/redux/hooks';
import { SupportStatusState } from '~/redux/reducers/supportStatusReducer';
import { checkAccessibility, render, screen } from '~/testUtils';

import SupportStatusLabel from '../SupportStatusLabel';

jest.mock('~/redux/hooks', () => ({
  useGlobalState: jest.fn(),
}));

jest.mock('~/redux/actions/supportStatusActions', () => ({
  getSupportStatus: jest.fn(),
}));

jest.mock('react-redux', () => {
  const config = {
    __esModule: true,
    ...jest.requireActual('react-redux'),
  };
  return config;
});

const useGlobalStateMock = useGlobalState as jest.Mock;
const getSupportStatusMock = getSupportStatus as jest.Mock;

const supportStatuses = {
  4.5: 'Full Support',
  4.4: 'Maintenance Support',
  4.3: 'Extended Update Support',
  4.2: 'End Of Life',
  4.1: 'some other status',
};

describe('<SupportStatusLabel />', () => {
  const useDispatchMock = jest.spyOn(reactRedux, 'useDispatch');
  const mockedDispatch = jest.fn();
  useDispatchMock.mockReturnValue(mockedDispatch);

  const defaultState: SupportStatusState = {
    pending: false,
    fulfilled: false,
    error: false,
    supportStatus: {},
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('is accessible. Emtpy supportStatus', async () => {
    // Arrange
    const { container } = render(<SupportStatusLabel clusterVersion="4.5" />);

    // Assert
    await checkAccessibility(container);
  });

  it('should fetch status on initial mount', () => {
    // Arrange
    expect(getSupportStatusMock).not.toHaveBeenCalled();

    // Act
    render(<SupportStatusLabel clusterVersion="4.5" />);

    // Assert
    expect(getSupportStatusMock).toHaveBeenCalled();
  });

  it('should render skeleton when pending', () => {
    // Arrange
    useGlobalStateMock.mockReturnValue({ ...defaultState, pending: true });

    // Act
    const { container } = render(<SupportStatusLabel clusterVersion="4.5" />);

    // Assert
    expect(container.querySelector('.inline-skeleton')).toBeInTheDocument();
  });

  it('should show N/A when support status is unknown', () => {
    // Arrange
    useGlobalStateMock.mockReturnValue({ ...defaultState, fulfilled: true });

    // Act
    render(<SupportStatusLabel clusterVersion="4.5" />);

    // Assert
    expect(screen.getByText('N/A')).toBeInTheDocument();
  });

  it('should show N/A for a pre-release version', () => {
    // Act
    render(<SupportStatusLabel clusterVersion="4.5.0-0.nightly-2020-07-14-052310" />);

    // Assert
    expect(screen.getByText('N/A')).toBeInTheDocument();
  });

  describe('should render for every possible support status', () => {
    beforeEach(() => {
      jest.clearAllMocks();
      useGlobalStateMock.mockReturnValue({
        ...defaultState,
        fulfilled: true,
        supportStatus: supportStatuses,
      });
    });

    it('renders for Full Support', () => {
      // Act
      render(<SupportStatusLabel clusterVersion="4.5" />);

      // Assert
      expect(screen.getByText('Full support')).toHaveClass('pf-v6-c-label__text');
    });

    it('renders for Maintenance Support', () => {
      // Act
      render(<SupportStatusLabel clusterVersion="4.4" />);

      // Assert
      expect(screen.getByText('Maintenance support')).toHaveClass('pf-v6-c-label__text');
    });

    it('renders for Extended Update Support', () => {
      // Act
      render(<SupportStatusLabel clusterVersion="4.3" />);

      // Assert
      expect(screen.getByText('Extended update support')).toHaveClass('pf-v6-c-label__text');
    });

    it('renders for End of Life', () => {
      // Act
      render(<SupportStatusLabel clusterVersion="4.2" />);

      // Assert
      expect(screen.getByText('End of life')).toHaveClass('pf-v6-c-label__text');
    });

    it('renders for an unrecognized status', () => {
      // Act
      render(<SupportStatusLabel clusterVersion="4.1" />);

      // Assert
      expect(screen.getByText('some other status')).toHaveClass('pf-v6-c-label__text');
    });
  });
});
