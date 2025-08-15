import * as React from 'react';

import { Button, Content, EmptyState, EmptyStateBody, Icon } from '@patternfly/react-core';
import { ExclamationCircleIcon } from '@patternfly/react-icons/dist/esm/icons/exclamation-circle-icon';

const EmptyIcon = (props: any) => (
  <Icon {...props} status="danger">
    <ExclamationCircleIcon />
  </Icon>
);

const GovCloudPrereqErrorPage = ({ message }: { message: string }) => (
  <EmptyState
    headingLevel="h4"
    icon={EmptyIcon}
    titleText="Failed to verify GovCloud prerequisites"
  >
    <EmptyStateBody>
      <Content className="pf-v6-u-mb-md">{message}</Content>
      <Button variant="link" iconPosition="right" isInline onClick={() => window.location.reload()}>
        Try refreshing the page.
      </Button>
    </EmptyStateBody>
  </EmptyState>
);

export default GovCloudPrereqErrorPage;
