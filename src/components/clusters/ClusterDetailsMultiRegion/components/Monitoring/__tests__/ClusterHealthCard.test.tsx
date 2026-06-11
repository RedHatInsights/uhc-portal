import React from 'react';

import { checkAccessibility, render, screen } from '~/testUtils';

import { ClusterHealthCard } from '../components/ClusterHealthCard';
import { monitoringStatuses } from '../monitoringHelper';

const NOW = new Date('2026-03-10T12:00:00Z').getTime();

describe('<ClusterHealthCard />', () => {
  it.each(Object.entries(monitoringStatuses))(
    'is accessible with health status %s',
    async ([_statusKey, statusValue]) => {
      const { container } = render(<ClusterHealthCard status={statusValue} />);
      await checkAccessibility(container);
    },
  );

  describe('last check-in', () => {
    beforeAll(() => {
      jest.useFakeTimers();
      jest.setSystemTime(NOW);
    });

    it('displays "a few seconds ago" for a recent check-in', () => {
      const testDate = new Date(NOW - 30 * 1000); // 30 seconds ago
      render(<ClusterHealthCard status={monitoringStatuses.HEALTHY} lastCheckIn={testDate} />);

      expect(screen.getByText(/Last check-in:/)).toBeInTheDocument();
      expect(screen.getByText('a few seconds ago')).toBeInTheDocument();
    });

    it('displays relative time for a check-in minutes ago', () => {
      const fiveMinutesAgo = new Date(NOW - 4.5 * 60 * 1000);
      render(
        <ClusterHealthCard status={monitoringStatuses.HEALTHY} lastCheckIn={fiveMinutesAgo} />,
      );

      expect(screen.getByText(/Last check-in:/)).toBeInTheDocument();
      expect(screen.getByText('5 minutes ago')).toBeInTheDocument();
    });

    it('displays relative time for a check-in hours ago', () => {
      const twoHoursAgo = new Date(NOW - 1.5 * 60 * 60 * 1000);
      render(<ClusterHealthCard status={monitoringStatuses.HEALTHY} lastCheckIn={twoHoursAgo} />);

      expect(screen.getByText(/Last check-in:/)).toBeInTheDocument();
      expect(screen.getByText('2 hours ago')).toBeInTheDocument();
    });

    it('displays relative time for a check-in days ago', () => {
      const threeDaysAgo = new Date(NOW - 2.5 * 24 * 60 * 60 * 1000);
      render(<ClusterHealthCard status={monitoringStatuses.HEALTHY} lastCheckIn={threeDaysAgo} />);

      expect(screen.getByText(/Last check-in:/)).toBeInTheDocument();
      expect(screen.getByText('3 days ago')).toBeInTheDocument();
    });

    it('accepts lastCheckIn as a timestamp', () => {
      const timestamp = NOW - 10 * 1000; // 10 seconds ago
      render(<ClusterHealthCard status={monitoringStatuses.HEALTHY} lastCheckIn={timestamp} />);

      expect(screen.getByText(/Last check-in:/)).toBeInTheDocument();
      expect(screen.getByText('a few seconds ago')).toBeInTheDocument();
    });

    it('accepts lastCheckIn as a string', () => {
      const dateString = new Date(NOW - 10 * 1000).toISOString(); // 10 seconds ago
      render(<ClusterHealthCard status={monitoringStatuses.HEALTHY} lastCheckIn={dateString} />);

      expect(screen.getByText(/Last check-in:/)).toBeInTheDocument();
      expect(screen.getByText('a few seconds ago')).toBeInTheDocument();
    });

    it('does not display last check-in when lastCheckIn is undefined', () => {
      render(<ClusterHealthCard status={monitoringStatuses.HEALTHY} />);

      expect(screen.queryByText(/Last check-in:/)).not.toBeInTheDocument();
    });

    afterAll(() => {
      jest.useRealTimers();
    });
  });

  describe('status display', () => {
    it.each([
      [monitoringStatuses.HEALTHY, 'No issues detected'],
      [monitoringStatuses.DISCONNECTED, 'Disconnected cluster'],
      [monitoringStatuses.UPGRADING, 'Cluster is updating'],
      [monitoringStatuses.NO_METRICS, 'Cluster has no metrics'],
      [monitoringStatuses.UNKNOWN, 'Cluster health is unknown'],
    ])('displays correct title for status %s', (status, expectedTitle) => {
      render(<ClusterHealthCard status={status} />);

      expect(screen.getByText(expectedTitle)).toBeInTheDocument();
    });
  });

  describe('discovered issues', () => {
    it('displays plural "issues" when multiple issues are detected', () => {
      render(<ClusterHealthCard status={monitoringStatuses.HAS_ISSUES} discoveredIssues={3} />);

      expect(screen.getByText('3 issues detected')).toBeInTheDocument();
    });

    it('displays singular "issue" when only one issue is detected', () => {
      render(<ClusterHealthCard status={monitoringStatuses.HAS_ISSUES} discoveredIssues={1} />);

      expect(screen.getByText('1 issue detected')).toBeInTheDocument();
    });
  });
});
