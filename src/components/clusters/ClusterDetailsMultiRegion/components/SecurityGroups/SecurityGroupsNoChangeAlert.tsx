import React from 'react';

import { Alert, AlertActionLink } from '@patternfly/react-core';

import links from '~/common/installLinks.mjs';

const SecurityGroupsNoChangeAlert = ({
  isRosa,
  isHypershift,
}: {
  isRosa?: boolean;
  isHypershift: boolean;
}) => {
  const rosaSecurityGroupsLink = isHypershift
    ? links.ROSA_SECURITY_GROUPS
    : links.ROSA_CLASSIC_SECURITY_GROUPS;
  return (
    <Alert
      variant="info"
      isInline
      title="You cannot add or edit security groups to the machine pool nodes after they are created."
      actionLinks={
        <>
          <AlertActionLink
            component="a"
            href={isRosa ? rosaSecurityGroupsLink : links.OSD_SECURITY_GROUPS}
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
};

export default SecurityGroupsNoChangeAlert;
