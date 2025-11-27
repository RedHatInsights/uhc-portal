import React from 'react';

import {
  Button,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  EmptyState,
  EmptyStateBody,
  Flex,
  FlexItem,
  Icon,
  Popover,
  Spinner,
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
import EyeIcon from '@patternfly/react-icons/dist/esm/icons/eye-icon';
import { InfoCircleIcon } from '@patternfly/react-icons/dist/esm/icons/info-circle-icon';
import { OutlinedQuestionCircleIcon } from '@patternfly/react-icons/dist/esm/icons/outlined-question-circle-icon';
import SearchIcon from '@patternfly/react-icons/dist/esm/icons/search-icon';
import { Table, Tbody, Td, Th, Thead, Tr } from '@patternfly/react-table';

import { Link } from '~/common/routing';
import { RefreshButton } from '~/components/clusters/ClusterListMultiRegion/components/RefreshButton';
import {
  ClusterTransferDetail,
  refetchClusterTransferDetail,
  useFetchClusterTransferDetail,
} from '~/queries/ClusterDetailsQueries/ClusterTransferOwnership/useFetchClusterTransferDetails';
// import the CLUSTER_TABBED_VIEW feature gate
import { TABBED_CLUSTERS } from '~/queries/featureGates/featureConstants';
import { useFeatureGate } from '~/queries/featureGates/useFetchFeatureGate';
import { viewConstants } from '~/redux/constants';
import { useGlobalState } from '~/redux/hooks/useGlobalState';
import { ClusterTransferStatus } from '~/types/accounts_mgmt.v1';
import { ViewOptions } from '~/types/types';

import ErrorTriangle from '../common/ErrorTriangle';

import { AcceptDeclineClusterTransferModal } from './AcceptDeclineTransferModal';
import { CancelClusterTransferModal } from './CancelClusterTransferModal';
import ClusterTransferListTablePagination from './ClusterTransferListTablePagination';
import TransferOwnerStatus from './TransferOwnerStatus';

const ClusterTransferPageHeader = ({
  showSpinner,
  isError,
  error,
  refresh,
  hideRefreshButton,
  viewOptions,
}: {
  showSpinner: boolean;
  isError?: boolean;
  error?: Error;
  refresh: () => void;
  hideRefreshButton?: boolean;
  viewOptions: ViewOptions;
}) => {
  const bodyContent = (
    <Flex>
      <FlexItem>
        <p>
          Transfer cluster ownership so that another user in your organization or another
          organization can manage this cluster.
        </p>
      </FlexItem>
    </Flex>
  );
  const footerContent = (
    <Flex>
      <FlexItem>
        <p>
          {' '}
          Cluster transfers from outside your organization will show numerous ‘Unknown’ fields, as
          access to external cluster data is restricted.
        </p>
      </FlexItem>
    </Flex>
  );
  return (
    <Flex>
      <FlexItem grow={{ default: 'grow' }}>
        <>
          <span>Cluster transfer ownership request</span>
          <Popover bodyContent={bodyContent} footerContent={footerContent} enableFlip={false}>
            <Button icon={<OutlinedQuestionCircleIcon />} variant="plain" />
          </Popover>
        </>
      </FlexItem>
      {!hideRefreshButton && (
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
      )}
      <FlexItem align={{ default: 'alignRight' }}>
        <ClusterTransferListTablePagination
          viewType={viewConstants.CLUSTER_TRANSFER_VIEW}
          viewOptions={viewOptions}
          variant="top"
          isDisabled={showSpinner}
        />
      </FlexItem>
    </Flex>
  );
};

const ClusterTransferList = ({ hideRefreshButton }: { hideRefreshButton?: boolean }) => {
  const username = useGlobalState((state) => state.userProfile.keycloakProfile.username);
  const viewOptions = useGlobalState(
    (state) => state.viewOptions[viewConstants.CLUSTER_TRANSFER_VIEW],
  );
  const { data, isLoading, isError, error } = useFetchClusterTransferDetail({
    username,
  });
  const isTabbedClusters = useFeatureGate(TABBED_CLUSTERS);

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
        buttonText={isTabbedClusters ? 'Retract' : undefined}
        icon={isTabbedClusters ? <EyeIcon /> : undefined}
      />
    ) : (
      <AcceptDeclineClusterTransferModal
        key={transferId}
        transferId={transferId || ''}
        displayName={displayName}
        buttonText={isTabbedClusters ? 'Open' : undefined}
        icon={isTabbedClusters ? <EyeIcon /> : undefined}
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
    const transferAction = !!(
      transfer.id && transfer?.status === ClusterTransferStatus.Pending.toLowerCase()
    );
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
        <Td isActionCell={transferAction}>
          {transferAction
            ? handleTransfer(isOwner, transfer.id || '', transfer.name || '')
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
    <Card>
      <CardHeader>
        <ClusterTransferPageHeader
          showSpinner={isLoading}
          isError={isError}
          error={error instanceof Error ? error : undefined}
          refresh={refetchClusterTransferDetail}
          hideRefreshButton={hideRefreshButton}
          viewOptions={viewOptions}
        />
      </CardHeader>
      {!isLoading && (!data || data?.items?.length === 0) ? (
        emptyPage
      ) : (
        <CardBody>
          {!isLoading ? (
            <Table aria-label="Cluster transfer ownership">
              {tableHeader}
              <Tbody>{data?.items?.map((transfer) => clusterRow(transfer))}</Tbody>
            </Table>
          ) : null}
        </CardBody>
      )}
      <CardFooter>
        <ClusterTransferListTablePagination
          viewType={viewConstants.CLUSTER_TRANSFER_VIEW}
          viewOptions={viewOptions}
          variant="bottom"
          isDisabled={isLoading}
        />
      </CardFooter>
    </Card>
  );
};
export default ClusterTransferList;
