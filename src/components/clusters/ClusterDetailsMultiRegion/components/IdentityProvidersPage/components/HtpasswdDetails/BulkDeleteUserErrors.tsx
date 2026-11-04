import React from 'react';

import { Alert, ExpandableSection, List, ListItem, Stack, StackItem } from '@patternfly/react-core';

import ErrorDetailsDisplay from '~/components/common/ErrorDetailsDisplay';
import { BulkDeleteHtpasswdUserError } from '~/queries/types';

type BulkDeleteUserErrorsProps = {
  failedDeletions: BulkDeleteHtpasswdUserError[];
};

const UNKNOWN_USER = 'Unknown user';

const getFailureDisplayName = (failure: BulkDeleteHtpasswdUserError) =>
  failure.username || UNKNOWN_USER;

const BulkDeleteUserErrors = ({ failedDeletions }: BulkDeleteUserErrorsProps) => {
  const failedUsernames = failedDeletions.map(getFailureDisplayName).join(', ');

  return (
    <Alert
      variant="danger"
      isInline
      title="A problem occurred while deleting the following htpasswd users."
      role="alert"
      className="error-box"
      data-testid="alert-error"
    >
      <Stack hasGutter>
        <StackItem>{failedUsernames}</StackItem>
        <StackItem>
          <List isPlain>
            {failedDeletions.map((failure, index) => {
              const displayName = getFailureDisplayName(failure);

              return (
                <ListItem key={`${displayName}-${index}`}>
                  <ExpandableSection toggleText={displayName}>
                    <ErrorDetailsDisplay response={failure.error} />
                  </ExpandableSection>
                </ListItem>
              );
            })}
          </List>
        </StackItem>
      </Stack>
    </Alert>
  );
};

export default BulkDeleteUserErrors;
