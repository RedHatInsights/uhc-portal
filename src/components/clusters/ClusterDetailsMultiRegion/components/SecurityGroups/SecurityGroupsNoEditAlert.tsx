import React from 'react';

import { Alert, AlertActionLink } from '@patternfly/react-core';

import links from '~/common/installLinks.mjs';

type SecurityGroupsNoEditAlertProps = {
  isHypershift: boolean;
};
const SecurityGroupsNoEditAlert = ({ isHypershift = false }: SecurityGroupsNoEditAlertProps) => (
  <Alert
    variant="info"
    isInline
    title={
      isHypershift
        ? 'You cannot add or edit security groups associated with machine pools that were created during cluster creation.'
        : 'You cannot add or edit security groups associated with the control plane nodes, infrastructure nodes, or machine pools that were created by default during cluster creation.'
    }
    actionLinks={
      <>
        <AlertActionLink
          component="a"
          href={isHypershift ? links.ROSA_SECURITY_GROUPS : links.ROSA_CLASSIC_SECURITY_GROUPS}
          target="_blank"
        >
          View more information
        </AlertActionLink>
        <AlertActionLink component="a" href={links.AWS_CONSOLE_SECURITY_GROUPS} target="_blank">
          AWS security groups console
        </AlertActionLink>
      </>
    }
  />
);

export default SecurityGroupsNoEditAlert;
