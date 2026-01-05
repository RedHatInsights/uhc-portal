/* eslint-disable testing-library/prefer-find-by */
/* eslint-disable testing-library/no-wait-for-multiple-assertions */
/* eslint-disable testing-library/await-async-queries */
import React, { RefObject } from 'react';

import { checkAccessibility, mockUseChrome, render, screen, waitFor } from '~/testUtils';

import { ClusterTabsId } from '../../common/ClusterTabIds';
import TabsRow, { TabsRowProps } from '../TabsRow';

const tabNames = {
  overview: 'Overview',
  monitoring: 'Monitoring',
  accesscontrol: 'Access control',
  addons: 'Add-ons',
  clusterhistory: 'Cluster history',
  networking: 'Networking',
  machinepools: 'Machine pools',
  support: 'Support',
  settings: 'Settings',
  addhosts: 'Add Hosts',
  accessRequest: 'Access Requests',
};

mockUseChrome({ analytics: { track: () => {} } });

describe('<TabsRow />', () => {
  const mockRef: RefObject<any> = { current: { hidden: true } };
  const onTabSelectedMock = jest.fn();

  const props: TabsRowProps = {
    tabsInfo: {
      overview: { ref: mockRef, hasIssues: false },
      monitoring: { ref: mockRef },
      accessControl: { ref: mockRef },
      addOns: { ref: mockRef },
      clusterHistory: { ref: mockRef },
      networking: { ref: mockRef },
      machinePools: { ref: mockRef },
      support: { ref: mockRef },
      updateSettings: { ref: mockRef },
      addAssistedHosts: { ref: mockRef },
      accessRequest: { ref: mockRef },
    },
    onTabSelected: onTabSelectedMock,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('display mechanism', () => {
    it('is accessible', async () => {
      // Adding the tab content container as they are added outside this component
      const tabProps = { ...props, displayAccessControlTab: true, displayAddOnsTab: true };
      const { container } = render(
        <>
          <TabsRow {...tabProps} />

          <div id="overviewTabContent" />
          <div id="accessControlTabContent" />
        </>,
      );

      // Assert
      await checkAccessibility(container);
    });

    it('shows all tabs', () => {
      // Arrange
      const tabProps: TabsRowProps = {
        ...props,
        tabsInfo: {
          [ClusterTabsId.OVERVIEW]: { ...props.tabsInfo[ClusterTabsId.OVERVIEW], show: true },
          [ClusterTabsId.MONITORING]: { ...props.tabsInfo[ClusterTabsId.MONITORING], show: true },
          [ClusterTabsId.ACCESS_CONTROL]: {
            ...props.tabsInfo[ClusterTabsId.ACCESS_CONTROL],
            show: true,
          },
          [ClusterTabsId.ADD_ONS]: { ...props.tabsInfo[ClusterTabsId.ADD_ONS], show: true },
          [ClusterTabsId.CLUSTER_HISTORY]: {
            ...props.tabsInfo[ClusterTabsId.CLUSTER_HISTORY],
            show: true,
          },
          [ClusterTabsId.NETWORKING]: { ...props.tabsInfo[ClusterTabsId.NETWORKING], show: true },
          [ClusterTabsId.MACHINE_POOLS]: {
            ...props.tabsInfo[ClusterTabsId.MACHINE_POOLS],
            show: true,
          },
          [ClusterTabsId.SUPPORT]: { ...props.tabsInfo[ClusterTabsId.SUPPORT], show: true },
          [ClusterTabsId.UPDATE_SETTINGS]: {
            ...props.tabsInfo[ClusterTabsId.UPDATE_SETTINGS],
            show: true,
          },
          [ClusterTabsId.ADD_ASSISTED_HOSTS]: {
            ...props.tabsInfo[ClusterTabsId.ADD_ASSISTED_HOSTS],
            show: true,
          },
          [ClusterTabsId.ACCESS_REQUEST]: {
            ...props.tabsInfo[ClusterTabsId.ACCESS_REQUEST],
            show: true,
          },
        },
      };

      // Act
      render(<TabsRow {...tabProps} />);

      // Assert
      expect(screen.getAllByRole('tab')).toHaveLength(Object.keys(tabNames).length);

      expect(
        screen.getByRole('tab', { name: tabNames.overview, selected: true }),
      ).toBeInTheDocument();

      Object.values(tabNames)
        .filter((tabName) => tabName !== tabNames.overview)
        .forEach((tabName) =>
          expect(screen.getByRole('tab', { name: tabName, selected: false })).toBeInTheDocument(),
        );
    });

    it('shows all tabs. Add Host disabled', () => {
      // Arrange
      const tabProps: TabsRowProps = {
        ...props,
        tabsInfo: {
          [ClusterTabsId.OVERVIEW]: { ...props.tabsInfo[ClusterTabsId.OVERVIEW], show: true },
          [ClusterTabsId.MONITORING]: { ...props.tabsInfo[ClusterTabsId.MONITORING], show: true },
          [ClusterTabsId.ACCESS_CONTROL]: {
            ...props.tabsInfo[ClusterTabsId.ACCESS_CONTROL],
            show: true,
          },
          [ClusterTabsId.ADD_ONS]: { ...props.tabsInfo[ClusterTabsId.ADD_ONS], show: true },
          [ClusterTabsId.CLUSTER_HISTORY]: {
            ...props.tabsInfo[ClusterTabsId.CLUSTER_HISTORY],
            show: true,
          },
          [ClusterTabsId.NETWORKING]: { ...props.tabsInfo[ClusterTabsId.NETWORKING], show: true },
          [ClusterTabsId.MACHINE_POOLS]: {
            ...props.tabsInfo[ClusterTabsId.MACHINE_POOLS],
            show: true,
          },
          [ClusterTabsId.SUPPORT]: { ...props.tabsInfo[ClusterTabsId.SUPPORT], show: true },
          [ClusterTabsId.UPDATE_SETTINGS]: {
            ...props.tabsInfo[ClusterTabsId.UPDATE_SETTINGS],
            show: true,
          },
          [ClusterTabsId.ADD_ASSISTED_HOSTS]: {
            ...props.tabsInfo[ClusterTabsId.ADD_ASSISTED_HOSTS],
            show: true,
            isDisabled: true,
          },
          [ClusterTabsId.ACCESS_REQUEST]: {
            ...props.tabsInfo[ClusterTabsId.ACCESS_REQUEST],
            show: true,
            isDisabled: true,
          },
        },
      };

      // Act
      render(<TabsRow {...tabProps} />);

      // Assert
      expect(screen.getAllByRole('tab')).toHaveLength(Object.keys(tabNames).length);

      expect(
        screen.getByRole('tab', { name: tabNames.overview, selected: true }),
      ).toBeInTheDocument();

      Object.values(tabNames)
        .filter((tabName) => tabName !== tabNames.overview && tabName !== tabNames.overview)
        .forEach((tabName) =>
          expect(screen.getByRole('tab', { name: tabName, selected: false })).toBeInTheDocument(),
        );
    });

    it('shows just default tab', () => {
      // Arrange
      const tabProps = {
        ...props,
      };

      // Act
      render(<TabsRow {...tabProps} />);

      // Assert
      expect(screen.getAllByRole('tab')).toHaveLength(2);
      expect(
        screen.getByRole('tab', { name: tabNames.overview, selected: true }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole('tab', { name: tabNames.monitoring, selected: false }),
      ).toBeInTheDocument();

      Object.values(tabNames)
        .filter((tabName) => ![tabNames.overview, tabNames.monitoring].includes(tabName))
        .map((tabName) =>
          tabName === 'Access Requests' ? 'Pending Access Requests Access Requests' : tabName,
        )
        .forEach((tabName) =>
          expect(screen.queryByRole('tab', { name: tabName })).not.toBeInTheDocument(),
        );
    });

    it('shows just overview tab', () => {
      // Arrange
      const tabProps: TabsRowProps = {
        ...props,
        tabsInfo: {
          ...props.tabsInfo,
          [ClusterTabsId.OVERVIEW]: { ...props.tabsInfo[ClusterTabsId.OVERVIEW], show: true },
          [ClusterTabsId.MONITORING]: { ...props.tabsInfo[ClusterTabsId.MONITORING], show: false },
        },
      };

      // Act
      render(<TabsRow {...tabProps} />);

      // Assert
      expect(screen.getAllByRole('tab')).toHaveLength(1);

      expect(
        screen.getByRole('tab', { name: tabNames.overview, selected: true }),
      ).toBeInTheDocument();

      Object.values(tabNames)
        .filter((tabName) => tabName !== tabNames.overview)
        .forEach((tabName) =>
          expect(screen.queryByRole('tab', { name: tabName })).not.toBeInTheDocument(),
        );
    });

    it('shows monitoring tab with issues icon when hasIssues prop is passed', () => {
      // Arrange
      const tabProps: TabsRowProps = {
        ...props,
        tabsInfo: {
          ...props.tabsInfo,
          [ClusterTabsId.OVERVIEW]: { ...props.tabsInfo[ClusterTabsId.OVERVIEW], show: true },
          [ClusterTabsId.MONITORING]: {
            ...props.tabsInfo[ClusterTabsId.MONITORING],
            hasIssues: true,
          },
        },
      };

      // Act
      render(<TabsRow {...tabProps} />);

      // Assert
      // There is an accessibility issue with the warning icon.
      // It doesn't have an accessible label and is hidden (with aria-hidden) so it is not easily found
      expect(
        screen.getByRole('tab', { name: tabNames.monitoring }).querySelector('svg.danger'),
      ).toBeInTheDocument();
    });
  });

  describe('init tab mechanism', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('selects tab which is displayed and not disabled', async () => {
      // Arrange
      const tabProps: TabsRowProps = {
        ...props,
        tabsInfo: {
          ...props.tabsInfo,
          [ClusterTabsId.OVERVIEW]: { ...props.tabsInfo[ClusterTabsId.OVERVIEW], show: true },
          [ClusterTabsId.CLUSTER_HISTORY]: {
            ...props.tabsInfo[ClusterTabsId.CLUSTER_HISTORY],
            show: true,
          },
        },
        initTabOpen: ClusterTabsId.CLUSTER_HISTORY,
      };

      // Act
      render(<TabsRow {...tabProps} />);

      // Assert
      await waitFor(() =>
        expect(
          screen.getByRole('tab', { name: tabNames.clusterhistory, selected: true }),
        ).toBeInTheDocument(),
      );

      expect(onTabSelectedMock).toHaveBeenCalledWith(ClusterTabsId.CLUSTER_HISTORY);
      expect(onTabSelectedMock).toHaveBeenCalledTimes(2);
    });

    it('selects tab which is not displayed', async () => {
      // Arrange
      const tabProps: TabsRowProps = {
        ...props,
        initTabOpen: ClusterTabsId.CLUSTER_HISTORY,
      };

      // Act
      render(<TabsRow {...tabProps} />);

      // Assert
      expect(onTabSelectedMock).toHaveBeenCalledWith(ClusterTabsId.OVERVIEW);
      expect(onTabSelectedMock).toHaveBeenCalledTimes(2);
    });

    it('selects tab which is displayed but disabled', async () => {
      // Arrange
      const tabProps: TabsRowProps = {
        ...props,
        tabsInfo: {
          ...props.tabsInfo,
          [ClusterTabsId.ADD_ASSISTED_HOSTS]: {
            ...props.tabsInfo[ClusterTabsId.ADD_ASSISTED_HOSTS],
            show: true,
            isDisabled: true,
          },
        },
        initTabOpen: ClusterTabsId.ADD_ASSISTED_HOSTS,
      };

      // Act
      render(<TabsRow {...tabProps} />);

      // Assert
      expect(onTabSelectedMock).toHaveBeenCalledWith(ClusterTabsId.OVERVIEW);
      expect(onTabSelectedMock).toHaveBeenCalledTimes(2);
    });
  });

  describe('User tab navigation mechanism', () => {
    it('User can navigate to show tab', async () => {
      // Arrange
      const tabProps: TabsRowProps = {
        ...props,
        tabsInfo: {
          ...props.tabsInfo,
          [ClusterTabsId.OVERVIEW]: { ...props.tabsInfo[ClusterTabsId.OVERVIEW], show: true },
          [ClusterTabsId.CLUSTER_HISTORY]: {
            ...props.tabsInfo[ClusterTabsId.CLUSTER_HISTORY],
            show: true,
          },
        },
      };

      // Act
      const { user } = render(<TabsRow {...tabProps} />);

      const targetTab = screen.getByRole('tab', { name: 'Cluster history' });
      await user.click(targetTab);

      // Assert
      expect(targetTab).toHaveAttribute('aria-selected', 'true');
    });

    it('Attempt to navigate to not shown tab', async () => {
      // Arrange
      const tabProps: TabsRowProps = {
        ...props,
        tabsInfo: {
          ...props.tabsInfo,
          [ClusterTabsId.OVERVIEW]: { ...props.tabsInfo[ClusterTabsId.OVERVIEW], show: true },
          [ClusterTabsId.CLUSTER_HISTORY]: {
            ...props.tabsInfo[ClusterTabsId.CLUSTER_HISTORY],
            show: false,
          },
        },
        initTabOpen: ClusterTabsId.CLUSTER_HISTORY,
      };

      // Act
      render(<TabsRow {...tabProps} />);

      await waitFor(() => {
        expect(onTabSelectedMock).toHaveBeenCalledTimes(2);
        expect(onTabSelectedMock).toHaveBeenCalledWith(ClusterTabsId.OVERVIEW);
      });

      // Assert
      const initialTab = screen.getByRole('tab', { name: 'Overview' });
      expect(initialTab).toHaveAttribute('aria-selected', 'true');
      const targetTab = screen.queryByRole('tab', { name: 'Cluster history' });
      expect(targetTab).toBeNull();
    });

    it('Attempt to navigate to disabled tab', async () => {
      // Arrange
      const tabProps: TabsRowProps = {
        ...props,
        tabsInfo: {
          ...props.tabsInfo,
          [ClusterTabsId.OVERVIEW]: { ...props.tabsInfo[ClusterTabsId.OVERVIEW], show: true },
          [ClusterTabsId.ADD_ASSISTED_HOSTS]: {
            ...props.tabsInfo[ClusterTabsId.ADD_ASSISTED_HOSTS],
            show: true,
            isDisabled: true,
          },
        },
        initTabOpen: ClusterTabsId.OVERVIEW,
      };

      // Act
      const { user } = render(<TabsRow {...tabProps} />);

      const initialTab = screen.getByRole('tab', { name: 'Overview' });
      expect(initialTab).toHaveAttribute('aria-selected', 'true');

      const addAssistedTab = screen.getByRole('tab', { name: 'Add Hosts' });
      expect(addAssistedTab).toHaveAttribute('aria-disabled', 'true');

      await user.click(addAssistedTab);

      // Assert
      await waitFor(() => {
        expect(onTabSelectedMock).toHaveBeenCalledTimes(2);
        expect(onTabSelectedMock).toHaveBeenCalledWith(ClusterTabsId.OVERVIEW);
      });
    });
  });
});
