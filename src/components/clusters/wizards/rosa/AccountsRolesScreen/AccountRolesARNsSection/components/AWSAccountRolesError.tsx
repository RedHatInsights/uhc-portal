import React from 'react';

import { Alert } from '@patternfly/react-core';

import { NoConsoleRoleAlert } from '~/components/clusters/wizards/rosa/common/NoConsoleRoleAlert';
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
  isOCMRoleError?: boolean;
  onRefreshOCMRole: () => void;
  isOCMRolePending?: boolean;
};

function AWSAccountRolesError({
  getAWSAccountRolesARNsResponse,
  isHypershiftSelected,
  isMissingOCMRole,
  isNoConsoleRole,
  isOCMRoleError,
  onRefreshOCMRole,
  isOCMRolePending,
}: Props) {
  if (isNoConsoleRole) {
    return <NoConsoleRoleAlert onRefresh={onRefreshOCMRole} isRefreshPending={isOCMRolePending} />;
  }

  if (isOCMRoleError) {
    return <AwsRoleErrorAlert title="Cannot detect an OCM role" targetRole="ocm" />;
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
