import React from 'react';

import PageHeader from '@patternfly/react-component-groups/dist/dynamic/PageHeader';
import { Content, Divider, Flex, FlexItem, Stack, StackItem } from '@patternfly/react-core';

import Breadcrumbs from '../common/Breadcrumbs';
import ExternalLink from '../common/ExternalLink';

import OpenshiftIcon from './RosaHandsOnIcons/OpenshiftIcon';
import { rosaHandsOnLinks } from './constants';

const RosaHandsOnPageHeader = () => (
  <PageHeader
    title=""
    subtitle=""
    breadcrumbs={
      <Breadcrumbs
        path={[
          { label: 'Overview', path: `/overview` },
          {
            label: 'Red Hat OpenShift Service on AWS (ROSA)',
            path: '/overview/rosa',
          },
          { label: 'Hands-on Experience' },
        ]}
      />
    }
  >
    <Flex direction={{ default: 'row' }} flexWrap={{ default: 'nowrap' }}>
      <FlexItem alignSelf={{ default: 'alignSelfFlexStart' }}>
        <OpenshiftIcon />
      </FlexItem>
      <Divider orientation={{ default: 'vertical' }} />
      <FlexItem>
        <Stack hasGutter>
          <StackItem>
            <Content>
              <Content component="h2">Red Hat OpenShift Service on AWS Hands-on Experience</Content>
            </Content>
          </StackItem>
          <StackItem>
            <Content component="p">
              Red Hat OpenShift Service on AWS (ROSA) is a fully-managed turnkey application
              platform that allows organizations to quickly build, deploy, and scale applications in
              a native AWS environment. With one click, start your free 8-hour hands-on experience
              in a ROSA cluster.
            </Content>
          </StackItem>
          <StackItem>
            <ExternalLink href={rosaHandsOnLinks.slackChannel}>
              Have a question? Join our slack community
            </ExternalLink>
          </StackItem>
        </Stack>
      </FlexItem>
    </Flex>
  </PageHeader>
);

export default RosaHandsOnPageHeader;
