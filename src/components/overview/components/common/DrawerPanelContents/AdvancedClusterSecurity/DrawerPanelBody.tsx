import React from 'react';

import { Content, ContentVariants, Stack, StackItem, Title } from '@patternfly/react-core';

import ExternalLink from '~/components/common/ExternalLink';
import { YoutubePlayer } from '~/components/common/YoutubePlayer/YoutubePlayer';

const AdvancedClusterSecurityDrawerPanelBody = (
  <Stack hasGutter className="drawer-panel-content-body">
    <StackItem>
      <Content>
        <Content component={ContentVariants.p}>
          Security shouldn’t be an afterthought. Build, deploy, and run your cloud-native
          applications with more security and protect your platform using Advanced Cluster Security
          for Kubernetes.
        </Content>
        <Content component={ContentVariants.p}>
          Conduct security sooner by automating DevSecOps and mitigating security issues early in
          the container lifecycle.
        </Content>
      </Content>
    </StackItem>

    <StackItem>
      <YoutubePlayer videoID="lFBFW3HmgsA" />
      <Content>
        <Content component={ContentVariants.small}>Video duration 2:21</Content>
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
            <b>Lower operational cost:</b> Reduce cost by catching and fixing a security issue in
            the development stage.
          </Content>
          <Content component="li">
            <b>Reduce operational risk:</b> Align security and infrastructure to reduce application
            downtime using built-in Kubernetes capabilities.
          </Content>
          <Content component="li">
            <b>Ensure compliance standards:</b> Enable compliance with built-in checks for critical
            security standards and regulations.
          </Content>
          <Content component="li">
            <b>Find threats quicker:</b> Detect and respond to threats, such as:
          </Content>
          <Content component="ul">
            {[
              'Unauthorized access',
              'Cryptomining',
              'Privilege escalation',
              'Lateral movement',
            ].map((item) => (
              <Content component="li" data-testid="threat-example-list-item">
                {item}
              </Content>
            ))}
          </Content>
        </Content>
      </Content>
    </StackItem>
    <StackItem>
      <Title headingLevel="h3" data-testid="drawer-panel-content-use-cases-title">
        Use cases:
      </Title>
    </StackItem>
    <StackItem>
      <Content>
        <Content component="ul" isPlainList>
          <Content component="li">
            <b>Supply chain security:</b> Provide developers with security context in their existing
            workflows and integrate security into your CI/CD pipelines and image registries.
          </Content>
          <Content component="li">
            <b>Infrastructure security:</b> Maintain security and prevent insecure access and
            authorizations with existing role-based access (RBAC) rules and hardening your
            organization’s environment.
          </Content>
          <Content component="li">
            <b>Workload security:</b> Prevent high-risk workloads from being deployed or run using
            out-of-the-box deploy-time and runtime policies and monitor known good behavior to
            configure custom policies and alerts.
          </Content>
        </Content>
      </Content>
    </StackItem>

    <StackItem className="drawer-panel-content__learn-more">
      <ExternalLink
        data-testid="learn-more-about-advanced-cluster-security-drawer-panel-content-link"
        href="https://catalog.redhat.com/software/container-stacks/detail/60eefc88ee05ae7c5b8f041c"
      >
        Learn more about Advanced Cluster Security
      </ExternalLink>
    </StackItem>
  </Stack>
);

export { AdvancedClusterSecurityDrawerPanelBody };
