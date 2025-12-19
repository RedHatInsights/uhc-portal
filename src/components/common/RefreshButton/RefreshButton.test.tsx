import React from 'react';

import { act, checkAccessibility, render, screen } from '~/testUtils';

import RefreshButton from './RefreshButton';

// Modern fake timers don't work well with setInterval in jsdom environment
// We need to use legacy fake timers for this test file
jest.useFakeTimers({
  legacyFakeTimers: true,
});
jest.spyOn(global, 'clearInterval');
jest.spyOn(global, 'setInterval');

// Times set for refresh, change here if the corresponding var are changed within the component file
const shortTimerSeconds = 10;
const longTimerSeconds = 60;

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
    expect(onClickFunc).not.toHaveBeenCalled();

    await user.click(screen.getByRole('button'));
    expect(onClickFunc).toHaveBeenCalled();
  });

  it("doesn't call onClickFunc when autoRefresh is disabled", () => {
    render(<RefreshButton refreshFunc={onClickFunc} autoRefresh={false} />);
    act(() => {
      jest.advanceTimersByTime(longTimerSeconds * 1000);
    });
    expect(onClickFunc).not.toHaveBeenCalled();
  });

  describe('with a refreshFunc and clickRefreshFunc', () => {
    it('calls clickRefreshFunc when clicked', async () => {
      const { user } = render(
        <RefreshButton refreshFunc={refreshFunc} clickRefreshFunc={onClickFunc} />,
      );
      expect(onClickFunc).not.toHaveBeenCalled();

      await user.click(screen.getByRole('button'));
      expect(refreshFunc).not.toHaveBeenCalled();
      expect(onClickFunc).toHaveBeenCalled();
    });
  });
});

describe('<RefreshButton autoRefresh />', () => {
  let onClickFunc: jest.Mock;

  beforeEach(() => {
    onClickFunc = jest.fn();
  });

  const advanceAndExpectCalls = (ms: number, fn: jest.Mock, expectedCalls: number) => {
    act(() => {
      jest.advanceTimersByTime(ms);
    });
    expect(fn).toHaveBeenCalledTimes(expectedCalls);
  };

  afterEach(() => {
    jest.clearAllTimers();
    jest.clearAllMocks();
  });

  it('displays an enabled button', () => {
    render(<RefreshButton refreshFunc={onClickFunc} autoRefresh />);

    expect(screen.getByRole('button', { name: 'Refresh' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Refresh' })).not.toHaveAttribute('aria-disabled');
  });

  it('calls refreshFunc when clicked', async () => {
    const { user } = render(<RefreshButton refreshFunc={onClickFunc} autoRefresh />);
    expect(onClickFunc).not.toHaveBeenCalled();
    await user.click(screen.getByRole('button'));

    expect(onClickFunc).toHaveBeenCalled();
  });

  it('refreshes after a minute', () => {
    render(<RefreshButton refreshFunc={onClickFunc} autoRefresh />);
    expect(onClickFunc).not.toHaveBeenCalled();

    act(() => {
      jest.advanceTimersByTime(longTimerSeconds * 1000);
    });

    expect(onClickFunc).toHaveBeenCalled();
  });

  it('does not refresh if autoRefresh has been turned off', () => {
    render(<RefreshButton refreshFunc={onClickFunc} autoRefresh={false} />);
    expect(onClickFunc).not.toHaveBeenCalled();
    act(() => {
      jest.advanceTimersByTime(longTimerSeconds * 1000);
    });
    expect(onClickFunc).not.toHaveBeenCalled();
  });

  it('clears timer on umount', () => {
    const { unmount } = render(<RefreshButton refreshFunc={onClickFunc} autoRefresh />);
    unmount();
    expect(clearInterval).toHaveBeenCalled();
    act(() => {
      jest.runOnlyPendingTimers();
    });
    expect(onClickFunc).not.toHaveBeenCalled();
  });

  describe('Short timer', () => {
    it('refreshes on shorter cycle if useShortTimer is set', () => {
      // checking to see if we have valid data
      expect(shortTimerSeconds * 2).toBeLessThan(longTimerSeconds);
      const { unmount } = render(
        <RefreshButton refreshFunc={onClickFunc} autoRefresh useShortTimer />,
      );

      advanceAndExpectCalls(shortTimerSeconds * 1000, onClickFunc, 1);
      advanceAndExpectCalls(shortTimerSeconds * 1000, onClickFunc, 2);

      unmount();
    });

    it('refreshes on long cycle if useShortTimer is not set', () => {
      // checking to see if we have valid data
      expect(shortTimerSeconds * 2).toBeLessThan(longTimerSeconds);
      render(<RefreshButton refreshFunc={onClickFunc} autoRefresh />);
      act(() => {
        jest.advanceTimersByTime(longTimerSeconds * 1000);
      });
      expect(onClickFunc).toHaveBeenCalledTimes(1);
    });

    it('goes back to long cycle if useShortTimer is set for n attempts', () => {
      expect(onClickFunc).not.toHaveBeenCalled();

      render(<RefreshButton refreshFunc={onClickFunc} autoRefresh useShortTimer />);

      // After N short intervals, the component switches to long interval
      advanceAndExpectCalls(shortTimerSeconds * 1000, onClickFunc, 1);
      advanceAndExpectCalls(shortTimerSeconds * 1000, onClickFunc, 2);
      advanceAndExpectCalls(shortTimerSeconds * 1000, onClickFunc, 3);
      advanceAndExpectCalls(longTimerSeconds * 1000, onClickFunc, 4);
    });

    it('switches from short timer to long timer if useShortTimer is switched from true to false', () => {
      const { rerender } = render(
        <RefreshButton refreshFunc={onClickFunc} autoRefresh useShortTimer />,
      );

      advanceAndExpectCalls(shortTimerSeconds * 1000, onClickFunc, 1);

      rerender(<RefreshButton refreshFunc={onClickFunc} autoRefresh useShortTimer={false} />);

      advanceAndExpectCalls(longTimerSeconds * 1000, onClickFunc, 2);
    });
  });
});
