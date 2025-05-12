// ClusterListEmptyState is the empty state (no clusters) for ClusterList
import React from 'react';

import {
  Button,
  EmptyState,
  EmptyStateActions,
  EmptyStateBody,
  EmptyStateFooter,
  EmptyStateHeader,
  EmptyStateIcon,
  EmptyStateVariant,
} from '@patternfly/react-core';
import { PlusCircleIcon } from '@patternfly/react-icons/dist/esm/icons/plus-circle-icon';

import { Link } from '~/common/routing';

function ClusterListEmptyState() {
  return (
    <EmptyState variant={EmptyStateVariant.lg} className="cluster-list-empty-state">
      <EmptyStateHeader
        titleText="Let&#39;s create your first cluster"
        icon={<EmptyStateIcon icon={PlusCircleIcon} />}
        headingLevel="h4"
      />
      <EmptyStateBody>
        You don&#39;t have any clusters yet, but you can easily create or register your first
        OpenShift 4 cluster.
      </EmptyStateBody>
      <EmptyStateFooter>
        <Link to="/create">
          <Button data-testid="create_cluster_btn" className="pf-v5-u-mt-xl">
            Create cluster
          </Button>
        </Link>
        <EmptyStateActions>
          <Link to="/register">
            <Button variant="link" data-testid="register-cluster-item">
              Register cluster
            </Button>
          </Link>
          <Link to="/archived">
            <Button variant="link">View cluster archives</Button>
          </Link>
          <Link to="/cluster-request">
            <Button variant="link">View cluster requests</Button>
          </Link>
          <Link to="/assisted-installer">
            <Button variant="link">Assisted Installer clusters</Button>
          </Link>
        </EmptyStateActions>
      </EmptyStateFooter>
    </EmptyState>
  );
}

export default ClusterListEmptyState;
