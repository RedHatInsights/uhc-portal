import React from 'react';

import { Alert } from '@patternfly/react-core';

import { Link } from '~/common/routing';
import { AccessRequest } from '~/types/access_transparency.v1';

export type AccessRequestPendingAlertProps = {
  total?: number;
  linkUrl?: string;
  accessRequests?: AccessRequest[];
};

const AccessRequestPendingAlert = ({
  total,
  linkUrl,
  accessRequests,
}: AccessRequestPendingAlertProps) =>
  total ? (
    <Alert
      id="pendingAccessRequestAlert"
      className="pf-v6-u-mt-md"
      variant="warning"
      isInline
      title="Pending Access Requests"
    >
      Your organization has <b>{total}</b> pending Access Request{total > 1 ? 's' : ''}{' '}
      {accessRequests?.length ? (
        <span>
          {' '}
          to the following Cluster{total > 1 ? 's' : ''}:{' '}
          {accessRequests
            .map<React.ReactNode>((accessRequest) => (
              <Link
                key={`pendingAccessRequestAlertLink-${accessRequest.subscription_id}`}
                to={`/details/s/${accessRequest.subscription_id}#accessRequest`}
              >
                {accessRequest.subscription_id}
              </Link>
            ))
            .reduce((prev, curr) => [prev, ', ', curr])}
          . Please enter the Cluster details page and review them in the Access Requests tab.
        </span>
      ) : null}
      {linkUrl ? <Link to={linkUrl}>Show pending requests</Link> : null}
    </Alert>
  ) : null;

export default AccessRequestPendingAlert;
