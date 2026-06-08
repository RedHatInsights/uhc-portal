import React, { useMemo } from 'react';
import { useField } from 'formik';

import { Spinner } from '@patternfly/react-core';

import { FieldId } from '~/components/clusters/wizards/rosa/constants';
import ErrorBox from '~/components/common/ErrorBox';
import {
  GroupsApplicationsSelector,
  type GroupsApplicationsSelectorProps,
} from '~/components/common/GroupsApplicationsSelector/GroupsApplicationsSelector';
import { buildLogForwardingTree } from '~/components/common/GroupsApplicationsSelector/logForwardingGroupTreeFromApi';
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
export function LogForwardingGroupsApplicationsSelector({
  containerMaxHeight,
  ...selectorProps
}: LogForwardingGroupsApplicationsSelectorProps) {
  const [{ value: s3On }] = useField<boolean>(FieldId.LogForwardingS3Enabled);
  const [{ value: cwOn }] = useField<boolean>(FieldId.LogForwardingCloudWatchEnabled);

  const {
    data: groupsTree = [],
    isLoading: isGroupsLoading,
    isError: isGroupsError,
    error: groupsError,
  } = useFetchLogForwardingGroups({ s3On, cwOn });

  // Applications are used only to build the "Other" group; a failure here is non-fatal.
  const {
    data: applications = [],
    isLoading: isAppsLoading,
    isError: isAppsError,
    error: appsError,
  } = useFetchLogForwardingApplications({ s3On, cwOn });

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
      {isAppsError && (
        <ErrorBox
          variant="warning"
          message="Could not load all applications. Some options may be missing from the list."
          response={appsError ?? {}}
        />
      )}
      <GroupsApplicationsSelector
        {...selectorProps}
        treeData={treeData}
        containerMaxHeight={containerMaxHeight ?? ''}
      />
    </>
  );
}
