import React, { useState } from 'react';

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

import { ClusterTagModal } from './ClusterTagModal';

const AcmHubEmptyState = () => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <EmptyState
      headingLevel="h4"
      icon={ClusterIcon}
      titleText="No hub clusters tagged yet"
      variant={EmptyStateVariant.lg}
      className="acm-hub-empty-state"
    >
      <EmptyStateBody>
        <p>
          Tag hub clusters to reflect your Red Hat Cluster Management for Kubernetes (RHACM) cluster
          structure. Tagging does not affect behavior and serves only to help you organize clusters.
        </p>
        {isOpen ? <ClusterTagModal closeModal={() => setIsOpen(false)} /> : null}
      </EmptyStateBody>
      <EmptyStateFooter>
        <Button variant="primary" onClick={() => setIsOpen(true)}>
          Start tagging
        </Button>
        <EmptyStateActions>
          <ExternalLink href={ACM_HUB_DOCUMENTATION_LINKS.CLUSTER_HUB_DOCUMENTATION}>
            <Button variant="link">
              What is a cluster hub in RHACM and what can it help me do?
            </Button>
          </ExternalLink>
          <ExternalLink href={ACM_HUB_DOCUMENTATION_LINKS.ALREADY_HAVE_CLUSTER_HUB_IN_RHACM}>
            <Button variant="link">Already have a cluster hub in RHACM?</Button>
          </ExternalLink>
        </EmptyStateActions>
      </EmptyStateFooter>
    </EmptyState>
  );
};

export default AcmHubEmptyState;
