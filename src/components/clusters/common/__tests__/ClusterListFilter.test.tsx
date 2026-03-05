import React from 'react';
import { useDispatch } from 'react-redux';

import { onListFilterSet } from '~/redux/actions/viewOptionsActions';
import { fireEvent, screen, withState } from '~/testUtils';

import ClusterListFilter from '../ClusterListFilter';

jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useDispatch: jest.fn(),
}));
jest.mock('~/redux/actions/viewOptionsActions');

jest.useFakeTimers({
  legacyFakeTimers: true, // TODO 'modern'
});

const dispatchMock = jest.fn();

describe('<ClusterListFilter />', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useDispatch as any as jest.Mock).mockReturnValue(dispatchMock);
  });

  it('renders conrrectly without current filter', () => {
    // Arrange
    const currentState = { viewOptions: { viewx: { filter: undefined } } };

    // Act
    withState(currentState).render(<ClusterListFilter view="viewx" />);

    // Assert
    expect(screen.getByTestId('filterInputClusterList')).toBeInTheDocument();
    expect(screen.getByTestId('filterInputClusterList').getAttribute('value')).toEqual('');
  });

  it('renders conrrectly with current filter', () => {
    // Arrange
    const currentState = { viewOptions: { viewx: { filter: 'currentFilter' } } };

    // Act
    withState(currentState).render(<ClusterListFilter view="viewx" />);

    // Assert
    expect(screen.getByTestId('filterInputClusterList')).toBeInTheDocument();
    expect(screen.getByTestId('filterInputClusterList').getAttribute('value')).toEqual(
      'currentFilter',
    );
  });

  it('renders conrrectly isDisabled false', () => {
    // Arrange
    const currentState = { viewOptions: { viewx: { filter: undefined } } };

    // Act
    withState(currentState).render(<ClusterListFilter view="viewx" />);

    // Assert
    expect(screen.getByTestId('filterInputClusterList')).toBeInTheDocument();
    expect(screen.getByTestId('filterInputClusterList').getAttribute('disabled')).toEqual(null);
  });

  it('renders conrrectly isDisabled true', () => {
    // Arrange
    const currentState = { viewOptions: { viewx: { filter: undefined } } };

    // Act
    withState(currentState).render(<ClusterListFilter view="viewx" isDisabled />);

    // Assert
    expect(screen.getByTestId('filterInputClusterList')).toBeInTheDocument();
    expect(screen.getByTestId('filterInputClusterList').getAttribute('disabled')).toEqual('');
  });

  it('sets up a timeout properly', async () => {
    // Arrange
    const currentState = { viewOptions: { viewx: { filter: undefined } } };

    // Act
    withState(currentState).render(<ClusterListFilter view="viewx" />);

    // Act
    // eslint-disable-next-line testing-library/prefer-user-event
    fireEvent.change(screen.getByTestId('filterInputClusterList'), { target: { value: 'hello' } });

    // Assert
    expect(setTimeout).toHaveBeenCalled();
    expect(setTimeout).toHaveBeenLastCalledWith(expect.any(Function), 300);
  });

  it('calls setFilter after timeout has passed', () => {
    // Arrange
    (onListFilterSet as jest.Mock).mockReturnValue({ type: 'VIEW_SET_LIST_FILTER' });
    const currentState = { viewOptions: { viewX: { filter: undefined } } };

    // Act
    withState(currentState).render(<ClusterListFilter view="viewX" />);

    // Act
    // eslint-disable-next-line testing-library/prefer-user-event
    fireEvent.change(screen.getByTestId('filterInputClusterList'), { target: { value: 'world' } });
    jest.runOnlyPendingTimers();

    // Assert
    expect(onListFilterSet).toHaveBeenCalledWith('world', 'viewX');
    expect(dispatchMock).toHaveBeenCalledWith({ type: 'VIEW_SET_LIST_FILTER' });
  });

  it('calls setFilter only when the user stops typing', () => {
    // Arrange
    const currentState = { viewOptions: { viewY: { filter: undefined } } };

    // Act
    withState(currentState).render(<ClusterListFilter view="viewY" />);

    // Act
    // eslint-disable-next-line testing-library/prefer-user-event
    fireEvent.change(screen.getByTestId('filterInputClusterList'), { target: { value: 'a' } });
    // eslint-disable-next-line testing-library/prefer-user-event
    fireEvent.change(screen.getByTestId('filterInputClusterList'), { target: { value: 'abc' } });
    jest.runOnlyPendingTimers();

    // Assert
    expect(dispatchMock).toHaveBeenCalledTimes(1);
    expect(onListFilterSet).not.toHaveBeenCalledWith('a', expect.any(String));
    expect(onListFilterSet).toHaveBeenCalledWith('abc', 'viewY');
  });
});
