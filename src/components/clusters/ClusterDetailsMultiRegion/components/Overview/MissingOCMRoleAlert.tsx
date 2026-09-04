import React from 'react';

import { Alert } from '@patternfly/react-core';

import supportLinks from '~/common/supportLinks.mjs';
import ExternalLink from '~/components/common/ExternalLink';
import { useFetchGetOCMRole } from '~/queries/RosaWizardQueries/useFetchGetOCMRole';

const MISSING_OCM_ROLE_TITLE =
  'The organization that owns this cluster does not currently have an OCM Role configured for the AWS account the cluster is deployed to.';

export const MissingOCMRoleAlertContent = () => (
  <Alert variant="warning" isInline title={MISSING_OCM_ROLE_TITLE}>
    The OCM role is required by October 1, 2026. More details on this change and how to create and
    link the OCM Role can be found at:{' '}
    <ExternalLink href={supportLinks.OCM_ROLE_KB}>{supportLinks.OCM_ROLE_KB}</ExternalLink>
  </Alert>
);

type MissingOCMRoleAlertProps = {
  isRosaSts: boolean;
  awsAccountId?: string;
};

export const MissingOCMRoleAlert = ({ isRosaSts, awsAccountId }: MissingOCMRoleAlertProps) => {
  const { error } = useFetchGetOCMRole(isRosaSts ? awsAccountId ?? '' : '');

  if (!isRosaSts || error?.errorCode !== 404) {
    return null;
  }

  return <MissingOCMRoleAlertContent />;
};
