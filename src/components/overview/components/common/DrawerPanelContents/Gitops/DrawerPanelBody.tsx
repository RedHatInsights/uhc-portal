import React from 'react';

import { Content, ContentVariants, Stack, StackItem, Title } from '@patternfly/react-core';

import installLinks from '~/common/installLinks.mjs';
import ExternalLink from '~/components/common/ExternalLink';

const GitopsDrawerPanelBody = (
  <Stack hasGutter className="drawer-panel-content-body">
    <StackItem>
      <Content>
        <Content component={ContentVariants.p}>
          Consistently configure and deploy Kubernetes-based infrastructure and applications across
          clusters and development lifecycles using Red Hat OpenShift GitOps.
        </Content>
        <Content component={ContentVariants.p}>
          Red Hat OpenShift GitOps uses the open source project{' '}
          <ExternalLink href={installLinks.RH_ARGO_CD} noIcon>
            Argo CD{' '}
          </ExternalLink>
          as the declarative GitOps engine.
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
            <b>Enhance traceability and visibility:</b> Infrastructure and applications are stored
            and versioned in Git.
          </Content>
          <Content component="li">
            <b>Ensure consistency:</b> Red Hat OpenShift GitOps makes the configuration repositories
            the central element and ensures consistency in applications when you deploy them to
            different clusters in different environments, such as development, staging, and
            production.
          </Content>
          <Content component="li">
            <b>Automate infrastructure and deployment requirements:</b> Updates and changes are
            pushed through declarative code across environments.
          </Content>
        </Content>
      </Content>
    </StackItem>
    <StackItem className="drawer-panel-content__learn-more">
      <ExternalLink
        data-testid="learn-more-about-red-hat-openshift-gitops-drawer-panel-content-link"
        href="https://catalog.redhat.com/software/container-stacks/detail/5fb288c70a12d20cbecc6056"
      >
        Learn more about Red Hat OpenShift GitOps
      </ExternalLink>
    </StackItem>
  </Stack>
);

export { GitopsDrawerPanelBody };
