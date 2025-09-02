import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import { useDispatch } from 'react-redux';

import {
  Button,
  Card,
  CardBody,
  EmptyState,
  Icon,
  Popover,
  PopoverPosition,
  Title,
} from '@patternfly/react-core';
import { CheckCircleIcon } from '@patternfly/react-icons/dist/esm/icons/check-circle-icon';
import { ExclamationCircleIcon } from '@patternfly/react-icons/dist/esm/icons/exclamation-circle-icon';
import { HelpIcon } from '@patternfly/react-icons/dist/esm/icons/help-icon';
import { InProgressIcon } from '@patternfly/react-icons/dist/esm/icons/in-progress-icon';
import { UnknownIcon } from '@patternfly/react-icons/dist/esm/icons/unknown-icon';
import {
  ActionsColumn,
  Table,
  TableVariant,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
} from '@patternfly/react-table';
import { useAddNotification } from '@redhat-cloud-services/frontend-components-notifications/';

import { LoadingSkeletonCard } from '~/components/clusters/common/LoadingSkeletonCard/LoadingSkeletonCard';
import ExternalLink from '~/components/common/ExternalLink';
import { useAddGrant } from '~/queries/ClusterDetailsQueries/AccessControlTab/NetworkSelfServiceQueries/useAddGrant';
import { useDeleteGrant } from '~/queries/ClusterDetailsQueries/AccessControlTab/NetworkSelfServiceQueries/useDeleteGrant';
import {
  refetchGrants,
  useFetchGrants,
} from '~/queries/ClusterDetailsQueries/AccessControlTab/NetworkSelfServiceQueries/useFetchGrants';
import { useFetchRoles } from '~/queries/ClusterDetailsQueries/AccessControlTab/NetworkSelfServiceQueries/useFetchRoles';

import ButtonWithTooltip from '../../../../../common/ButtonWithTooltip';
import ClipboardCopyLinkButton from '../../../../../common/ClipboardCopyLinkButton';
import ErrorBox from '../../../../../common/ErrorBox';
import { modalActions } from '../../../../../common/Modal/ModalActions';

import AddGrantModal from './AddGrantModal/AddGrantModal';
import { grantsDataAggregator } from './NetworkSelfServiceHelpers';

const NetworkSelfServiceSection = ({
  clusterID,
  canEdit,
  clusterHibernating,
  isReadOnly,
  region,
}) => {
  const dispatch = useDispatch();
  const addNotification = useAddNotification();
  const [deletedRowIndex, setDeletedRowIndex] = React.useState(undefined);
  const [refetchInterval, setRefetchInterval] = React.useState(false);

  const {
    data: grantsData,
    isLoading: isGrantsLoading,
    isError: isGrantsError,
    error: grantsError,
    isFetching: isGrantsFetching,
  } = useFetchGrants(clusterID, refetchInterval, region);
  const { data: rolesData } = useFetchRoles(region);
  const {
    data: addGrantsData,
    isPending: isAddGrantsPending,
    isError: isAddGrantsError,
    error: addGrantsError,
    mutateAsync: addGrantsMutate,
    reset: resetAddGrantsMutate,
  } = useAddGrant(clusterID, region);
  const {
    isError: isDeleteGrantError,
    error: deleteGrantError,
    mutate: deleteGrantMutate,
    reset: resetDeleteGrantsMutate,
  } = useDeleteGrant(clusterID, region);

  const grants = useMemo(
    () => ({
      ...grantsData,
      data: grantsDataAggregator(grantsData, rolesData),
    }),
    [grantsData, rolesData],
  );

  React.useEffect(() => {
    grants?.data?.forEach((grant) => {
      if (grant.state === 'deleting' || grant.state === 'pending') {
        setRefetchInterval(true);
      }
    });

    return () => {
      setRefetchInterval(false);
    };
  }, [setRefetchInterval, grants]);

  React.useEffect(() => {
    grants?.data?.forEach((grant) => {
      if (addGrantsData && grant.user_arn === addGrantsData?.data?.user_arn) {
        switch (grant.state) {
          case 'failed':
            addNotification({
              variant: 'danger',
              title: `Role creation failed for ${grant.user_arn}`,
              description: grant.state_description,
              dismissDelay: 8000,
              dismissable: false,
            });

            break;
          case 'ready':
            addNotification({
              variant: 'success',
              title: `${grant.roleName} role successfully created for ${grant.user_arn}`,
              dismissDelay: 8000,
              dismissable: false,
            });

            break;
          case 'deleting':
          case 'pending':
          default:
            refetchGrants();
            break;
        }
      }
    });
    // Adding grants as dependency results in infinite API call loop
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [addGrantsData, grantsData, refetchGrants, dispatch]);

  React.useEffect(() => {
    if (deletedRowIndex !== undefined && !isGrantsLoading) {
      setDeletedRowIndex(undefined);
    }
  }, [clusterID, deletedRowIndex, grantsData, dispatch, grants, isGrantsFetching, isGrantsLoading]);

  const grantStatus = (status, description) => {
    let icon;
    let statusStr;
    switch (status) {
      case 'ready':
        icon = <CheckCircleIcon className="status-icon success" />;
        statusStr = 'Ready';
        break;
      case 'failed':
        icon = <ExclamationCircleIcon className="status-icon danger" />;
        statusStr = 'Failed';
        break;
      case 'pending':
        icon = <InProgressIcon className="status-icon" />;
        statusStr = 'Pending';
        break;
      case 'deleting':
        icon = <InProgressIcon className="status-icon" />;
        statusStr = 'Deleting';
        break;
      case 'removed':
        icon = <UnknownIcon className="status-icon" />;
        statusStr = 'Removed';
        break;
      default:
        icon = <UnknownIcon className="status-icon" />;
        statusStr = 'Unknown';
    }
    if (status === 'failed') {
      return (
        <span>
          <Popover
            position={PopoverPosition.top}
            bodyContent={description}
            aria-label="grant-failed"
          >
            <Button className="self-service-failed" variant="link" isInline icon={icon}>
              {statusStr}
            </Button>
          </Popover>
        </span>
      );
    }
    return (
      <>
        {icon} <span>{statusStr}</span>{' '}
      </>
    );
  };

  if (isGrantsError) {
    return (
      <EmptyState>
        <ErrorBox message="Error getting cluster users" response={grantsError.error} />
      </EmptyState>
    );
  }

  const loginAWSLink = (
    <ExternalLink href="https://console.aws.amazon.com/console/home">
      Log in to your aws account.
    </ExternalLink>
  );

  const hasGrants = !!grants?.data?.length;

  const readOnlyReason = isReadOnly && 'This operation is not available during maintenance';
  const hibernatingReason =
    clusterHibernating && 'This operation is not available while cluster is hibernating';
  const canNotEditReason =
    !canEdit &&
    'You do not have permission to grant a role. Only cluster owners, cluster editors, and Organization Administrators can grant roles.';
  const disableReason = readOnlyReason || hibernatingReason || canNotEditReason;

  const addGrantBtn = (
    <ButtonWithTooltip
      onClick={() => {
        setTimeout(() => dispatch(modalActions.openModal('grant-modal')), 0);
      }}
      variant="secondary"
      className="access-control-add"
      disableReason={disableReason}
    >
      Grant role
    </ButtonWithTooltip>
  );

  const columnNames = {
    arn: 'ARN',
    role: 'Role',
    status: 'Status',
    consoleUrl: 'AWS OSD console URL',
  };

  const actions = (grant, index) => [
    {
      title: 'Delete',
      onClick: () => {
        setDeletedRowIndex(index);
        deleteGrantMutate(grant.id, {
          onSuccess: () => {
            resetDeleteGrantsMutate();
            refetchGrants();
          },
        });
      },
    },
  ];

  const grantRow = (grant, index) => {
    const rowActions = actions(grant, index);
    return (
      <Tr key={grant.id}>
        <Td dataLabel={columnNames.arn}>{grant.user_arn}</Td>
        <Td dataLabel={columnNames.role}>{grant.roleName}</Td>
        <Td dataLabel={columnNames.status}>
          {grantStatus(
            deletedRowIndex === index ? 'deleting' : grant.state,
            grant.state_description,
          )}
        </Td>
        <Td dataLabel={columnNames.consoleUrl}>
          <ClipboardCopyLinkButton
            className="access-control-tables-copy"
            text={grant.console_url}
            isDisabled={!grant.console_url}
          >
            Copy URL to clipboard
          </ClipboardCopyLinkButton>
        </Td>
        <Td isActionCell>
          <ActionsColumn
            items={rowActions}
            isDisabled={grant.state === 'deleting' || !!disableReason}
          />
        </Td>
      </Tr>
    );
  };

  return isGrantsLoading && !hasGrants ? (
    <LoadingSkeletonCard />
  ) : (
    <Card id="networkSelfService">
      <CardBody>
        {isDeleteGrantError && (
          <ErrorBox message="Error deleting grant" response={deleteGrantError.error} />
        )}
        <Title size="lg" className="card-title" headingLevel="h3">
          AWS infrastructure access
        </Title>
        <p>
          Grant permission to view or manage the AWS infrastructure of the cluster to IAM users
          defined in your AWS account. {loginAWSLink}
        </p>
        {hasGrants && (
          <Table aria-label="Grants" variant={TableVariant.compact}>
            <Thead>
              <Tr>
                <Th>
                  <>
                    {columnNames.arn}
                    <Popover
                      position={PopoverPosition.top}
                      aria-label="ARNs"
                      bodyContent={
                        <p>Amazon Resource Names (ARNs) uniquely identify AWS resources.</p>
                      }
                    >
                      <Button
                        icon={
                          <Icon size="md">
                            <HelpIcon />
                          </Icon>
                        }
                        variant="plain"
                        isInline
                      />
                    </Popover>
                  </>
                </Th>
                <Th>{columnNames.role}</Th>
                <Th>{columnNames.status}</Th>
                <Th>{columnNames.consoleUrl}</Th>
                <Th screenReaderText="Grant action" />
              </Tr>
            </Thead>
            <Tbody>{grants.data.map(grantRow)}</Tbody>
          </Table>
        )}
        {addGrantBtn}
      </CardBody>
      <AddGrantModal
        clusterID={clusterID}
        addGrantsMutate={addGrantsMutate}
        roles={rolesData}
        addGrantsData={addGrantsData}
        isAddGrantsPending={isAddGrantsPending}
        isAddGrantsError={isAddGrantsError}
        addGrantsError={addGrantsError}
        resetAddGrantsMutate={resetAddGrantsMutate}
      />
    </Card>
  );
};

NetworkSelfServiceSection.propTypes = {
  region: PropTypes.string,
  clusterID: PropTypes.string,
  canEdit: PropTypes.bool.isRequired,
  clusterHibernating: PropTypes.bool.isRequired,
  isReadOnly: PropTypes.bool.isRequired,
};

export default NetworkSelfServiceSection;
