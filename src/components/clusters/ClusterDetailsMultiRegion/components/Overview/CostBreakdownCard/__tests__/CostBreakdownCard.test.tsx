import React from 'react';
import * as reactRedux from 'react-redux';

import { getReport, getSources } from '~/redux/actions/costActions';
import { useGlobalState } from '~/redux/hooks';
import { checkAccessibility, render, screen } from '~/testUtils';

import CostBreakdownCard from '../CostBreakdownCard';

import { availableState, initialState } from './CostBreakdownCard.fixtures';

jest.mock('../CostBreakdownSummary', () => () => (
  <div data-testid="cost-breakdown-summary-mock">CostBreakdownSummaryMock</div>
));
jest.mock('~/components/dashboard/CostCard/CostEmptyState', () => () => (
  <div data-testid="cost-empty-stat-mock">CostEmptyStatMock</div>
));

jest.mock('~/redux/actions/costActions', () => ({
  getReport: jest.fn(),
  getSources: jest.fn(),
}));
jest.mock('~/redux/hooks', () => ({
  useGlobalState: jest.fn(),
}));

jest.mock('react-redux', () => {
  const config = {
    __esModule: true,
    ...jest.requireActual('react-redux'),
  };
  return config;
});

const getReportMock = getReport as jest.Mock;
const getSourcesMock = getSources as jest.Mock;
const useGlobalStateMock = useGlobalState as jest.Mock;

describe('<CostBreakdownCard />', () => {
  const useDispatchMock = jest.spyOn(reactRedux, 'useDispatch');
  const mockedDispatch = jest.fn();
  useDispatchMock.mockReturnValue(mockedDispatch);

  getReportMock.mockReturnValue('getReportMockResult');
  getSourcesMock.mockReturnValue('getSourcesMockResult');

  afterEach(() => {
    mockedDispatch.mockClear();
    useGlobalStateMock.mockClear();
  });

  describe('When no source providers are available', () => {
    it('is accessible with empty state', async () => {
      // Arrange
      useGlobalStateMock.mockReturnValueOnce(initialState);

      // Act
      const { container } = render(<CostBreakdownCard />);

      // Assert
      await checkAccessibility(container);
    });

    it('calls getSources and getReport on mount', () => {
      // Arrange
      useGlobalStateMock.mockReturnValueOnce(initialState);

      // Act
      render(<CostBreakdownCard />);

      // Assert
      expect(mockedDispatch).toHaveBeenCalledWith('getReportMockResult');
      expect(mockedDispatch).toHaveBeenCalledWith('getSourcesMockResult');
    });

    it('properly renders', () => {
      // Arrange
      useGlobalStateMock.mockReturnValueOnce(initialState);

      // Act
      render(<CostBreakdownCard />);

      // Assert
      screen.getByRole('heading', {
        name: /cost breakdown/i,
      });
      screen.getByText(/costemptystatmock/i);
    });
  });

  describe('When cost report is available', () => {
    it('is accessible with cluster costs', async () => {
      // Arrange
      useGlobalStateMock.mockReturnValueOnce(availableState);

      // Act
      const { container } = render(<CostBreakdownCard />);

      // Assert
      await checkAccessibility(container);
    });

    it('calls getSources and getReport on mount', () => {
      // Arrange
      expect(mockedDispatch).not.toHaveBeenCalled();
      useGlobalStateMock.mockReturnValueOnce(availableState);

      // Act
      render(<CostBreakdownCard />);

      // Assert
      expect(mockedDispatch).toHaveBeenCalledWith('getReportMockResult');
      expect(mockedDispatch).toHaveBeenCalledWith('getSourcesMockResult');
    });

    it('properly renders', () => {
      // Arrange
      useGlobalStateMock.mockReturnValueOnce(availableState);

      // Act
      render(<CostBreakdownCard />);

      // Assert
      screen.getByRole('heading', {
        name: /cost breakdown/i,
      });
      screen.getByText(/costbreakdownsummarymock/i);
    });
  });
});
