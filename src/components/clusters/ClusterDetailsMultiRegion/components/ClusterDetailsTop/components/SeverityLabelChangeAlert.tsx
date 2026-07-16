import React from 'react';

import { Alert, List, ListItem, Stack, StackItem } from '@patternfly/react-core';

import supportLinks from '~/common/supportLinks.mjs';
import ExternalLink from '~/components/common/ExternalLink';

const SeverityLabelChangeAlert = () => (
  <Alert
    className="pf-v6-u-mt-md"
    title="To ensure consistency across our platform, we are updating the severity labels of the service log messages."
    variant="info"
    isInline
  >
    <Stack hasGutter>
      <StackItem>Effective Sept 28th 2026, the labels will change as follows:</StackItem>
      <StackItem>
        <List>
          <ListItem>Major ➔ Important</ListItem>
          <ListItem>Warning ➔ Moderate</ListItem>
          <ListItem>Info ➔ Low</ListItem>
          <ListItem>Critical and Debug labels will remain the same</ListItem>
        </List>
      </StackItem>
      <StackItem>
        What you need to do: While this will automatically update in your UI, if you have any
        external automations, scripts, or monitoring alerts that search for the old label names,
        please update them to recognize the new labels to prevent disruptions.{' '}
        <ExternalLink href={supportLinks.SEVERITY_LABEL_CHANGE_KB}>Learn more.</ExternalLink>
      </StackItem>
    </Stack>
  </Alert>
);

export default SeverityLabelChangeAlert;
