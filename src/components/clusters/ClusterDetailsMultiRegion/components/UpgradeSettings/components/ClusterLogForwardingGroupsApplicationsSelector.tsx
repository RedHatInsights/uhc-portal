import React, { useMemo } from 'react';

import { Spinner } from '@patternfly/react-core';

import ErrorBox from '~/components/common/ErrorBox';
import {
  GroupsApplicationsSelector,
  type GroupsApplicationsSelectorProps,
} from '~/components/common/GroupsApplicationsSelector/GroupsApplicationsSelector';
import { buildLogForwardingTree } from '~/components/common/GroupsApplicationsSelector/logForwardingGroupTreeFromApi';
import { useFetchLogForwardingApplications } from '~/queries/RosaWizardQueries/useFetchLogForwardingApplications';
import { useFetchLogForwardingGroups } from '~/queries/RosaWizardQueries/useFetchLogForwardingGroups';

export type ClusterLogForwardingGroupsApplicationsSelectorProps = Omit<
  GroupsApplicationsSelectorProps,
  'treeData'
>;

/** Day 2 selector: always loads enabled groups and applications from the catalog APIs. */
export function ClusterLogForwardingGroupsApplicationsSelector({
  containerMaxHeight,
  ...selectorProps
}: ClusterLogForwardingGroupsApplicationsSelectorProps) {
  const {
    data: groupsTree = [],
    isLoading: isGroupsLoading,
    isError: isGroupsError,
    error: groupsError,
  } = useFetchLogForwardingGroups({ s3On: true, cwOn: true });

  const {
    data: applications = [],
    isLoading: isAppsLoading,
    isError: isAppsError,
    error: appsError,
  } = useFetchLogForwardingApplications({ s3On: true, cwOn: true });

  const isLoading = isGroupsLoading || isAppsLoading;

  const treeData = useMemo(
    () => buildLogForwardingTree(groupsTree, applications),
    [groupsTree, applications],
  );

  if (isGroupsError) {
    return <ErrorBox message="Could not load log forwarding groups" response={groupsError ?? {}} />;
  }

  if (isLoading && treeData.length === 0) {
    return <Spinner aria-label="Loading groups and applications" />;
  }

  return (
    <>
      {isAppsError ? (
        <ErrorBox
          variant="warning"
          message="Could not load all applications. Some options may be missing from the list."
          response={appsError ?? {}}
        />
      ) : null}
      <GroupsApplicationsSelector
        {...selectorProps}
        treeData={treeData}
        containerMaxHeight={containerMaxHeight ?? ''}
      />
    </>
  );
}
