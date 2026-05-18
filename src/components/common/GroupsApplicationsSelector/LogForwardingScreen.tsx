import React from 'react';

import { Content, Form, Stack, StackItem, Title } from '@patternfly/react-core';

import links from '~/common/installLinks.mjs';
import { stepId, stepNameById } from '~/components/clusters/wizards/rosa/rosaWizardConstants';
import ExternalLink from '~/components/common/ExternalLink';

import { AmazonS3LogForwarding } from './AmazonS3LogForwarding';
import { CloudWatchLogForwarding } from './CloudWatchLogForwarding';

export function LogForwardingScreen() {
  return (
    <Form
      onSubmit={(event) => {
        event.preventDefault();
      }}
    >
      <Stack hasGutter>
        <StackItem>
          <Title headingLevel="h2">
            {stepNameById[stepId.CLUSTER_ADDITIONAL_SETTINGS__LOG_FORWARDING]}
          </Title>
        </StackItem>
        <StackItem>
          <Content component="p">
            Configure log forwarding now to store and analyze your control plane logs, or set this
            up later in the console.{' '}
            <ExternalLink href={links.LOG_FORWARDING_DOCS}>Learn more</ExternalLink>
          </Content>
        </StackItem>
        <StackItem>
          <AmazonS3LogForwarding />
        </StackItem>
        <StackItem>
          <CloudWatchLogForwarding />
        </StackItem>
      </Stack>
    </Form>
  );
}
