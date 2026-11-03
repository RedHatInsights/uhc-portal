import React from 'react';

import { Alert, ExpandableSection, List, ListItem } from '@patternfly/react-core';

import ErrorDetailsDisplay from '~/components/common/ErrorDetailsDisplay';
import { BulkDeleteHtpasswdUserError } from '~/queries/types';

type BulkDeleteUserErrorsProps = {
  failedDeletions: BulkDeleteHtpasswdUserError[];
};

const BulkDeleteUserErrors = ({ failedDeletions }: BulkDeleteUserErrorsProps) => {
  const failedUsernames = failedDeletions
    .map((failure) => failure.username)
    .filter(Boolean)
    .join(', ');

  return (
    <Alert
      variant="danger"
      isInline
      title="A problem occurred while deleting the following htpasswd users."
      role="alert"
      className="error-box"
      data-testid="alert-error"
    >
      {failedUsernames}
      <br />
      <List isPlain>
        {failedDeletions.map((failure) => (
          <ListItem key={failure.userId ?? failure.username}>
            <ExpandableSection toggleText={failure.username ?? 'Unknown user'}>
              <ErrorDetailsDisplay response={failure.error} />
            </ExpandableSection>
          </ListItem>
        ))}
      </List>
    </Alert>
  );
};

export default BulkDeleteUserErrors;
