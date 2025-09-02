import React from 'react';

import {
  Card,
  EmptyState,
  EmptyStateBody,
  Flex,
  FlexItem,
  Icon,
  PageSection,
  Spinner,
  Title,
  Toolbar,
  ToolbarContent,
  ToolbarGroup,
  ToolbarItem,
  Tooltip,
} from '@patternfly/react-core';
import BanIcon from '@patternfly/react-icons/dist/esm/icons/ban-icon';
import CheckCircleIcon from '@patternfly/react-icons/dist/esm/icons/check-circle-icon';
import ExclamationCircleIcon from '@patternfly/react-icons/dist/esm/icons/exclamation-circle-icon';
import ExclamationTriangleIcon from '@patternfly/react-icons/dist/esm/icons/exclamation-triangle-icon';
import { InfoCircleIcon } from '@patternfly/react-icons/dist/esm/icons/info-circle-icon';
import SearchIcon from '@patternfly/react-icons/dist/esm/icons/search-icon';
import { Table, Tbody, Td, Th, Thead, Tr } from '@patternfly/react-table';

import { Link } from '~/common/routing';
import { RefreshButton } from '~/components/clusters/ClusterListMultiRegion/components/RefreshButton';
import {
  ClusterTransferDetail,
  refetchClusterTransferDetail,
  useFetchClusterTransferDetail,
} from '~/queries/ClusterDetailsQueries/ClusterTransferOwnership/useFetchClusterTransferDetails';
import { useGlobalState } from '~/redux/hooks/useGlobalState';
import { ClusterTransferStatus } from '~/types/accounts_mgmt.v1';

import ErrorTriangle from '../common/ErrorTriangle';

import { AcceptDeclineClusterTransferModal } from './AcceptDeclineTransferModal';
import { CancelClusterTransferModal } from './CancelClusterTransferModal';
import TransferOwnerStatus from './TransferOwnerStatus';

const ClusterListPageHeader = ({
  showSpinner,
  isError,
  error,
  refresh,
}: {
  showSpinner: boolean;
  isError?: boolean;
  error?: Error;
  refresh: () => void;
}) => (
  <>
    <Flex>
      <FlexItem grow={{ default: 'grow' }}>
        <Title headingLevel="h2">Transfer Ownership Request</Title>
      </FlexItem>
    </Flex>
    <Flex rowGap={{ default: 'rowGapXl' }}>
      <FlexItem>
        <p>
          Transfer cluster ownership so that another user in your organization or another
          organization can manage this cluster.
        </p>
      </FlexItem>
      <FlexItem>
        <p>
          Cluster transfers from outside your organization will show numerous ‘Unknown’ fields, as
          access to external cluster data is restricted.
        </p>
      </FlexItem>
      <FlexItem align={{ default: 'alignRight' }}>
        <Toolbar id="cluster-list-refresh-toolbar" isFullHeight inset={{ default: 'insetNone' }}>
          <ToolbarContent>
            <ToolbarGroup
              variant="action-group-plain"
              align={{ default: 'alignEnd' }}
              gap={{ default: 'gapNone', md: 'gapNone' }}
            >
              {showSpinner && (
                <ToolbarItem>
                  <Spinner
                    size="lg"
                    className="cluster-list-spinner"
                    aria-label="Loading cluster transfer list data"
                  />
                </ToolbarItem>
              )}
              {isError && (
                <ToolbarItem>
                  <ErrorTriangle errorMessage={error} item="clusters" />
                </ToolbarItem>
              )}
              <ToolbarItem gap={{ default: 'gapNone' }}>
                <RefreshButton isDisabled={showSpinner} refreshFunc={refresh} />
              </ToolbarItem>
            </ToolbarGroup>
          </ToolbarContent>
        </Toolbar>
      </FlexItem>
    </Flex>
  </>
);

const ClusterTransferList = () => {
  const username = useGlobalState((state) => state.userProfile.keycloakProfile.username);

  const { data, isLoading, isError, error } = useFetchClusterTransferDetail({
    username,
  });

  const columnNames = {
    name: 'Name',
    status: 'Status',
    type: 'Type',
    version: 'Version',
    requested: 'Current Owner',
    recipient: 'Transfer Recipient',
  };

  const statusMap: Record<
    string,
    {
      icon: React.ReactNode;
      label: string;
      status: 'success' | 'warning' | 'danger' | 'custom' | 'info' | undefined;
    }
  > = {
    [ClusterTransferStatus.Pending.toLowerCase()]: {
      icon: <ExclamationTriangleIcon />,
      label: 'Pending',
      status: 'warning',
    },
    [ClusterTransferStatus.Accepted.toLowerCase()]: {
      icon: <CheckCircleIcon />,
      label: 'Accepted',
      status: 'success',
    },
    [ClusterTransferStatus.Declined.toLowerCase()]: {
      icon: <ExclamationCircleIcon />,
      label: 'Declined',
      status: 'danger',
    },
    [ClusterTransferStatus.Rescinded.toLowerCase()]: {
      icon: <BanIcon />,
      label: 'Canceled',
      status: 'danger',
    },
    [ClusterTransferStatus.Completed.toLowerCase()]: {
      icon: <CheckCircleIcon />,
      label: 'Completed',
      status: 'success',
    },
  };

  const handleStatus = (status: string | undefined) => {
    if (!status) return status;

    const statusInfo = statusMap[status.toLowerCase()];
    if (!statusInfo) return status;

    return (
      <>
        <Icon status={statusInfo.status}>{statusInfo.icon}</Icon> {statusInfo.label}
      </>
    );
  };
  const handleTransfer = (isOwner: boolean, transferId: string, displayName: string) =>
    isOwner ? (
      <CancelClusterTransferModal
        key={transferId}
        transferId={transferId || ''}
        displayName={displayName}
      />
    ) : (
      <AcceptDeclineClusterTransferModal
        key={transferId}
        transferId={transferId || ''}
        displayName={displayName}
      />
    );

  const tableHeader = (
    <Thead>
      <Tr>
        <Th>{columnNames.name}</Th>
        <Th>{columnNames.status}</Th>

        <Th>{columnNames.type}</Th>
        <Th>{columnNames.version}</Th>
        <Th>{columnNames.requested}</Th>
        <Th>{columnNames.recipient}</Th>
        <Th screenReaderText="Cluster action" />
      </Tr>
    </Thead>
  );

  const clusterRow = (transfer: ClusterTransferDetail) => {
    const subscriptionId = transfer?.subscription?.id;
    const owner = transfer?.owner;
    const isOwner = owner === username;
    const isInterOrg = !transfer?.subscription && !isOwner;
    const clusterName = isInterOrg ? (
      transfer?.name
    ) : (
      <Link to={`/details/s/${subscriptionId}`}>{transfer?.name}</Link>
    );
    const clusterStatus = transfer.status;

    return (
      <Tr key={transfer?.id}>
        <Td dataLabel={columnNames.name}>{clusterName}</Td>
        <Td dataLabel={columnNames.status}>
          {transfer.id ? (
            <TransferOwnerStatus
              status={clusterStatus}
              expirationTimestamp={transfer?.expiration_date}
              id={transfer.id}
              isOwner={isOwner}
            />
          ) : null}
        </Td>
        <Td dataLabel={columnNames.type}>{transfer?.product?.id?.toUpperCase()}</Td>
        <Td dataLabel={columnNames.version}>{transfer?.version?.raw_id}</Td>
        <Td dataLabel={columnNames.requested}>
          {isInterOrg ? (
            <>
              {owner}{' '}
              <Tooltip
                content={
                  <div>
                    <p>This Transfer is from another user outside of your orgaization.</p>
                  </div>
                }
              >
                <Icon>
                  <InfoCircleIcon />
                </Icon>
              </Tooltip>
            </>
          ) : (
            owner
          )}
        </Td>
        <Td dataLabel={columnNames.recipient}>{transfer?.recipient} </Td>
        <Td>
          {transfer.id && transfer?.status === ClusterTransferStatus.Pending.toLowerCase()
            ? handleTransfer(isOwner, transfer.id, transfer.name || '')
            : handleStatus(clusterStatus)}
        </Td>
      </Tr>
    );
  };
  const emptyPage = (
    <EmptyState headingLevel="h4" icon={SearchIcon} titleText="No cluster transfers found.">
      <EmptyStateBody>
        There are no clusters for your user that are actively being transferred.
      </EmptyStateBody>
    </EmptyState>
  );
  return (
    <PageSection hasBodyWrapper={false}>
      <PageSection hasBodyWrapper={false}>
        <ClusterListPageHeader
          showSpinner={isLoading}
          isError={isError}
          error={error instanceof Error ? error : undefined}
          refresh={refetchClusterTransferDetail}
        />
        {!isLoading && (!data || data?.items?.length === 0) ? (
          emptyPage
        ) : (
          <Card>
            {!isLoading ? (
              <Table aria-label="Cluster transfer ownership">
                {tableHeader}
                <Tbody>{data?.items?.map((transfer) => clusterRow(transfer))}</Tbody>
              </Table>
            ) : null}
          </Card>
        )}
      </PageSection>
    </PageSection>
  );
};
export default ClusterTransferList;
