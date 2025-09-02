import React from 'react';

import { checkAccessibility, render, screen } from '~/testUtils';

import clusterStates from '../../../../../common/clusterStates';
import fixtures from '../../../../__tests__/ClusterDetails.fixtures';
import InstallationLogView from '../InstallationLogView';

jest.useFakeTimers({
  legacyFakeTimers: true, // TODO 'modern'
});

const clearLogs = jest.fn();
const getLogs = jest.fn();
const refresh = jest.fn();

const { clusterDetails } = fixtures;
const defaultProps = {
  cluster: clusterDetails.cluster,
  clearLogs,
  getLogs,
  refresh,
  logType: 'install',
  lines: 'lorem ipsum',
  len: 1,
  pending: false,
};

describe('<InstallationLogView />', () => {
  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.clearAllMocks();
  });

  // Skipping because it fails with Async callback was not invoked within the 5000 ms timeout specified by jest.setTimeout.
  // for unknown reason
  it.skip('is accessible with logs', async () => {
    const { container } = render(<InstallationLogView {...defaultProps} />);
    jest.runOnlyPendingTimers();
    await checkAccessibility(container);
  });

  it('should fetch logs on mount', () => {
    expect(getLogs).toHaveBeenCalledTimes(0);
    // offset=1 because we have one line on mount in this test
    render(<InstallationLogView {...defaultProps} />);
    expect(getLogs).toHaveBeenCalledWith(clusterDetails.cluster.id, 1, 'install', undefined);
  });

  it('should fetch logs using a timer', () => {
    expect(getLogs).toHaveBeenCalledTimes(0);
    render(<InstallationLogView {...defaultProps} />);

    expect(getLogs).toHaveBeenCalledTimes(1);
    jest.runOnlyPendingTimers();
    expect(getLogs).toHaveBeenCalledTimes(2); // one call on mount, second on timer
    expect(getLogs).toHaveBeenLastCalledWith(clusterDetails.cluster.id, 1, 'install', undefined);
  });

  it('should fetch logs with offset using a timer', () => {
    const { rerender } = render(<InstallationLogView {...defaultProps} />);
    expect(getLogs).toHaveBeenCalledWith(clusterDetails.cluster.id, 1, 'install', undefined);
    jest.runOnlyPendingTimers();
    rerender(<InstallationLogView {...defaultProps} lines="hello\nworld" len={2} />);
    jest.runOnlyPendingTimers();
    expect(getLogs).toHaveBeenLastCalledWith(clusterDetails.cluster.id, 2, 'install', undefined);
  });

  it('should not fetch logs when pending', () => {
    const { rerender } = render(<InstallationLogView {...defaultProps} />);
    expect(getLogs).toHaveBeenCalledTimes(1);
    jest.clearAllMocks();
    rerender(<InstallationLogView {...defaultProps} pending />);
    jest.runOnlyPendingTimers();
    expect(getLogs).toHaveBeenCalledTimes(1);
  });

  it('should clear logs and reset timer on unmount', () => {
    // unsure why this is needed, all other mocks are cleared in the afterEach block
    clearLogs.mockClear();
    clearInterval.mockClear();

    expect(clearLogs).not.toHaveBeenCalled();
    expect(clearInterval).not.toHaveBeenCalled();

    const { unmount } = render(<InstallationLogView {...defaultProps} />);
    expect(clearLogs).not.toHaveBeenCalled();

    unmount();
    expect(clearLogs).toHaveBeenCalled();
    expect(clearInterval).toHaveBeenCalled();
  });

  it('should stop the timer when receiving 403 error code', async () => {
    const { rerender } = render(<InstallationLogView {...defaultProps} />);
    clearInterval.mockClear();
    expect(clearLogs).not.toHaveBeenCalled();
    rerender(<InstallationLogView {...defaultProps} errorCode={403} />);
    expect(
      screen.getByText(
        'This cluster is installing so some data might not be available. This may take a few minutes.',
      ),
    ).toBeInTheDocument();
    expect(clearInterval).toHaveBeenCalled();
  });

  it('should not show any message when cluster status is error', () => {
    const { container } = render(
      <InstallationLogView
        {...defaultProps}
        cluster={{ ...clusterDetails.cluster, state: clusterStates.error }}
      />,
    );
    expect(container).toHaveTextContent('');
  });

  describe('without logs', () => {
    const emptyProps = {
      ...defaultProps,
      lines: '',
      len: 0,
    };

    afterEach(() => {
      jest.runOnlyPendingTimers();
      jest.clearAllMocks();
    });
    it('shows expected message', () => {
      render(<InstallationLogView {...emptyProps} />);
      expect(
        screen.getByText(
          'Cluster installation has started. Installation log will appear here once it becomes available.',
        ),
      ).toBeInTheDocument();
    });

    it('getLogs() offset should be 0', () => {
      render(<InstallationLogView {...emptyProps} />);
      expect(getLogs).toHaveBeenLastCalledWith(clusterDetails.cluster.id, 0, 'install', undefined);
    });
  });
});
