import React from 'react';

import { Content, ContentVariants, Stack, StackItem, Title } from '@patternfly/react-core';

import installLinks from '~/common/installLinks.mjs';
import ExternalLink from '~/components/common/ExternalLink';
import { YoutubePlayer } from '~/components/common/YoutubePlayer/YoutubePlayer';

const AdvancedClusterManagementDrawerPanelBody = (
  <Stack hasGutter className="drawer-panel-content-body">
    <StackItem>
      <Content>
        <Content component={ContentVariants.p}>
          Red Hat Advanced Cluster Management for Kubernetes provides visibility of your entire
          Kubernetes fleet with built-in governance and application lifecycle management.
        </Content>
      </Content>
    </StackItem>

    <StackItem>
      <YoutubePlayer videoID="iivhwFaDHKg" />
      <Content>
        <Content component={ContentVariants.small}>Video duration 1:57</Content>
      </Content>
    </StackItem>

    <StackItem>
      <Title headingLevel="h3" data-testid="drawer-panel-content-benefits-title">
        Benefits
      </Title>
    </StackItem>
    <StackItem>
      <Content>
        <Content component="ul" isPlainList>
          <Content component="li">
            <strong>Reduce operational costs for multicloud environments:</strong> It takes a lot of
            manual effort to manage multiple Kubernetes clusters running across multiple clouds.
            Each cluster has to be individually deployed, upgraded, and configured for security,
            increasing operational costs as organizations add more clusters. Bringing all of the
            clusters into a single management environment reduces operational cost, makes the
            environment consistent, and removes the need to manually manage individual clusters.
          </Content>
          <Content component="li">
            <strong>Accelerate software development:</strong> Development teams want to focus on
            building software, not implementation details. Self-service provisioning of
            preconfigured resources to any environment with Red Hat Advanced Cluster Management
            frees developers to deliver software.
          </Content>
          <Content component="li">
            <strong>Increase application availability:</strong> Applications can be deployed to
            various clusters and locations using placement rules for availability or capacity
            reasons. If a cluster becomes unavailable, Red Hat Advanced Cluster Management will
            automatically deploy the application to a cluster that matches the placement rules.
          </Content>
          <Content component="li">
            <strong>Simplify IT operations:</strong> IT departments can enable self-service
            capabilities, allowing departments to request clusters from a catalog. Those clusters
            automatically become manageable by Red Hat Advanced Cluster Management. As a result,
            central IT is no longer an impediment in delivering environments to the applications
            teams.
          </Content>
          <Content component="li">
            <strong>More easily meet governance requirements:</strong> Governance policies can be
            written and enforced consistently in each environment.
          </Content>
        </Content>
      </Content>
    </StackItem>

    <StackItem className="drawer-panel-content__learn-more">
      <ExternalLink
        data-testid="learn-more-about-advanced-cluster-management-drawer-panel-content-link"
        href={installLinks.RH_ACM}
      >
        Learn more about Advanced Cluster Management for Kubernetes
      </ExternalLink>
    </StackItem>
  </Stack>
);

export { AdvancedClusterManagementDrawerPanelBody };
