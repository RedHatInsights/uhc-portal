import React from 'react';

import { Alert, Icon } from '@patternfly/react-core';
import { ExternalLinkAltIcon } from '@patternfly/react-icons/dist/esm/icons/external-link-alt-icon';

import links from '~/common/installLinks.mjs';

type BillingModelAlertProps = {
  title: string;
};

const BillingModelAlert = ({ title }: BillingModelAlertProps) => (
  <Alert
    id="subscription-settings-cluster-billing-model-alert"
    variant="info"
    isInline
    title={title}
  >
    <a href={links.OCM_DOCS_SUBSCRIPTIONS} target="_blank" rel="noreferrer noopener">
      Learn more about subscriptions{' '}
      <Icon size="sm" isInline>
        <ExternalLinkAltIcon />
      </Icon>
    </a>
  </Alert>
);

export default BillingModelAlert;
