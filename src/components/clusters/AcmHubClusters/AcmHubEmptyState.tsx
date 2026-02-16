import React, { useState } from 'react';

import {
  Button,
  Card,
  CardBody,
  CardTitle,
  EmptyState,
  EmptyStateActions,
  EmptyStateBody,
  EmptyStateFooter,
  EmptyStateVariant,
  ExpandableSection,
  Flex,
  FlexItem,
  Stack,
  StackItem,
} from '@patternfly/react-core';
import { ClusterIcon } from '@patternfly/react-icons/dist/esm/icons';

import { ACM_HUB_DOCUMENTATION_LINKS } from '~/common/acmHubConstants';
import ExternalLink from '~/components/common/ExternalLink';

type AcmHubEmptyStateProps = {
  onStartTagging: () => void;
};

const AcmHubEmptyState = ({ onStartTagging }: AcmHubEmptyStateProps) => {
  const [isClusterHubExpanded, setIsClusterHubExpanded] = useState(false);
  const [isAlreadyHaveHubExpanded, setIsAlreadyHaveHubExpanded] = useState(false);

  const handleClusterHubToggle = () => {
    setIsClusterHubExpanded((prev) => !prev);
  };

  const handleAlreadyHaveHubToggle = () => {
    setIsAlreadyHaveHubExpanded((prev) => !prev);
  };

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
          Tag hub clusters to reflect your Red Hat Advanced Cluster Management for Kubernetes
          (RHACM) cluster structure. Tagging does not affect behavior in RHACM and serves only to
          help you organize clusters.
        </p>
      </EmptyStateBody>
      <EmptyStateFooter>
        <Button variant="primary" onClick={onStartTagging}>
          Start tagging
        </Button>
        <EmptyStateActions>
          <Stack hasGutter>
            <StackItem>
              <ExpandableSection
                toggleText="What is a cluster hub in RHACM and what can it help me do?"
                isExpanded={isClusterHubExpanded}
                onToggle={handleClusterHubToggle}
              >
                <Card>
                  <CardTitle style={{ textAlign: 'left' }}>
                    <strong>
                      Install RHACM to manage your fleet of clusters from a central hub
                    </strong>
                  </CardTitle>
                  <CardBody style={{ textAlign: 'left' }}>
                    <p>
                      RHACM provides centralized management, visibility, and policy control for your
                      entire fleet from a single console.
                      <br /> A key component of RHACM is the hub cluster. A hub cluster has RHACM
                      installed and lets you create, manage, and monitor other Kubernetes clusters
                      in a single place.
                    </p>
                    <Flex
                      direction={{ default: 'row' }}
                      gap={{ default: 'gapMd' }}
                      style={{ marginTop: 'var(--pf-v5-global--spacer--md)' }}
                    >
                      <FlexItem>
                        <ExternalLink href={ACM_HUB_DOCUMENTATION_LINKS.CLUSTER_HUB_DOCUMENTATION}>
                          Learn more about RHACM
                        </ExternalLink>
                      </FlexItem>
                      <FlexItem>
                        <ExternalLink href={ACM_HUB_DOCUMENTATION_LINKS.CLUSTER_HUB_DOCUMENTATION}>
                          Learn more about hub clusters
                        </ExternalLink>
                      </FlexItem>
                      <FlexItem>
                        <ExternalLink href={ACM_HUB_DOCUMENTATION_LINKS.CLUSTER_HUB_DOCUMENTATION}>
                          Installation guide
                        </ExternalLink>
                      </FlexItem>
                    </Flex>
                  </CardBody>
                </Card>
              </ExpandableSection>
            </StackItem>
            <StackItem>
              <ExpandableSection
                toggleText="Already have a cluster hub in RHACM?"
                isExpanded={isAlreadyHaveHubExpanded}
                onToggle={handleAlreadyHaveHubToggle}
              >
                <Card>
                  <CardTitle style={{ textAlign: 'left' }}>
                    <strong>Tag clusters as RHACM hub clusters</strong>
                  </CardTitle>
                  <CardBody style={{ textAlign: 'left' }}>
                    <p>
                      Manually tag hub clusters on the All clusters page to match your RHACM cluster
                      structure.
                    </p>
                    <ExternalLink
                      href={ACM_HUB_DOCUMENTATION_LINKS.ALREADY_HAVE_CLUSTER_HUB_IN_RHACM}
                    >
                      Learn more about tagging hub clusters
                    </ExternalLink>
                  </CardBody>
                </Card>
              </ExpandableSection>
            </StackItem>
          </Stack>
        </EmptyStateActions>
      </EmptyStateFooter>
    </EmptyState>
  );
};

export default AcmHubEmptyState;
