import React from 'react';

import { Alert, AlertActionLink } from '@patternfly/react-core';

import docLinks from '~/common/docLinks.mjs';
import installLinks from '~/common/installLinks.mjs';

const SecurityGroupsNoChangeAlert = ({
  isRosa,
  isHypershift,
}: {
  isRosa?: boolean;
  isHypershift?: boolean;
}) => {
  const rosaSecurityGroupsLink = isHypershift
    ? docLinks.ROSA_SECURITY_GROUPS
    : docLinks.ROSA_CLASSIC_SECURITY_GROUPS;
  return (
    <Alert
      variant="info"
      isInline
      title="You cannot add or edit security groups to the machine pool nodes after they are created."
      actionLinks={
        <>
          <AlertActionLink
            component="a"
            href={isRosa ? rosaSecurityGroupsLink : docLinks.OSD_SECURITY_GROUPS}
            target="_blank"
          >
            View more information
          </AlertActionLink>
          <AlertActionLink
            component="a"
            href={installLinks.AWS_CONSOLE_SECURITY_GROUPS}
            target="_blank"
          >
            AWS security groups console
          </AlertActionLink>
        </>
      }
    />
  );
};

export default SecurityGroupsNoChangeAlert;
