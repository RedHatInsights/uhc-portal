import React from 'react';

import { act, checkAccessibility, render, screen } from '~/testUtils';

import RefreshButton from './RefreshButton';

jest.useFakeTimers({
  legacyFakeTimers: true, // TODO 'modern'
});
jest.spyOn(global, 'clearInterval');
jest.spyOn(global, 'setInterval');

// Times set for refresh, change here if the corresponding var are changed within the component file
const shortTimerSeconds = 10;
const longTimerSeconds = 60;
const numberOfShortTries = 3;

describe('<RefreshButton />', () => {
  const onClickFunc = jest.fn();
  const refreshFunc = jest.fn();

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('is accessible', async () => {
    // Use real timers for accessibility testing since axe-core requires real timers
    jest.useRealTimers();
    // Disable autoRefresh to prevent interval from running during accessibility check
    const { container } = render(<RefreshButton refreshFunc={onClickFunc} autoRefresh={false} />);
    await checkAccessibility(container);
    // Restore fake timers for other tests
    jest.useFakeTimers({
      legacyFakeTimers: true,
    });
  });

  it('displays an active refresh button', () => {
    render(<RefreshButton refreshFunc={onClickFunc} />);

    expect(screen.getByRole('button', { name: 'Refresh' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Refresh' })).not.toHaveAttribute('aria-disabled');
  });

  it('calls refreshFunc when clicked', async () => {
    const { user } = render(<RefreshButton refreshFunc={onClickFunc} />);
    expect(onClickFunc).not.toBeCalled();

    await user.click(screen.getByRole('button'));
    expect(onClickFunc).toBeCalled();
  });

  it("doesn't call onClickFunc when autoRefresh is disabled", () => {
    render(<RefreshButton refreshFunc={onClickFunc} autoRefresh={false} />);
    jest.advanceTimersByTime(longTimerSeconds * 1000);
    expect(onClickFunc).not.toBeCalled();
  });

  describe('with a refreshFunc and clickRefreshFunc', () => {
    it('calls clickRefreshFunc when clicked', async () => {
      const { user } = render(
        <RefreshButton refreshFunc={refreshFunc} clickRefreshFunc={onClickFunc} />,
      );
      expect(onClickFunc).not.toBeCalled();

      await user.click(screen.getByRole('button'));
      expect(refreshFunc).not.toBeCalled();
      expect(onClickFunc).toBeCalled();
    });
  });
});

describe('<RefreshButton autoRefresh />', () => {
  const onClickFunc = jest.fn();
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('displays an enabled button', () => {
    render(<RefreshButton refreshFunc={onClickFunc} autoRefresh />);

    expect(screen.getByRole('button', { name: 'Refresh' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Refresh' })).not.toHaveAttribute('aria-disabled');
  });

  it('calls refreshFunc when clicked', async () => {
    const { user } = render(<RefreshButton refreshFunc={onClickFunc} autoRefresh />);
    expect(onClickFunc).not.toBeCalled();
    await user.click(screen.getByRole('button'));

    expect(onClickFunc).toBeCalled();
  });

  it('refreshes after a minute', () => {
    render(<RefreshButton refreshFunc={onClickFunc} autoRefresh />);
    expect(onClickFunc).not.toBeCalled();
    jest.advanceTimersByTime(longTimerSeconds * 1000);
    expect(onClickFunc).toBeCalled();
  });

  it('does not refresh if autoRefresh has been turned off', () => {
    render(<RefreshButton refreshFunc={onClickFunc} autoRefresh={false} />);
    expect(onClickFunc).not.toBeCalled();
    jest.advanceTimersByTime(longTimerSeconds * 1000);
    expect(onClickFunc).not.toBeCalled();
  });

  it('clears timer on umount', () => {
    const { unmount } = render(<RefreshButton refreshFunc={onClickFunc} autoRefresh />);
    unmount();
    expect(clearInterval).toBeCalled();
    jest.runOnlyPendingTimers();
    expect(onClickFunc).not.toBeCalled();
  });

  describe('Short timer', () => {
    it('refreshes on shorter cycle if useShortTimer is set', () => {
      // checking to see if we have valid data
      expect(shortTimerSeconds * 2).toBeLessThan(longTimerSeconds);
      render(<RefreshButton refreshFunc={onClickFunc} autoRefresh useShortTimer />);

      // act is required because there are state changes (without UI changes) as timer advances
      act(() => {
        jest.advanceTimersByTime(shortTimerSeconds * 2 * 1000);
        expect(onClickFunc).toBeCalledTimes(2);
      });
    });

    it('refreshes on long cycle if useShortTimer is not set', () => {
      // checking to see if we have valid data
      expect(shortTimerSeconds * 2).toBeLessThan(longTimerSeconds);
      render(<RefreshButton refreshFunc={onClickFunc} autoRefresh />);
      jest.advanceTimersByTime(longTimerSeconds * 1000);
      expect(onClickFunc).toBeCalledTimes(1);
    });

    it.skip('goes back to long cycle if useShortTimer is set for n attempts', () => {
      // Time for n short cycles and 1 long cycle
      const expectedTime = (shortTimerSeconds * numberOfShortTries + longTimerSeconds) * 1000;
      expect(onClickFunc).not.toBeCalled();

      render(<RefreshButton refreshFunc={onClickFunc} autoRefresh useShortTimer />);

      // act is required because there are state changes (without UI changes) as timer advances
      act(() => {
        jest.advanceTimersByTime(expectedTime);
        // This fails because the testing setup doesn't allow the state to change
        // So the app doesn't know to switch to the long timer
        expect(onClickFunc).toBeCalledTimes(numberOfShortTries + 1);
      });
    });

    it('switches from short timer to long timer if useShortTimer is switched from true to false', () => {
      const { rerender } = render(
        <RefreshButton refreshFunc={onClickFunc} autoRefresh useShortTimer />,
      );

      // act is required because there are state changes (without UI changes) as timer advances
      act(() => {
        jest.advanceTimersByTime(shortTimerSeconds * 1000);
      });

      rerender(<RefreshButton refreshFunc={onClickFunc} autoRefresh useShortTimer={false} />);

      jest.advanceTimersByTime(longTimerSeconds * 1000);
      expect(onClickFunc).toBeCalledTimes(2);
    });
  });
});
