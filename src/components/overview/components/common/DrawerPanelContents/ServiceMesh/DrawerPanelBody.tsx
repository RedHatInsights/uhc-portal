import React from 'react';

import { Content, ContentVariants, Stack, StackItem, Title } from '@patternfly/react-core';

import installLinks from '~/common/installLinks.mjs';
import ExternalLink from '~/components/common/ExternalLink';
import { YoutubePlayer } from '~/components/common/YoutubePlayer/YoutubePlayer';

const ServiceMeshDrawerPanelBody = (
  <Stack hasGutter className="drawer-panel-content-body">
    <StackItem>
      <Content>
        <Content component={ContentVariants.p}>
          Connect, manage, and observe microservices-based applications in a uniform way.
        </Content>
        <Content component={ContentVariants.p}>
          Red Hat OpenShift Service Mesh is based on the open source{' '}
          <ExternalLink href={installLinks.RH_ISTIO} noIcon>
            Istio{' '}
          </ExternalLink>
          project and is pre-validated and fully supported to work on Red Hat OpenShift. It can be
          installed with the{' '}
          <ExternalLink href="https://github.com/kiali/kiali-operator" noIcon>
            Kiali{' '}
          </ExternalLink>
          dashboard for managing service mesh, while integrating with{' '}
          <ExternalLink href={installLinks.RH_OPENSHIFT_OBSERVABILITY} noIcon>
            Red Hat OpenShift Observability{' '}
          </ExternalLink>
          for managing logging, metrics, and distributed tracing.
        </Content>
      </Content>
    </StackItem>
    <StackItem>
      <YoutubePlayer videoID="6nyVOg2BZek" />
      <Content>
        <Content component={ContentVariants.small}>Video duration 3:08</Content>
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
            <b>Identify and diagnose problems easier:</b> Red Hat OpenShift Service Mesh adds
            tracing and visualization so you have a greater understanding of what is happening in
            and across applications as they are running, from start to finish.
          </Content>
          <Content component="li">
            <b>Implement secure zero-trust application networks:</b> Secure your application network
            using Red Hat OpenShift Service Mesh’s tools, including automated identity and
            certificate management, end-to-end mTLS encryption, and fine-grain application specific
            network policies.
          </Content>
          <Content component="li">
            <b>Focus on business value:</b> Give developers time back to delivering business value
            and writing application code.
          </Content>
          <Content component="li">
            <b>Enable traffic management capabilities:</b> Red Hat OpenShift Service Mesh provides a
            control plane and infrastructure that transparently enables traffic management
            capabilities, without requiring developers to make changes to their application code.
            Traffic management policies are language agnostic, making it easy to develop and run
            distributed architectures.
          </Content>
        </Content>
      </Content>
    </StackItem>
    <StackItem>
      <Title headingLevel="h3">Use cases:</Title>
    </StackItem>
    <StackItem>
      <Content>
        <Content component={ContentVariants.p}>
          Deploy your applications to multiple platforms, including:
        </Content>
        <Content component="ul">
          {[
            'Canary releases',
            'Access control',
            'End-to-end mTLS encryption',
            'A/B testing',
            'Service-to-service authentication',
            'Failure recovery',
          ].map((item) => (
            <Content component="li" data-testid="use-cases-list-item" key={item}>
              {item}
            </Content>
          ))}
        </Content>
      </Content>
    </StackItem>
    <StackItem className="drawer-panel-content__learn-more">
      <ExternalLink
        data-testid="learn-more-about-red-hat-openshift-service-mesh-drawer-panel-content-link"
        href="https://catalog.redhat.com/software/container-stacks/detail/5ec53e8c110f56bd24f2ddc4"
      >
        Learn more about Red Hat OpenShift Service Mesh
      </ExternalLink>
    </StackItem>
  </Stack>
);

export { ServiceMeshDrawerPanelBody };
