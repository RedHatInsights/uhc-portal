// ClusterListEmptyState is the empty state (no clusters) for ClusterList
import React from 'react';
import PropTypes from 'prop-types';

import {
  Button,
  EmptyState,
  EmptyStateActions,
  EmptyStateBody,
  EmptyStateFooter,
  EmptyStateVariant,
} from '@patternfly/react-core';
import { PlusCircleIcon } from '@patternfly/react-icons/dist/esm/icons/plus-circle-icon';

import { Link } from '~/common/routing';

function ClusterListEmptyState({ showTabbedView }) {
  return (
    <EmptyState
      headingLevel="h4"
      icon={PlusCircleIcon}
      titleText="Let&#39;s create your first cluster"
      variant={EmptyStateVariant.lg}
      className="cluster-list-empty-state"
    >
      <EmptyStateBody>
        You don&#39;t have any clusters yet, but you can easily create or register your first
        OpenShift 4 cluster.
      </EmptyStateBody>
      <EmptyStateFooter>
        <Link to="/create">
          <Button data-testid="create_cluster_btn" className="pf-v6-u-mt-xl">
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
          {!showTabbedView && (
            <Link to="/cluster-request">
              <Button variant="link">View cluster requests</Button>
            </Link>
          )}
          <Link to="/assisted-installer">
            <Button variant="link">Assisted Installer clusters</Button>
          </Link>
        </EmptyStateActions>
      </EmptyStateFooter>
    </EmptyState>
  );
}

ClusterListEmptyState.propTypes = {
  showTabbedView: PropTypes.bool,
};

export default ClusterListEmptyState;
