import React from 'react';

import { Button, Flex, FlexItem, Icon, Tooltip } from '@patternfly/react-core';
import RedoIcon from '@patternfly/react-icons/dist/esm/icons/redo-icon';
import { Caption, Table, Tbody, Td, Th, Thead, Tr } from '@patternfly/react-table';

import ErrorBox from '~/components/common/ErrorBox';
import {
  refetchBreakGlassCredentials,
  useFetchBreakGlassCredentials,
} from '~/queries/ClusterDetailsQueries/AccessControlTab/ExternalAuthenticationQueries/useFetchBreakGlassCredentials';
import { useCanUpdateBreakGlassCredentials } from '~/queries/ClusterDetailsQueries/useFetchActionsPermissions';
import { queryConstants } from '~/queries/queriesConstants';
import type { BreakGlassCredential } from '~/types/clusters_mgmt.v1';
import { BreakGlassCredentialStatus } from '~/types/clusters_mgmt.v1/enums';

import ButtonWithTooltip from '../../../../../common/ButtonWithTooltip';

import { BreakGlassCredentialDetailsModal } from './BreakGlassCredentialDetailsModal';
import { BreakGlassCredentialNewModal } from './BreakGlassCredentialNewModal';
import { RevokeBreakGlassCredentialsModal } from './RevokeBreakGlassCredentialsModal';

const credentialStatus = (status: BreakGlassCredentialStatus | undefined) => {
  let message: string;
  let helpText: string;
  switch (status) {
    case BreakGlassCredentialStatus.issued:
      message = 'Credentials issued';
      helpText = 'Credentials issued';
      break;
    case BreakGlassCredentialStatus.revoked:
      message = 'Revoked';
      helpText = 'Credentials have been manually revoked and are no longer valid.';
      break;
    case BreakGlassCredentialStatus.awaiting_revocation:
      message = 'Awaiting Revocation';
      helpText =
        'Credentials are awaiting revocation. No other revocation can occur until this completes.';
      break;
    case BreakGlassCredentialStatus.expired:
      message = 'Expired';
      helpText = 'Credentials have passed their expiration date and are no longer valid.';
      break;
    case BreakGlassCredentialStatus.created:
      message = 'Pending';
      helpText = 'Credentials have been created but not yet issued kubeconfig.';
      break;
    case BreakGlassCredentialStatus.failed:
      message = 'Failed';
      helpText = 'Unable to create credentials.';
      break;
    default:
      message = 'Unknown status';
      helpText = 'Unknown status';
      break;
  }

  return (
    <Tooltip content={helpText}>
      <Button icon={message} variant="plain" />
    </Tooltip>
  );
};
export const BreakGlassCredentialList = ({
  subscriptionID,
  clusterID,
  region,
}: {
  subscriptionID: string;
  clusterID: string;
  region?: string;
}) => {
  const [credential, setCredential] = React.useState<BreakGlassCredential | undefined>(undefined);
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [isNewModalOpen, setIsNewModalOpen] = React.useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = React.useState(false);

  const { canUpdateBreakGlassCredentials } = useCanUpdateBreakGlassCredentials(
    subscriptionID || '',
    queryConstants.FETCH_CLUSTER_DETAILS_QUERY_KEY,
  );

  const {
    data: credentialData,
    isLoading,
    isError,
    error,
    isFetching,
  } = useFetchBreakGlassCredentials(canUpdateBreakGlassCredentials, region, clusterID);

  const handleDelete = () => {
    setIsDeleteModalOpen(true);
  };
  const getCredentials = (user: BreakGlassCredential | undefined) => {
    setIsModalOpen(true);
    setCredential(user);
  };
  const columns = {
    id: 'ID',
    username: 'Username',
    expiration_timestamp: 'Expires',
    status: 'Status',
  };

  const disableNewCredReason =
    !canUpdateBreakGlassCredentials &&
    'You do not have permission to create new credentials for this cluster.';

  const isValidCred = () =>
    credentialData?.some(
      (cred) =>
        cred.status === BreakGlassCredentialStatus.issued &&
        !credentialData.some(
          (cred) => cred.status === BreakGlassCredentialStatus.awaiting_revocation,
        ),
    );

  const disableRevokeAllCredReason =
    (isLoading || !isValidCred()) &&
    'There must be at least one issued credential without a pending revocation.';

  const handleClose = () => {
    setIsNewModalOpen(false);
    refetchBreakGlassCredentials();
  };
  return (
    <>
      {isModalOpen && (
        <BreakGlassCredentialDetailsModal
          clusterID={clusterID || ''}
          region={region}
          onClose={() => {
            setIsModalOpen(false);
          }}
          credential={credential}
        />
      )}
      <BreakGlassCredentialNewModal
        clusterId={clusterID || ''}
        isNewModalOpen={isNewModalOpen}
        onClose={handleClose}
        credentialList={credentialData?.map((cred) => cred.username || '') || []}
        region={region}
      />
      <Flex>
        <FlexItem>
          <ButtonWithTooltip
            className="access-control-add"
            variant="secondary"
            onClick={() => setIsNewModalOpen(true)}
            disableReason={disableNewCredReason}
          >
            New credentials
          </ButtonWithTooltip>
        </FlexItem>
        {credentialData?.length && canUpdateBreakGlassCredentials ? (
          <>
            <FlexItem align={{ default: 'alignRight' }}>
              <ButtonWithTooltip
                className="access-control-add"
                variant="danger"
                onClick={handleDelete}
                disableReason={disableRevokeAllCredReason}
              >
                Revoke all credentials
              </ButtonWithTooltip>
            </FlexItem>
            <FlexItem>
              <ButtonWithTooltip
                className="access-control-add"
                variant="plain"
                onClick={() => refetchBreakGlassCredentials()}
                isDisabled={isLoading || isFetching}
              >
                <Icon>
                  <RedoIcon />
                </Icon>
              </ButtonWithTooltip>
            </FlexItem>
          </>
        ) : null}
      </Flex>
      {credentialData?.length ? (
        <Table aria-label="break glass credential table" variant="compact">
          <Caption>Assigned credentials</Caption>
          <Thead>
            <Tr>
              <Th>{columns.id}</Th>
              <Th>{columns.username}</Th>
              <Th>{columns.expiration_timestamp}</Th>
              <Th>{columns.status}</Th>
            </Tr>
          </Thead>
          <Tbody>
            {credentialData?.map((cred) => (
              <Tr key={cred.id}>
                <Td>{cred.id}</Td>
                <Td>{cred.username}</Td>
                <Td>{new Date(cred.expiration_timestamp as string).toLocaleString('en-CA')}</Td>
                <Td>
                  {cred.status === BreakGlassCredentialStatus.issued ? (
                    <Tooltip content="Download credentials to access cluster as admin.">
                      <Button variant="link" onClick={() => getCredentials(cred)}>
                        Credentials issued
                      </Button>
                    </Tooltip>
                  ) : (
                    credentialStatus((cred.status as BreakGlassCredentialStatus) || undefined)
                  )}
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      ) : null}
      {isError && (
        <ErrorBox
          message="A problem occurred while retrieving credentials"
          response={{
            errorMessage: error.error.errorMessage,
            operationID: error.error.operationID,
          }}
        />
      )}
      {isDeleteModalOpen && (
        <RevokeBreakGlassCredentialsModal
          clusterId={clusterID || ''}
          region={region}
          onClose={() => {
            setIsDeleteModalOpen(false);
            setCredential(undefined);
            // wait for 500 ms to allow the mutate to finish before refetching
            setTimeout(() => {
              refetchBreakGlassCredentials();
            }, 500);
          }}
        />
      )}
    </>
  );
};
