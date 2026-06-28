import React from 'react';

import { Alert, Button, Content, ContentVariants } from '@patternfly/react-core';

type Props = {
  onRefresh: () => void;
  isRefreshPending?: boolean;
  className?: string;
};

export const NoConsoleRoleAlert = ({ onRefresh, isRefreshPending, className }: Props) => (
  <Alert variant="danger" isInline title="OCM role has limited permissions" className={className}>
    <Content style={{ fontSize: 'var(--pf-t--global--font--size--sm)' }}>
      <Content component={ContentVariants.p}>
        The OCM role linked to your AWS account was created without console permissions. Cluster
        creation through the console is not supported with this configuration. To create a cluster
        using the Red Hat console, update your OCM role with appropriate permissions using the ROSA
        CLI.{' '}
        <a
          href="https://docs.redhat.com/en/documentation/red_hat_openshift_service_on_aws/4/html/prepare_your_environment/rosa-hcp-prepare-iam-roles-resources#rosa-sts-ocm-roles-and-permissions-iam-basic-role_prepare-role-resources"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn more about OCM role permissions
        </a>
      </Content>
      <Content
        component={ContentVariants.p}
        style={{ marginTop: 'var(--pf-t--global--spacer--sm)' }}
      >
        After updating your OCM role, check again:
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
