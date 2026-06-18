import React from 'react';
import { useDispatch } from 'react-redux';

import {
  Alert,
  Card,
  CardBody,
  CardTitle,
  Flex,
  Spinner,
  Stack,
  Title,
} from '@patternfly/react-core';

import getClusterName from '~/common/getClusterName';
import type { LogForwardingDestinationKind } from '~/components/clusters/wizards/rosa/LogForwarding/buildClusterLogForwarders';
import { buildLogForwardingTree } from '~/components/common/GroupsApplicationsSelector/logForwardingGroupTreeFromApi';
import { closeModal, openModal } from '~/components/common/Modal/ModalActions';
import modals from '~/components/common/Modal/modals';
import { useFetchLogForwarders } from '~/queries/ClusterDetailsQueries/useFetchLogForwarders';
import { HCP_LOG_FORWARDING } from '~/queries/featureGates/featureConstants';
import { useFeatureGate } from '~/queries/featureGates/useFetchFeatureGate';
import { useFetchLogForwardingApplications } from '~/queries/RosaWizardQueries/useFetchLogForwardingApplications';
import { useFetchLogForwardingGroups } from '~/queries/RosaWizardQueries/useFetchLogForwardingGroups';
import type { LogForwarder } from '~/types/clusters_mgmt.v1';
import type { AugmentedCluster } from '~/types/types';

import { isHibernating, isHypershiftCluster, isROSA } from '../../../common/clusterStates';

import { AddEditLogForwardingModal } from './components/AddEditLogForwardingModal';
import { DeleteLogForwardingModal } from './components/DeleteLogForwardingModal';
import {
  AddConfigurationDropdown,
  LogDestinationCard,
  logForwardingNoneLabel,
} from './logForwardingSectionComponents';

type AddEditModalState = {
  destinationType: LogForwardingDestinationKind;
  mode: 'add' | 'edit';
  forwarder?: LogForwarder;
};

type DeleteModalState = {
  destinationType: LogForwardingDestinationKind;
  forwarder: LogForwarder;
};

export function LogForwardingSection({ cluster }: { cluster: AugmentedCluster }) {
  const dispatch = useDispatch();
  const clusterID = cluster.id;
  const region = cluster.subscription?.rh_region_id;
  const isHypershift = isHypershiftCluster(cluster);
  const isRosa = isROSA(cluster);
  const isHcpLogForwardingEnabled = useFeatureGate(HCP_LOG_FORWARDING);
  const showSection = isHypershift && isRosa && isHcpLogForwardingEnabled;

  const [addEditModal, setAddEditModal] = React.useState<AddEditModalState | null>(null);
  const [deleteModal, setDeleteModal] = React.useState<DeleteModalState | null>(null);

  const isReadOnly = cluster?.status?.configuration_mode === 'read_only';
  const clusterHibernating = isHibernating(cluster);
  const readOnlyReason = isReadOnly && 'This operation is not available during maintenance';
  const hibernatingReason =
    clusterHibernating && 'This operation is not available while cluster is hibernating';

  const {
    data: forwarders = [],
    isLoading: isForwardersLoading,
    isError: isForwardersError,
    error: forwardersError,
  } = useFetchLogForwarders(showSection ? clusterID : undefined, region);

  const { data: groupsTree = [], isLoading: isGroupsLoading } = useFetchLogForwardingGroups({
    s3On: showSection,
    cwOn: showSection,
  });
  const { data: applications = [], isLoading: isAppsLoading } = useFetchLogForwardingApplications({
    s3On: showSection,
    cwOn: showSection,
  });

  const catalogTree = React.useMemo(
    () => buildLogForwardingTree(groupsTree, applications),
    [groupsTree, applications],
  );
  const isCatalogLoading = isGroupsLoading || isAppsLoading;

  if (!showSection || !clusterID) {
    return null;
  }

  const treeLoading = isCatalogLoading;
  const s3Forwarder = forwarders.find((f) => f.s3);
  const cloudWatchForwarder = forwarders.find((f) => f.cloudwatch);
  const hasAnyForwarder = forwarders.length > 0;
  const clusterName = getClusterName(cluster);
  const allSupportedDestinations = s3Forwarder && cloudWatchForwarder;
  const allSupportedDestinationsReason =
    allSupportedDestinations && 'All supported log forwarding destinations are already configured.';
  const addDisableReason =
    readOnlyReason || hibernatingReason || allSupportedDestinationsReason || undefined;
  const editDisableReason = readOnlyReason || hibernatingReason || undefined;
  const addCanManage = !!cluster.canUpdateClusterResource && !addDisableReason;
  const editCanManage = !!cluster.canUpdateClusterResource && !editDisableReason;

  const openAddModal = (destinationType: LogForwardingDestinationKind) => {
    setDeleteModal(null);
    setAddEditModal({ destinationType, mode: 'add' });
    dispatch(openModal(modals.EDIT_LOG_FORWARDING));
  };

  const openEditModal = (
    destinationType: LogForwardingDestinationKind,
    forwarder: LogForwarder,
  ) => {
    setDeleteModal(null);
    setAddEditModal({ destinationType, mode: 'edit', forwarder });
    dispatch(openModal(modals.EDIT_LOG_FORWARDING));
  };

  const openDeleteModal = (
    destinationType: LogForwardingDestinationKind,
    forwarder: LogForwarder,
  ) => {
    setAddEditModal(null);
    setDeleteModal({ destinationType, forwarder });
    dispatch(openModal(modals.EDIT_LOG_FORWARDING));
  };

  const closeLogForwardingModal = () => {
    setAddEditModal(null);
    setDeleteModal(null);
    dispatch(closeModal());
  };

  return (
    <>
      <Card>
        <CardTitle>
          <Flex
            alignItems={{ default: 'alignItemsCenter' }}
            justifyContent={{ default: 'justifyContentSpaceBetween' }}
          >
            <Title headingLevel="h2" size="xl">
              Control plane log forwarding
            </Title>
            <AddConfigurationDropdown
              canAddS3={!s3Forwarder}
              canAddCloudWatch={!cloudWatchForwarder}
              canManage={addCanManage}
              disableReason={addDisableReason}
              onSelect={openAddModal}
            />
          </Flex>
        </CardTitle>
        <CardBody>
          <Stack hasGutter>
            {isForwardersLoading ? (
              <Spinner aria-label="Loading log forwarding configuration" />
            ) : null}

            {isForwardersError ? (
              <Alert variant="danger" isInline title="Could not load control plane log forwarding">
                {forwardersError &&
                typeof forwardersError === 'object' &&
                'errorMessage' in forwardersError &&
                forwardersError.errorMessage
                  ? String(forwardersError.errorMessage)
                  : 'Request failed'}
              </Alert>
            ) : null}

            {!isForwardersLoading && !isForwardersError && !hasAnyForwarder ? (
              <span className="pf-v6-u-color-text-subtle">No log forwarding configured.</span>
            ) : null}

            {!isForwardersLoading &&
            !isForwardersError &&
            forwarders.length > 0 &&
            !s3Forwarder &&
            !cloudWatchForwarder ? (
              <span className="pf-v6-u-color-text-subtle">
                No supported log forwarding destinations are configured.
              </span>
            ) : null}

            {!isForwardersLoading && !isForwardersError && s3Forwarder ? (
              <LogDestinationCard
                title="Amazon S3"
                forwarder={s3Forwarder}
                tree={catalogTree}
                treeLoading={treeLoading}
                canManage={editCanManage}
                disableReason={editDisableReason}
                onEdit={() => openEditModal('s3', s3Forwarder)}
                onDelete={() => openDeleteModal('s3', s3Forwarder)}
                columns={[
                  {
                    term: 'Configuration',
                    description: 'Enabled',
                  },
                  {
                    term: 'Bucket name',
                    description: s3Forwarder.s3?.bucket_name?.trim() || logForwardingNoneLabel,
                  },
                  {
                    term: 'Bucket prefix',
                    description: s3Forwarder.s3?.bucket_prefix?.trim() || logForwardingNoneLabel,
                  },
                ]}
              />
            ) : null}

            {!isForwardersLoading && !isForwardersError && cloudWatchForwarder ? (
              <LogDestinationCard
                title="CloudWatch"
                forwarder={cloudWatchForwarder}
                tree={catalogTree}
                treeLoading={treeLoading}
                canManage={editCanManage}
                disableReason={editDisableReason}
                onEdit={() => openEditModal('cloudwatch', cloudWatchForwarder)}
                onDelete={() => openDeleteModal('cloudwatch', cloudWatchForwarder)}
                columns={[
                  {
                    term: 'Configuration',
                    description: 'Enabled',
                  },
                  {
                    term: 'Log group name',
                    description:
                      cloudWatchForwarder.cloudwatch?.log_group_name?.trim() ||
                      logForwardingNoneLabel,
                  },
                  {
                    term: 'Role ARN',
                    description:
                      cloudWatchForwarder.cloudwatch?.log_distribution_role_arn?.trim() ||
                      logForwardingNoneLabel,
                  },
                ]}
              />
            ) : null}
          </Stack>
        </CardBody>
      </Card>

      {addEditModal ? (
        <AddEditLogForwardingModal
          clusterId={clusterID}
          region={region}
          destinationType={addEditModal.destinationType}
          mode={addEditModal.mode}
          forwarder={addEditModal.forwarder}
          catalogTree={catalogTree}
          clusterName={clusterName}
          isOpen
          onClose={closeLogForwardingModal}
        />
      ) : null}

      {deleteModal ? (
        <DeleteLogForwardingModal
          clusterId={clusterID}
          region={region}
          destinationType={deleteModal.destinationType}
          forwarder={deleteModal.forwarder}
          isOpen
          onClose={closeLogForwardingModal}
        />
      ) : null}
    </>
  );
}
