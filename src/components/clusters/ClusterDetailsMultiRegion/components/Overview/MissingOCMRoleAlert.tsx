import React from 'react';

import { Alert, Button, Content, ContentVariants } from '@patternfly/react-core';

import supportLinks from '~/common/supportLinks.mjs';
import ExternalLink from '~/components/common/ExternalLink';
import { refetchGetOCMRole, useFetchGetOCMRole } from '~/queries/common/useFetchGetOCMRole';

type MissingOCMRoleAlertContentProps = {
  onRefresh: () => void;
  isRefreshPending?: boolean;
};

export const MissingOCMRoleAlertContent = ({
  onRefresh,
  isRefreshPending,
}: MissingOCMRoleAlertContentProps) => (
  <Alert variant="warning" isInline title="Missing or unlinked OCM role">
    <Content style={{ fontSize: 'var(--pf-t--global--font--size--sm)' }}>
      <Content component={ContentVariants.p}>
        The organization that owns this cluster does not currently have an OCM Role configured for
        the AWS account the cluster is deployed to. The OCM role is required by October 1, 2026.{' '}
        <ExternalLink href={supportLinks.OCM_ROLE_KB}>Learn more.</ExternalLink>
      </Content>
      <Content
        component={ContentVariants.p}
        style={{ marginTop: 'var(--pf-t--global--spacer--sm)' }}
      >
        After linking your OCM role, check again:
        <Button
          variant="link"
          isInline
          isLoading={isRefreshPending}
          isDisabled={isRefreshPending}
          onClick={onRefresh}
          style={{ marginLeft: 'var(--pf-t--global--spacer--sm)' }}
        >
          Refresh OCM role
        </Button>
      </Content>
    </Content>
  </Alert>
);

type MissingOCMRoleAlertProps = {
  awsAccountId: string;
};

export const MissingOCMRoleAlert = ({ awsAccountId }: MissingOCMRoleAlertProps) => {
  const { error } = useFetchGetOCMRole(awsAccountId);
  const [isRefreshPending, setIsRefreshPending] = React.useState(false);

  if (error?.errorCode !== 404) {
    return null;
  }

  const handleRefresh = async () => {
    setIsRefreshPending(true);
    try {
      await refetchGetOCMRole(awsAccountId);
    } finally {
      setIsRefreshPending(false);
    }
  };

  return (
    <MissingOCMRoleAlertContent onRefresh={handleRefresh} isRefreshPending={isRefreshPending} />
  );
};
