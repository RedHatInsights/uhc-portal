import React from 'react';

import { act, checkAccessibility, render, screen, waitFor } from '~/testUtils';

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
    act(() => {
      jest.runOnlyPendingTimers();
    });
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

  it("doesn't call onClickFunc when autoRefresh is disabled", async () => {
    render(<RefreshButton refreshFunc={onClickFunc} autoRefresh={false} />);
    act(() => {
      jest.advanceTimersByTime(longTimerSeconds * 1000);
    });
    await waitFor(() => {
      expect(onClickFunc).not.toHaveBeenCalled();
    });
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
    expect(onClickFunc).not.toHaveBeenCalled();
    await user.click(screen.getByRole('button'));

    expect(onClickFunc).toHaveBeenCalled();
  });

  it('refreshes after a minute', async () => {
    render(<RefreshButton refreshFunc={onClickFunc} autoRefresh />);
    expect(onClickFunc).not.toHaveBeenCalled();
    act(() => {
      jest.advanceTimersByTime(longTimerSeconds * 1000);
    });
    await waitFor(() => {
      expect(onClickFunc).toHaveBeenCalled();
    });
  });

  it('does not refresh if autoRefresh has been turned off', async () => {
    render(<RefreshButton refreshFunc={onClickFunc} autoRefresh={false} />);
    expect(onClickFunc).not.toHaveBeenCalled();
    act(() => {
      jest.advanceTimersByTime(longTimerSeconds * 1000);
    });
    await waitFor(() => {
      expect(onClickFunc).not.toHaveBeenCalled();
    });
  });

  it('clears timer on umount', async () => {
    const { unmount } = render(<RefreshButton refreshFunc={onClickFunc} autoRefresh />);
    unmount();
    expect(clearInterval).toHaveBeenCalled();
    act(() => {
      jest.runOnlyPendingTimers();
    });
    await waitFor(() => {
      expect(onClickFunc).not.toHaveBeenCalled();
    });
  });

  describe('Short timer', () => {
    it('refreshes on shorter cycle if useShortTimer is set', async () => {
      // checking to see if we have valid data
      expect(shortTimerSeconds * 2).toBeLessThan(longTimerSeconds);
      const { unmount } = render(
        <RefreshButton refreshFunc={onClickFunc} autoRefresh useShortTimer />,
      );

      act(() => {
        jest.advanceTimersByTime(shortTimerSeconds * 1000);
      });
      await waitFor(() => {
        expect(onClickFunc).toHaveBeenCalledTimes(1);
      });

      act(() => {
        jest.advanceTimersByTime(shortTimerSeconds * 1000);
      });
      await waitFor(() => {
        expect(onClickFunc).toHaveBeenCalledTimes(2);
      });

      unmount();
    });

    it('refreshes on long cycle if useShortTimer is not set', async () => {
      // checking to see if we have valid data
      expect(shortTimerSeconds * 2).toBeLessThan(longTimerSeconds);
      render(<RefreshButton refreshFunc={onClickFunc} autoRefresh />);
      act(() => {
        jest.advanceTimersByTime(longTimerSeconds * 1000);
      });
      await waitFor(() => {
        expect(onClickFunc).toHaveBeenCalledTimes(1);
      });
    });

    it('goes back to long cycle if useShortTimer is set for n attempts', async () => {
      expect(onClickFunc).not.toHaveBeenCalled();

      render(<RefreshButton refreshFunc={onClickFunc} autoRefresh useShortTimer />);

      // The component logic:
      // - Starts with shortTimerSeconds (10s) interval, shortTimerTries = 0
      // - After 1st tick: shortTimerTries: 0 -> 1, refreshFunc called
      // - After 2nd tick: shortTimerTries: 1 -> 2, refreshFunc called
      // - After 3rd tick: shortTimerTries: 2, switches to longTimerSeconds (60s), refreshFunc called
      // - After 4th tick: uses long timer, refreshFunc called
      // Total: 4 calls

      // With legacy fake timers, jest.advanceTimersByTime() executes all timers scheduled within that time.
      // We use act() to wrap timer advances and waitFor() to wait for state updates to complete.

      // First short cycle (10s) - shortTimerTries: 0 -> 1
      act(() => {
        jest.advanceTimersByTime(shortTimerSeconds * 1000);
      });
      await waitFor(() => {
        expect(onClickFunc).toHaveBeenCalledTimes(1);
      });

      // Second short cycle (10s) - shortTimerTries: 1 -> 2
      act(() => {
        jest.advanceTimersByTime(shortTimerSeconds * 1000);
      });
      await waitFor(() => {
        expect(onClickFunc).toHaveBeenCalledTimes(2);
      });

      // Third short cycle (10s) - shortTimerTries: 2, switches to long timer
      act(() => {
        jest.advanceTimersByTime(shortTimerSeconds * 1000);
      });
      await waitFor(() => {
        expect(onClickFunc).toHaveBeenCalledTimes(3);
      });

      // Long cycle (60s) - should use long timer now
      act(() => {
        jest.advanceTimersByTime(longTimerSeconds * 1000);
      });
      await waitFor(() => {
        expect(onClickFunc).toHaveBeenCalledTimes(4);
      });
    });

    it('switches from short timer to long timer if useShortTimer is switched from true to false', async () => {
      const { rerender } = render(
        <RefreshButton refreshFunc={onClickFunc} autoRefresh useShortTimer />,
      );

      act(() => {
        jest.advanceTimersByTime(shortTimerSeconds * 1000);
      });
      await waitFor(() => {
        expect(onClickFunc).toHaveBeenCalledTimes(1);
      });

      rerender(<RefreshButton refreshFunc={onClickFunc} autoRefresh useShortTimer={false} />);

      act(() => {
        jest.advanceTimersByTime(longTimerSeconds * 1000);
      });
      await waitFor(() => {
        expect(onClickFunc).toHaveBeenCalledTimes(2);
      });
    });
  });
});
