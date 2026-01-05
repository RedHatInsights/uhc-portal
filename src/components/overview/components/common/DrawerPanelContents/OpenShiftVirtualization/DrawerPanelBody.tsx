import React from 'react';

import { Content, ContentVariants, Stack, StackItem, Title } from '@patternfly/react-core';

import installLinks from '~/common/installLinks.mjs';
import ExternalLink from '~/components/common/ExternalLink';
import { YoutubePlayer } from '~/components/common/YoutubePlayer/YoutubePlayer';

const OpenShiftVirtualizationPanelBody = (
  <Stack hasGutter className="drawer-panel-content-body">
    <StackItem>
      <Content>
        <Content component={ContentVariants.p}>
          Transition your virtual machines to a modern hybrid cloud application platform. Run your
          VMs alongside containers using the same set of tools and processes.
        </Content>
      </Content>
    </StackItem>

    <StackItem>
      <YoutubePlayer videoID="ZplrufNY9cY" />
      <Content>
        <Content component={ContentVariants.small}>Video duration: 2:08</Content>
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
            <strong>Faster deployment times:</strong> When you run your workloads on a consistent
            platform, you streamline application development and deployment, accelerating time to
            market.
          </Content>
          <Content component="li">
            <strong>Enhanced developer productivity:</strong> Harness the simplicity and speed of a
            modern hybrid application platform and enable self-service.
          </Content>
          <Content component="li">
            <strong>Manage from 1 platform:</strong> With a single platform for VMs, containers, and
            serverless workloads, you can simplify your operations and standardize infrastructure
            deployment.
          </Content>
        </Content>
      </Content>
    </StackItem>
    <StackItem>
      <Title headingLevel="h3" data-testid="drawer-panel-content-capabilities-title">
        Migrating your VMs
      </Title>
    </StackItem>
    <StackItem>
      <Content>
        <Content component="ul" isPlainList>
          <Content component="li">
            You can quickly and easily migrate your VMs from VMware vSphere to OpenShift
            Virtualization using the Migration Toolkit for Virtualization (MTV). You must have
            OpenShift Virtualization Operator installed to use MTV.
          </Content>
        </Content>
      </Content>
    </StackItem>
    <StackItem className="drawer-panel-content__learn-more">
      <ExternalLink
        data-testid="learn-more-about-redhat-openshift-virtualization-drawer-panel-content-link"
        href={installLinks.MTV_RESOURCES}
      >
        Learn more about Migration Toolkit for Virtualization
      </ExternalLink>
    </StackItem>

    <StackItem>
      <Title headingLevel="h3" data-testid="drawer-panel-content-clouds-and-platforms-title">
        Manage your cluster and applications
      </Title>
    </StackItem>
    <StackItem>
      <Content>
        <Content component={ContentVariants.p}>
          Using Red Hat Advanced Cluster Management for Kubernetes (RHACM), you can manage any
          Kubernetes cluster in your fleet. Using the self-service cluster deployment that
          automatically delivers applications, you can reduce operational costs.
        </Content>
      </Content>
    </StackItem>

    <StackItem className="drawer-panel-content__learn-more">
      <ExternalLink
        data-testid="learn-more-about-redhat-acm-drawer-panel-content-link"
        href={installLinks.RH_ACM}
      >
        Learn more about Red Hat Advanced Cluster Management for Kubernetes
      </ExternalLink>
    </StackItem>
  </Stack>
);

export { OpenShiftVirtualizationPanelBody };
