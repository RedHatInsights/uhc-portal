import React, { useMemo } from 'react';

import { Spinner } from '@patternfly/react-core';

import ErrorBox from '~/components/common/ErrorBox';
import {
  GroupsApplicationsSelector,
  type GroupsApplicationsSelectorProps,
} from '~/components/common/GroupsApplicationsSelector/GroupsApplicationsSelector';
import { buildOtherGroupTreeNode } from '~/components/common/GroupsApplicationsSelector/logForwardingGroupTreeFromApi';
import { useFetchLogForwardingApplications } from '~/queries/RosaWizardQueries/useFetchLogForwardingApplications';
import { useFetchLogForwardingGroups } from '~/queries/RosaWizardQueries/useFetchLogForwardingGroups';

export type LogForwardingGroupsApplicationsSelectorProps = Omit<
  GroupsApplicationsSelectorProps,
  'treeData'
>;

/**
 * Loads log forwarding groups and applications, joins them so that any application not covered by
 * a named group appears under a synthetic "Other" group, then passes the full tree into
 * {@link GroupsApplicationsSelector}.
 */
export function LogForwardingGroupsApplicationsSelector(
  props: LogForwardingGroupsApplicationsSelectorProps,
) {
  const {
    data: groupsTree = [],
    isLoading: isGroupsLoading,
    isError: isGroupsError,
    error: groupsError,
  } = useFetchLogForwardingGroups();

  // Applications are used only to build the "Other" group; a failure here is non-fatal.
  const { data: applications = [], isLoading: isAppsLoading } = useFetchLogForwardingApplications();

  const isLoading = isGroupsLoading || isAppsLoading;

  const treeData = useMemo(() => {
    const otherNode = buildOtherGroupTreeNode(applications, groupsTree);
    return otherNode ? [...groupsTree, otherNode] : groupsTree;
  }, [groupsTree, applications]);

  if (isGroupsError) {
    return <ErrorBox message="Could not load log forwarding groups" response={groupsError ?? {}} />;
  }

  if (isLoading && treeData.length === 0) {
    return <Spinner aria-label="Loading groups and applications" />;
  }

  return <GroupsApplicationsSelector {...props} treeData={treeData} />;
}
