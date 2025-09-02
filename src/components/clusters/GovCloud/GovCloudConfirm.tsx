import * as React from 'react';

import { EmptyState, EmptyStateBody, Icon } from '@patternfly/react-core';
import { CheckCircleIcon } from '@patternfly/react-icons/dist/esm/icons/check-circle-icon';

const EmptyIcon = (props: any) => (
  <Icon {...props} status="success">
    <CheckCircleIcon />
  </Icon>
);

const GovCloudConfirm = () => (
  <EmptyState headingLevel="h4" icon={EmptyIcon} titleText="Submission confirmation">
    <EmptyStateBody>
      Thank you for completing the GovCloud access form.
      <br />
      You will receive an email in 3-5 business days about the next steps.
    </EmptyStateBody>
  </EmptyState>
);

export default GovCloudConfirm;
