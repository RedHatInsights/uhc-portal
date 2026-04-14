import React from 'react';

import { Alert, Spinner } from '@patternfly/react-core';

import {
  GroupsApplicationsSelector,
  type GroupsApplicationsSelectorProps,
} from '~/components/common/GroupsApplicationsSelector/GroupsApplicationsSelector';
import { useFetchLogForwardingGroups } from '~/queries/RosaWizardQueries/useFetchLogForwardingGroups';
import type { ErrorState } from '~/types/types';

export type LogForwardingGroupsApplicationsSelectorProps = Omit<
  GroupsApplicationsSelectorProps,
  'treeData'
>;

/**
 * Loads log forwarding groups from GET /api/clusters_mgmt/v1/log_forwarding/groups and passes
 * the resolved tree into {@link GroupsApplicationsSelector}. Keeps cluster/API imports out of the
 * shared component so Storybook and tests can render with mock `treeData` only.
 */
export function LogForwardingGroupsApplicationsSelector(
  props: LogForwardingGroupsApplicationsSelectorProps,
) {
  const { data: treeData = [], isLoading, isError, error } = useFetchLogForwardingGroups();

  if (isError) {
    const err = error as ErrorState | null | undefined;
    return (
      <Alert variant="danger" isInline title="Could not load log forwarding groups">
        {err?.errorMessage ?? err?.reason ?? err?.message ?? 'Request failed'}
      </Alert>
    );
  }

  if (isLoading && treeData.length === 0) {
    return <Spinner aria-label="Loading groups and applications" />;
  }

  return <GroupsApplicationsSelector {...props} treeData={treeData} />;
}
