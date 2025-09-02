import React from 'react';

import { Content, ContentVariants, Stack, StackItem, Title } from '@patternfly/react-core';

import ExternalLink from '~/components/common/ExternalLink';

const PipelinesDrawerPanelBody = (
  <Stack hasGutter className="drawer-panel-content-body">
    <StackItem>
      <Content>
        <Content component={ContentVariants.p}>
          Speed up the delivery of your applications with advanced continuous integration (CI)
          workflows and automation.
        </Content>
        <Content component={ContentVariants.p}>
          Built on the open source Tekton framework, Red Hat OpenShift Pipelines provides a
          continuous integration and continuous deployment (CI/CD) experience through tight
          integration with OpenShift and Red Hat developer tools.
        </Content>
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
            <b>React quickly with the market:</b> Continuous integration / continuous deployment
            (CI/CD) allows you to deliver new products and features faster.
          </Content>
          <Content component="li">
            <b>Automate application delivery:</b> Create pipelines of activity from simple,
            repeatable steps.
          </Content>
          <Content component="li">
            <b>Ensure security:</b> Kubernetes role-based access control (RBAC) and security model
            ensures security consistently across pipelines and workloads.
          </Content>
          <Content component="li">
            <b>Adapt to your customers’ needs:</b> You’ll have full control of your application
            lifecycle to support your exact requirements.
          </Content>
        </Content>
      </Content>
    </StackItem>
    <StackItem>
      <Title headingLevel="h3" data-testid="drawer-panel-content-platforms-title">
        Platforms
      </Title>
    </StackItem>
    <StackItem>
      <Content>
        <Content component={ContentVariants.p}>
          Deploy your applications to multiple platforms, including:
        </Content>
        <Content component="ul">
          {['Kubernetes', 'Serverless', 'Virtual machines'].map((item) => (
            <Content component="li" data-testid="platforms-list-item">
              {item}
            </Content>
          ))}
        </Content>
      </Content>
    </StackItem>
    <StackItem className="drawer-panel-content__learn-more">
      <ExternalLink
        data-testid="learn-more-about-red-hat-openshift-pipelines-drawer-panel-content-link"
        href="https://catalog.redhat.com/software/container-stacks/detail/5ec54a4628834587a6b85ca5"
      >
        Learn more about Red Hat OpenShift Pipelines
      </ExternalLink>
    </StackItem>
  </Stack>
);

export { PipelinesDrawerPanelBody };
