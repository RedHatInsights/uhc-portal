import React from 'react';

import {
  Button,
  Card,
  CardBody,
  EmptyState,
  EmptyStateActions,
  EmptyStateBody,
  EmptyStateFooter,
  EmptyStateVariant,
  List,
  ListItem,
  Title,
} from '@patternfly/react-core';
import { CubesIcon } from '@patternfly/react-icons/dist/esm/icons/cubes-icon';

import { ACM_HUB_DOCUMENTATION_LINKS } from '~/common/acmHubConstants';
import { Link } from '~/common/routing';
import ExternalLink from '~/components/common/ExternalLink';

import './AcmHubEmptyState.scss';

const AcmHubEmptyState: React.FC = () => (
  <EmptyState
    headingLevel="h4"
    icon={CubesIcon}
    titleText="No ACM Hub Clusters found"
    variant={EmptyStateVariant.lg}
    className="acm-hub-empty-state"
  >
    <EmptyStateBody>
      <Card>
        <CardBody>
          <Title headingLevel="h3" size="lg">
            Get started with Advanced Cluster Management
          </Title>
          <p>
            Red Hat Advanced Cluster Management for Kubernetes provides end-to-end visibility and
            control to manage your Kubernetes clusters. You can manage clusters across multiple
            clouds and on-premises environments from a single console.
          </p>

          <Title headingLevel="h4" size="md" className="pf-v6-u-mt-md">
            Key capabilities:
          </Title>
          <List className="acm-capabilities-list">
            <ListItem>
              <strong>Multi-cluster management:</strong> Centrally create, update, and delete
              Kubernetes clusters across multiple clouds
            </ListItem>
            <ListItem>
              <strong>Application lifecycle:</strong> Define applications and their lifecycles
              across multiple clusters
            </ListItem>
            <ListItem>
              <strong>Governance and compliance:</strong> Define, enforce, and audit security and
              configuration policies
            </ListItem>
            <ListItem>
              <strong>Observability:</strong> Gain insights into cluster health, performance, and
              resource utilization
            </ListItem>
          </List>

          <Title headingLevel="h4" size="md" className="pf-v6-u-mt-md">
            Getting started:
          </Title>
          <p>
            To designate a cluster as an ACM Hub, you first need to install Advanced Cluster
            Management on an OpenShift cluster. Once installed, you can manually tag the cluster as
            an ACM Hub from the cluster details page or cluster list.
          </p>
        </CardBody>
      </Card>
    </EmptyStateBody>
    <EmptyStateFooter>
      <Link to="/cluster-list">
        <Button variant="primary">View all clusters</Button>
      </Link>
      <EmptyStateActions>
        <ExternalLink href={ACM_HUB_DOCUMENTATION_LINKS.GETTING_STARTED}>
          <Button variant="link">Installation guide</Button>
        </ExternalLink>
        <ExternalLink href={ACM_HUB_DOCUMENTATION_LINKS.MULTICLUSTER_ENGINE}>
          <Button variant="link">Learn about Multicluster Engine</Button>
        </ExternalLink>
        <ExternalLink href={ACM_HUB_DOCUMENTATION_LINKS.INSTALLATION_GUIDE}>
          <Button variant="link">Documentation</Button>
        </ExternalLink>
        <Link to="/create">
          <Button variant="link">Create a new cluster</Button>
        </Link>
      </EmptyStateActions>
    </EmptyStateFooter>
  </EmptyState>
);

export default AcmHubEmptyState;
