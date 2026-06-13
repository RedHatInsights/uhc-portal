import React from 'react';

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
import { useFetchClusterControlPlaneLogForwarders } from '~/queries/ClusterDetailsQueries/useFetchClusterControlPlaneLogForwarders';
import { HCP_LOG_FORWARDING } from '~/queries/featureGates/featureConstants';
import { useFeatureGate } from '~/queries/featureGates/useFetchFeatureGate';
import { useFetchLogForwardingGroupsCatalog } from '~/queries/RosaWizardQueries/useFetchLogForwardingGroupsCatalog';
import type { LogForwarder } from '~/types/clusters_mgmt.v1';
import { AugmentedCluster } from '~/types/types';

import { isHibernating, isHypershiftCluster, isROSA } from '../../../common/clusterStates';

import { AddEditLogForwardingModal } from './components/AddEditLogForwardingModal';
import { DeleteLogForwardingModal } from './components/DeleteLogForwardingModal';
import {
  AddConfigurationDropdown,
  LogDestinationCard,
  logForwardingNoneLabel,
} from './logForwardingSectionComponents';

type ModalState =
  | {
      kind: 'add-edit';
      destinationType: LogForwardingDestinationKind;
      mode: 'add' | 'edit';
      forwarder?: LogForwarder;
    }
  | {
      kind: 'delete';
      destinationType: LogForwardingDestinationKind;
      forwarder: LogForwarder;
    }
  | null;

const LogForwardingSection = ({ cluster }: { cluster: AugmentedCluster }) => {
  const clusterID = cluster.id;
  const region = cluster.subscription?.rh_region_id;
  const isHypershift = isHypershiftCluster(cluster);
  const isRosa = isROSA(cluster);
  const isHcpLogForwardingEnabled = useFeatureGate(HCP_LOG_FORWARDING);
  const showSection = isHypershift && isRosa && isHcpLogForwardingEnabled;

  const [modalState, setModalState] = React.useState<ModalState>(null);

  const isReadOnly = cluster?.status?.configuration_mode === 'read_only';
  const clusterHibernating = isHibernating(cluster);
  const readOnlyReason = isReadOnly && 'This operation is not available during maintenance';
  const hibernatingReason =
    clusterHibernating && 'This operation is not available while cluster is hibernating';
  const disableReason = readOnlyReason || hibernatingReason || undefined;
  const canManage = !!cluster.canEdit && !disableReason;

  const {
    data: forwarders = [],
    isLoading: isForwardersLoading,
    isError: isForwardersError,
    error: forwardersError,
  } = useFetchClusterControlPlaneLogForwarders(clusterID, region, {
    enabled: showSection,
  });

  const { data: catalogTree = [], isLoading: isCatalogLoading } =
    useFetchLogForwardingGroupsCatalog({ enabled: showSection });

  if (!showSection || !clusterID) {
    return null;
  }

  const treeLoading = isCatalogLoading;
  const s3Forwarder = forwarders.find((f) => f.s3);
  const cloudWatchForwarder = forwarders.find((f) => f.cloudwatch);
  const hasAnyForwarder = forwarders.length > 0;
  const clusterName = getClusterName(cluster);

  const openAddModal = (destinationType: LogForwardingDestinationKind) => {
    setModalState({ kind: 'add-edit', destinationType, mode: 'add' });
  };

  const openEditModal = (
    destinationType: LogForwardingDestinationKind,
    forwarder: LogForwarder,
  ) => {
    setModalState({ kind: 'add-edit', destinationType, mode: 'edit', forwarder });
  };

  const openDeleteModal = (
    destinationType: LogForwardingDestinationKind,
    forwarder: LogForwarder,
  ) => {
    setModalState({ kind: 'delete', destinationType, forwarder });
  };

  const closeModal = () => setModalState(null);

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
              canManage={canManage}
              disableReason={disableReason}
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
                canManage={canManage}
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
                canManage={canManage}
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
                    description: cloudWatchForwarder.cloudwatch?.log_distribution_role_arn ? (
                      <span
                        className="pf-v6-u-text-break-word"
                        title={cloudWatchForwarder.cloudwatch.log_distribution_role_arn}
                      >
                        {cloudWatchForwarder.cloudwatch.log_distribution_role_arn}
                      </span>
                    ) : (
                      logForwardingNoneLabel
                    ),
                  },
                ]}
              />
            ) : null}
          </Stack>
        </CardBody>
      </Card>

      {modalState?.kind === 'add-edit' ? (
        <AddEditLogForwardingModal
          clusterId={clusterID}
          region={region}
          destinationType={modalState.destinationType}
          mode={modalState.mode}
          forwarder={modalState.forwarder}
          catalogTree={catalogTree}
          clusterName={clusterName}
          isOpen
          onClose={closeModal}
        />
      ) : null}

      {modalState?.kind === 'delete' ? (
        <DeleteLogForwardingModal
          clusterId={clusterID}
          region={region}
          destinationType={modalState.destinationType}
          forwarder={modalState.forwarder}
          isOpen
          onClose={closeModal}
        />
      ) : null}
    </>
  );
};

export default LogForwardingSection;
