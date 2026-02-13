import React from 'react';

import {
  Button,
  EmptyState,
  EmptyStateActions,
  EmptyStateBody,
  EmptyStateFooter,
  EmptyStateVariant,
} from '@patternfly/react-core';
import { ClusterIcon } from '@patternfly/react-icons/dist/esm/icons';

import { ACM_HUB_DOCUMENTATION_LINKS } from '~/common/acmHubConstants';
import ExternalLink from '~/components/common/ExternalLink';

type AcmHubEmptyStateProps = {
  onStartTagging: () => void;
};

const AcmHubEmptyState = ({ onStartTagging }: AcmHubEmptyStateProps) => (
  <EmptyState
    headingLevel="h4"
    icon={ClusterIcon}
    titleText="No hub clusters tagged yet"
    variant={EmptyStateVariant.lg}
    className="acm-hub-empty-state"
  >
    <EmptyStateBody>
      <p>
        Tag Hub clusters to reflect your Red Hat Advanced Cluster Management for Kubernetes (RHACM)
        cluster structure in OpenShift Cluster Manager. Tagging does not affect behavior in RHACM
        and serves only to help you organize clusters. Start tagging from the All clusters page.
      </p>
    </EmptyStateBody>
    <EmptyStateFooter>
      <Button variant="primary" onClick={onStartTagging}>
        Start tagging
      </Button>
      <EmptyStateActions>
        <ExternalLink href={ACM_HUB_DOCUMENTATION_LINKS.CLUSTER_HUB_DOCUMENTATION}>
          <Button variant="link">What is a cluster hub in RHACM and what can it help me do?</Button>
        </ExternalLink>
        <ExternalLink href={ACM_HUB_DOCUMENTATION_LINKS.ALREADY_HAVE_CLUSTER_HUB_IN_RHACM}>
          <Button variant="link">Already have a cluster hub in RHACM?</Button>
        </ExternalLink>
      </EmptyStateActions>
    </EmptyStateFooter>
  </EmptyState>
);

export default AcmHubEmptyState;
