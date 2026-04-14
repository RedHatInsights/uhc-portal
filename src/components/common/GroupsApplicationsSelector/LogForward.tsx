import React from 'react';

/* Tooltip and help copy: sync with `logForwardingTooltipCopy.ts` from product Google Doc (ID 1D1urM8EA2n0iwbfKZCeG0dzNsWEwQnKPv1sWv9_bXxA). */
import { Content, Form, Stack, StackItem, Title } from '@patternfly/react-core';

import { stepId, stepNameById } from '~/components/clusters/wizards/rosa/rosaWizardConstants';
import ExternalLink from '~/components/common/ExternalLink';

import { AmazonS3LogForwarding } from './AmazonS3LogForwarding';
import { CloudWatchLogForwarding } from './CloudWatchLogForwarding';

const LOG_FORWARDING_DOCS_HREF =
  'https://docs.openshift.com/rosa/cluster_admin/rosa-configuring-log-forwarding.html';

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
            <ExternalLink href={LOG_FORWARDING_DOCS_HREF}>Learn more</ExternalLink>
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
