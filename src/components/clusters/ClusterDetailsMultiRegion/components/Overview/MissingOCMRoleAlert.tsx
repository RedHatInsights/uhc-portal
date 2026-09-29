import React from 'react';

import { Alert } from '@patternfly/react-core';

import supportLinks from '~/common/supportLinks.mjs';
import ExternalLink from '~/components/common/ExternalLink';
import { useFetchGetOCMRole } from '~/queries/common/useFetchGetOCMRole';

export const MissingOCMRoleAlertContent = () => (
  <Alert variant="warning" isInline title="Missing or unlinked OCM role">
    The organization that owns this cluster does not currently have an OCM Role configured for the
    AWS account the cluster is deployed to. The OCM role is required by October 1, 2026.{' '}
    <ExternalLink href={supportLinks.OCM_ROLE_KB}>Learn more.</ExternalLink>
  </Alert>
);

type MissingOCMRoleAlertProps = {
  awsAccountId: string;
};

export const MissingOCMRoleAlert = ({ awsAccountId }: MissingOCMRoleAlertProps) => {
  const { error } = useFetchGetOCMRole(awsAccountId);

  if (error?.errorCode !== 404) {
    return null;
  }

  return <MissingOCMRoleAlertContent />;
};
