import React from 'react';

import { checkAccessibility, render, screen, within } from '~/testUtils';

import VersionSelectionGrid from '../VersionSelectionGrid';

describe('<VersionSelectionGrid />', () => {
  const onSelect = jest.fn<void, [string]>();

  const cases = [
    {
      // should only have latest
      version: '4.5.20',
      channelGroup: 'candidate',
      availableUpgrades: ['4.6.5'],
    },
    {
      // should only have latest in curr minor
      version: '4.5.15',
      channelGroup: 'stable',
      availableUpgrades: ['4.5.16', '4.5.17', '4.5.18', '4.5.19'],
    },
    {
      // should have both recommendations and more
      version: '4.5.15',
      channelGroup: 'candidate',
      availableUpgrades: [
        '4.5.16',
        '4.5.17',
        '4.5.18',
        '4.5.19',
        '4.5.20',
        '4.6.0-rc.2',
        '4.6.0-rc.3',
        '4.6.0-rc.4',
        '4.6.2',
      ],
    },
    {
      // should have both recommendation and nothing more
      version: '4.5.18',
      channelGroup: 'fast',
      availableUpgrades: ['4.5.19', '4.6.4'],
    },
  ];

  const defaultProps = {
    clusterVersion: '4.5.20',
    availableUpgrades: ['4.5.21'],
    onSelect,
    selected: undefined,
    isUnMetClusterAcknowledgements: false,
  };

  const getCards = (container: HTMLElement): NodeListOf<HTMLElement> =>
    container.querySelectorAll('.pf-v6-c-card');

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('is accessible', async () => {
    const { container } = render(<VersionSelectionGrid {...defaultProps} />);

    await checkAccessibility(container);
  });

  it('should have recommended card for the latest version only and nothing more', () => {
    const newProps = {
      ...defaultProps,
      clusterVersion: cases[0].version,
      availableUpgrades: cases[0].availableUpgrades,
    };
    const { container } = render(<VersionSelectionGrid {...newProps} />);

    const cards = getCards(container);
    const firstCard = cards[0];
    expect(cards).toHaveLength(1);
    expect(within(firstCard).getByText('Recommended', { exact: false })).toBeInTheDocument();

    expect(
      within(firstCard).getByText('Start taking advantage of the new features', {
        exact: false,
      }),
    ).toBeInTheDocument();

    expect(screen.queryByRole('separator')).not.toBeInTheDocument();
  });

  it('should have recommended card for the latest version in minor and others unrecommended', () => {
    const newProps = {
      ...defaultProps,
      clusterVersion: cases[1].version,
      availableUpgrades: cases[1].availableUpgrades,
    };
    const { container } = render(<VersionSelectionGrid {...newProps} />);

    const cards = getCards(container);
    expect(cards).toHaveLength(4);

    expect(screen.getByText('Recommended', { exact: false })).toBeInTheDocument();

    expect(
      screen.getByText('The latest on your current minor version', {
        exact: false,
      }),
    ).toBeInTheDocument();

    expect(screen.getByRole('separator')).toBeInTheDocument();
  });

  it('should have both recommended cards and nothing more', () => {
    const newProps = {
      ...defaultProps,
      clusterVersion: cases[2].version,
      availableUpgrades: cases[2].availableUpgrades,
    };

    const { container } = render(<VersionSelectionGrid {...newProps} />);

    const cards = getCards(container);
    expect(cards).toHaveLength(9);

    expect(screen.getAllByText('Recommended', { exact: false })).toHaveLength(2);

    expect(
      screen.getByText('The latest on your current minor version', {
        exact: false,
      }),
    ).toBeInTheDocument();

    expect(screen.getByRole('separator')).toBeInTheDocument();
  });

  it('should have both recommended cards and others unrecommended', () => {
    const newProps = {
      ...defaultProps,
      clusterVersion: cases[3].version,
      availableUpgrades: cases[3].availableUpgrades,
    };

    const { container } = render(<VersionSelectionGrid {...newProps} />);

    const cards = getCards(container);
    expect(cards).toHaveLength(2);

    expect(screen.getAllByText('Recommended', { exact: false })).toHaveLength(2);

    expect(
      screen.getByText('The latest on your current minor version', {
        exact: false,
      }),
    ).toBeInTheDocument();

    expect(screen.queryByRole('separator')).not.toBeInTheDocument();
  });

  describe('Upgrade to v5 warning', () => {
    it('does not render when showUpgradeToV5Warning is false', () => {
      render(<VersionSelectionGrid {...defaultProps} showUpgradeToV5Warning={false} />);

      expect(screen.queryByTestId('classic-upgrade-to-v5-warning')).not.toBeInTheDocument();
    });

    it('renders for a ROSA Classic cluster when showUpgradeToV5Warning is true', () => {
      render(<VersionSelectionGrid {...defaultProps} showUpgradeToV5Warning isRosa />);

      expect(screen.getByTestId('classic-upgrade-to-v5-warning')).toBeInTheDocument();
      expect(
        screen.getByText('create a new ROSA HCP cluster', { exact: false }),
      ).toBeInTheDocument();
    });

    it('renders for an OSD Classic cluster when showUpgradeToV5Warning is true', () => {
      render(<VersionSelectionGrid {...defaultProps} showUpgradeToV5Warning isRosa={false} />);

      expect(screen.getByTestId('classic-upgrade-to-v5-warning')).toBeInTheDocument();
      expect(
        screen.getByText('the last supported version for OSD Classic', { exact: false }),
      ).toBeInTheDocument();
    });
  });
});
