import React from 'react';

import { TabTitleText, Tooltip } from '@patternfly/react-core';

import { ClusterTabsId } from '../../common/ClusterTabIds';
import { getInitTab, getTabs } from '../TabsRow.helper';
import { TabsRowTabType } from '../TabsRow.model';

import {
  mocksTabsRowTab,
  regularTabsInfoAllHidden,
  regularTabsInfoAllShow,
  regularTabsInfoMonitoringHasIssues,
  regularTabsInfoMonitoringUndefined,
} from './TabsRow.helper.fixtures';

describe('getInitTab', () =>
  it.each([
    ['existing id, first tab', ClusterTabsId.OVERVIEW, mocksTabsRowTab[0]],
    ['undefined id', undefined, mocksTabsRowTab[0]],
    ['existing id different than the first', ClusterTabsId.ACCESS_CONTROL, mocksTabsRowTab[1]],
    ['not existing id', ClusterTabsId.ADD_ONS, mocksTabsRowTab[0]],
  ])('%p', (title: string, id: ClusterTabsId | undefined, expected: TabsRowTabType) =>
    expect(getInitTab(mocksTabsRowTab, id)).toBe(expected),
  ));

describe('getTabs', () => {
  it('all show', () => {
    // Act
    const tabs = getTabs(regularTabsInfoAllShow);

    // Assert
    expect(tabs.length).toBe(11);
    tabs.forEach((tab) => expect(tab.show).toBe(true));

    expect(tabs[1].title).toStrictEqual(
      <>
        <TabTitleText>Monitoring</TabTitleText>
        {null}
      </>,
    );
    expect(tabs[9].tooltip).toStrictEqual(<Tooltip content="whatever" />);
  });

  it('all hiddedn', () => {
    // Act
    const tabs = getTabs(regularTabsInfoAllHidden);

    // Assert
    expect(tabs.length).toBe(11);
    expect(tabs[0].show).toBe(true);
    tabs.slice(1, tabs.length).forEach((tab) => expect(tab.show).toBe(false));
  });

  it('monitoring show not defined', () => {
    // Act
    const tabs = getTabs(regularTabsInfoMonitoringUndefined);

    // Assert
    expect(tabs.length).toBe(11);
    expect(tabs[0].show).toBe(true);
    expect(tabs[1].show).toBe(true);
    tabs.slice(2, tabs.length).forEach((tab) => expect(tab.show).toBe(false));
  });

  it('monitoring has issues', () => {
    // Act
    const tabs = getTabs(regularTabsInfoMonitoringHasIssues);

    // Assert
    expect(JSON.stringify(tabs[1].title)).toStrictEqual(
      '{"key":null,"ref":null,"props":{"children":[{"key":null,"ref":null,"props":{"children":"Monitoring"},"_owner":null,"_store":{}},{"key":null,"ref":null,"props":{"id":"monitoring-issues-icon","children":{"key":null,"ref":null,"props":{"className":"danger","noDefaultStyle":false},"_owner":null,"_store":{}}},"_owner":null,"_store":{}}]},"_owner":null,"_store":{}}',
    );
  });
});
