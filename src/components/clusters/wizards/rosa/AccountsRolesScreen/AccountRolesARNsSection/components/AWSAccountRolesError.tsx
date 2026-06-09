import React from 'react';

import { Alert, Button, Content, ContentVariants } from '@patternfly/react-core';

import { ROSA_HOSTED_CLI_MIN_VERSION } from '~/components/clusters/wizards/rosa/rosaConstants';
import ErrorBox from '~/components/common/ErrorBox';
import InstructionCommand from '~/components/common/InstructionCommand';
import { GlobalState } from '~/redux/stateTypes';

import { AwsRoleErrorAlert } from '../../AwsRoleErrorAlert';
import { RosaCliCommand } from '../../constants/cliCommands';

type Props = {
  getAWSAccountRolesARNsResponse: GlobalState['rosaReducer']['getAWSAccountRolesARNsResponse'];
  isHypershiftSelected: boolean;
  isMissingOCMRole: boolean;
  isNoConsoleRole?: boolean;
  onRefreshOCMRole: () => void;
  isOCMRolePending?: boolean;
};

function AWSAccountRolesError({
  getAWSAccountRolesARNsResponse,
  isHypershiftSelected,
  isMissingOCMRole,
  isNoConsoleRole,
  onRefreshOCMRole,
  isOCMRolePending,
}: Props) {
  if (isNoConsoleRole) {
    return (
      <Alert variant="danger" isInline title="OCM role has limited permissions">
        <Content className="pf-v6-u-font-size-sm">
          <Content component={ContentVariants.p}>
            The OCM Role linked to your AWS account was created without console permissions. Cluster
            creation through the console is not supported with this configuration. To create cluster
            using the Red Hat console, update your ocm role with appropriate permissions using the
            ROSA CLI:
          </Content>
          <InstructionCommand textAriaLabel="Copyable rosa create ocm-role command">
            {RosaCliCommand.OcmRole}
          </InstructionCommand>
          <a href="TODO" target="_blank" rel="noopener noreferrer">
            Learn more about OCM role permissions
          </a>
          <Content component={ContentVariants.p} className="pf-v6-u-mt-sm">
            After updating your OCM role, check again:
            <Button
              variant="link"
              isInline
              isLoading={isOCMRolePending}
              isDisabled={isOCMRolePending}
              onClick={onRefreshOCMRole}
              className="pf-v6-u-ml-sm"
            >
              Refresh OCM role
            </Button>
          </Content>
        </Content>
      </Alert>
    );
  }

  if (getAWSAccountRolesARNsResponse.error) {
    const hasFailedToAssumeRoleError =
      getAWSAccountRolesARNsResponse.internalErrorCode === 'CLUSTERS-MGMT-400';

    const alertTitle = hasFailedToAssumeRoleError
      ? 'Cannot detect an OCM role'
      : 'Error getting AWS account ARNs';

    if (hasFailedToAssumeRoleError || isMissingOCMRole)
      return <AwsRoleErrorAlert title={alertTitle} targetRole="ocm" />;

    return <ErrorBox message={alertTitle} response={getAWSAccountRolesARNsResponse} />;
  }

  if (isHypershiftSelected)
    return (
      <Alert isInline variant="danger" title="Some account roles ARNs were not detected.">
        <br />
        Create the account roles using the following command in the ROSA CLI
        <InstructionCommand textAriaLabel="Copyable ROSA login command">
          {RosaCliCommand.CreateAccountRolesHCP}
        </InstructionCommand>
        <br />
        After running the command, you may need to refresh using the <strong>
          Refresh ARNs
        </strong>{' '}
        button below to populate the ARN fields.
        <p>You must use ROSA CLI version {ROSA_HOSTED_CLI_MIN_VERSION} or above.</p>
      </Alert>
    );

  return (
    <AwsRoleErrorAlert title="Some account roles ARNs were not detected" targetRole="account" />
  );
}

export default AWSAccountRolesError;
