import React from 'react';
import get from 'lodash/get';
import PropTypes from 'prop-types';

import {
  DescriptionList,
  DescriptionListDescription,
  DescriptionListGroup,
  DescriptionListTerm,
  Flex,
  Timestamp,
  TimestampFormat,
} from '@patternfly/react-core';

import { getQueryParam } from '~/common/queryHelpers';
import { hasSecurityGroupIds } from '~/common/securityGroupsHelpers';
import AIClusterStatus from '~/components/AIComponents/AIClusterStatus';
import { OverviewBillingAccount } from '~/components/clusters/ClusterDetailsMultiRegion/components/Overview/BillingAccount/OverviewBillingAccount';
import clusterStates, {
  canViewMachinePoolTab,
  isHypershiftCluster,
  isROSA,
} from '~/components/clusters/common/clusterStates';
import ClusterStatusErrorDisplay from '~/components/clusters/common/ClusterStatusErrorDisplay';
import { useAWSVPCFromCluster } from '~/components/clusters/common/useAWSVPCFromCluster';
import { IMDSType } from '~/components/clusters/wizards/common';
import useCanClusterAutoscale from '~/hooks/useCanClusterAutoscale';
import { useFetchMachineOrNodePools } from '~/queries/ClusterDetailsQueries/MachinePoolTab/useFetchMachineOrNodePools';
import { isRestrictedEnv } from '~/restrictedEnv';
import { SubscriptionCommonFieldsStatus } from '~/types/accounts_mgmt.v1';

import links from '../../../../../../common/installLinks.mjs';
import { isAISubscriptionWithoutMetrics } from '../../../../../../common/isAssistedInstallerCluster';
import { humanizeValueWithUnit, humanizeValueWithUnitGiB } from '../../../../../../common/units';
import ExternalLink from '../../../../../common/ExternalLink';
import PopoverHint from '../../../../../common/PopoverHint';
import { constants } from '../../../../common/CreateOSDFormConstants';
import totalNodesDataSelector from '../../../../common/totalNodesDataSelector';
import { isArchivedSubscription } from '../../../clusterDetailsHelper';
import SecurityGroupsDisplayByNode from '../../SecurityGroups/SecurityGroupsDetailDisplay';
import ClusterNetwork from '../ClusterNetwork';

import DeleteProtection from './DeleteProtection/DeleteProtection';
import { ClusterStatus } from './ClusterStatus';

function DetailsRight({ cluster, hasAutoscaleCluster, isDeprovisioned, clusterDetailsFetching }) {
  const isHypershift = isHypershiftCluster(cluster);
  const region = cluster?.subscription?.rh_region_id;
  const clusterID = cluster?.id;
  const clusterVersionID = cluster?.version?.id;
  const clusterRawVersionID = cluster?.version?.raw_id;

  const { data: machinePools } = useFetchMachineOrNodePools(
    clusterID,
    isHypershift,
    clusterVersionID,
    region,
    clusterRawVersionID,
  );

  const nodesSectionData = totalNodesDataSelector(cluster, machinePools);

  const [hasAutoscaleMachinePools, setHasAutoscaleMachinePools] = React.useState();
  const [limitedSupport, setLimitedSupport] = React.useState();

  const {
    hasMachinePoolWithAutoscaling,
    totalMinNodesCount,
    totalMaxNodesCount,
    totalDesiredComputeNodes,
    totalActualNodes,
  } = nodesSectionData;

  React.useEffect(() => {
    if (hasMachinePoolWithAutoscaling) {
      setHasAutoscaleMachinePools(true);
    } else {
      setHasAutoscaleMachinePools(false);
      setLimitedSupport(cluster?.status?.limited_support_reason_count > 0);
    }
  }, [
    nodesSectionData,
    cluster?.status?.limited_support_reason_count,
    hasMachinePoolWithAutoscaling,
  ]);

  const canAutoscaleCluster = useCanClusterAutoscale(
    cluster?.subscription?.plan?.type,
    cluster?.subscription?.cluster_billing_model,
    cluster?.subscription?.capabilities,
  );
  const isAWS = cluster.subscription?.cloud_provider_id === 'aws';
  const isGCP = cluster.subscription?.cloud_provider_id === 'gcp';
  const isROSACluster = isROSA(cluster);
  const infraAccount = cluster.subscription?.cloud_account_id || null;
  const hypershiftEtcdEncryptionKey = isHypershift && cluster.aws?.etcd_encryption?.kms_key_arn;
  const { clusterVpc } = useAWSVPCFromCluster(cluster);
  const memoryTotalWithUnit = humanizeValueWithUnit(
    get(cluster, 'metrics.memory.total.value', 0),
    get(cluster, 'metrics.memory.total.unit', 'B'),
  );
  const showWorkerNodesTogether = getQueryParam('showWorkerNodesTogether') === 'true';
  const isDisconnected =
    get(cluster, 'subscription.status', '') === SubscriptionCommonFieldsStatus.Disconnected;

  const billingMarketplaceAccount = get(cluster, 'subscription.billing_marketplace_account', '');

  const showDesiredNodes = cluster.managed;
  const showInfraNodes = isHypershift
    ? false
    : (!cluster.managed && get(cluster, 'metrics.nodes.infra', null)) ||
      get(cluster, 'nodes.infra', 0) > 0;

  const hasSockets = get(cluster, 'metrics.sockets.total.value', 0) > 0;

  const humanizedPersistentStorage =
    cluster.managed &&
    cluster.storage_quota &&
    humanizeValueWithUnitGiB(cluster.storage_quota.value);
  const showVCPU = !isDisconnected && !hasSockets && !isRestrictedEnv();
  const showMemory = !isDisconnected && !isRestrictedEnv();

  const controlPlaneActualNodes = get(cluster, 'metrics.nodes.master', '-');
  const controlPlaneDesiredNodes = get(cluster, 'nodes.master', '-');

  const infraActualNodes = get(cluster, 'metrics.nodes.infra', '-');
  const infraDesiredNodes = get(cluster, 'nodes.infra', '-');
  const cloudProviderId = get(cluster, 'cloud_provider.id', '-');

  const workerActualNodes = totalActualNodes === false ? '-' : totalActualNodes;
  const workerDesiredNodes = totalDesiredComputeNodes || '-';
  const oidcConfig = cluster.aws?.sts?.oidc_config;
  const imdsConfig = cluster.aws?.ec2_metadata_http_tokens || IMDSType.V1AndV2;

  const showSecureBoot = isGCP && !isDeprovisioned;
  const secureBoot = isGCP && cluster.gcp?.security?.secure_boot;

  const showDeleteProtection = cluster.managed && !isArchivedSubscription(cluster);
  const isClusterUninstalling = cluster.state === clusterStates.uninstalling;

  return (
    <DescriptionList>
      {showDeleteProtection ? (
        <DeleteProtection
          clusterID={cluster.id}
          region={cluster.subscription?.rh_region_id}
          protectionEnabled={cluster.delete_protection?.enabled}
          canToggle={cluster.canUpdateClusterResource}
          pending={clusterDetailsFetching}
          isUninstalling={isClusterUninstalling}
        />
      ) : null}
      <DescriptionListGroup>
        <DescriptionListTerm>Status</DescriptionListTerm>
        <DescriptionListDescription style={cluster.state.style}>
          {isAISubscriptionWithoutMetrics(cluster.subscription) ? (
            <div data-testid="aiSubscriptionWithoutMetric">
              <AIClusterStatus status={cluster.metrics.state} className="clusterstate" />
            </div>
          ) : (
            <>
              <ClusterStatus
                cluster={cluster}
                limitedSupport={limitedSupport}
                machinePools={machinePools}
              />
              {limitedSupport ? ' - Limited support' : null}
              {cluster?.status?.provision_error_code && (
                <DescriptionList>
                  {' '}
                  <DescriptionListGroup>
                    <DescriptionListTerm>Details:</DescriptionListTerm>
                    <DescriptionListDescription>
                      <ClusterStatusErrorDisplay clusterStatus={cluster.status} showErrorCode />
                    </DescriptionListDescription>
                  </DescriptionListGroup>
                </DescriptionList>
              )}
            </>
          )}
        </DescriptionListDescription>
      </DescriptionListGroup>
      {showVCPU && (
        <DescriptionListGroup>
          <DescriptionListTerm>Total vCPU</DescriptionListTerm>
          <DescriptionListDescription>
            {cluster.metrics.cpu.total.value} vCPU
          </DescriptionListDescription>
        </DescriptionListGroup>
      )}
      {showMemory && (
        <DescriptionListGroup>
          <DescriptionListTerm>Total memory</DescriptionListTerm>
          <DescriptionListDescription>
            {memoryTotalWithUnit.value} {memoryTotalWithUnit.unit}
          </DescriptionListDescription>
        </DescriptionListGroup>
      )}
      {infraAccount && (
        <DescriptionListGroup>
          <DescriptionListTerm>{`Infrastructure ${cloudProviderId.toUpperCase()} account`}</DescriptionListTerm>
          <DescriptionListDescription>
            <span data-testid={`infrastructure${cloudProviderId.toUpperCase()}Account`}>
              {infraAccount}
            </span>
          </DescriptionListDescription>
        </DescriptionListGroup>
      )}
      {hypershiftEtcdEncryptionKey && (
        <DescriptionListGroup data-testid="hs-etcd-encryption">
          <DescriptionListTerm>KMS etcd encryption key ARN</DescriptionListTerm>
          <DescriptionListDescription>{hypershiftEtcdEncryptionKey}</DescriptionListDescription>
        </DescriptionListGroup>
      )}
      {isROSACluster && !isHypershift && (
        <DescriptionListGroup data-testid="etcd-encryption-key">
          <DescriptionListTerm>Additional encryption </DescriptionListTerm>
          <DescriptionListDescription>
            <span data-testid="etcEncryptionStatus">
              {cluster.etcd_encryption ? 'Enabled' : 'Disabled'}
            </span>
          </DescriptionListDescription>
        </DescriptionListGroup>
      )}
      {billingMarketplaceAccount && <OverviewBillingAccount />}
      {cluster.managed && !cluster.ccs?.enabled && (
        <>
          <DescriptionListGroup>
            <DescriptionListTerm>Load balancers</DescriptionListTerm>
            <DescriptionListDescription>
              {cluster.load_balancer_quota || 'N/A'}
            </DescriptionListDescription>
          </DescriptionListGroup>
          <DescriptionListGroup>
            <DescriptionListTerm>Persistent storage</DescriptionListTerm>
            <DescriptionListDescription data-testid="persistent-storage">
              {humanizedPersistentStorage
                ? `${humanizedPersistentStorage.value}  ${humanizedPersistentStorage.unit}`
                : 'N/A'}
            </DescriptionListDescription>
          </DescriptionListGroup>
        </>
      )}
      {/* Nodes */}
      {!isRestrictedEnv() &&
        (showDesiredNodes && !hasAutoscaleMachinePools ? (
          <DescriptionListGroup>
            <DescriptionListTerm>
              Nodes
              <span className="font-weight-normal"> (actual/desired)</span>
              <PopoverHint
                id="cluster-scaling-hint"
                iconClassName="nodes-hint"
                hint="The actual number of compute nodes may not always match with the number of desired when the cluster is scaling."
              />
            </DescriptionListTerm>
            <DescriptionListDescription>
              <dl className="pf-v6-l-stack">
                {!isHypershift && (
                  <Flex data-testid="controlPlaneNodesCountContainer">
                    <dt>Control plane: </dt>
                    <dd data-testid="controlPlaneNodesCount">
                      {controlPlaneActualNodes !== '-' || controlPlaneDesiredNodes !== '-'
                        ? `${controlPlaneActualNodes}/${controlPlaneDesiredNodes}`
                        : 'N/A'}
                    </dd>
                  </Flex>
                )}
                {showInfraNodes && (
                  <Flex data-testid="InfraNodesCountContainer">
                    <dt>Infra: </dt>
                    <dd data-testid="infraNodesCount">
                      {infraActualNodes !== '-' || infraDesiredNodes !== '-'
                        ? `${infraActualNodes}/${infraDesiredNodes}`
                        : 'N/A'}
                    </dd>
                  </Flex>
                )}
                <Flex>
                  <dt>Compute: </dt>
                  <dd data-testid="computeNodeCount">
                    {workerActualNodes !== '-' || workerDesiredNodes !== '-'
                      ? `${workerActualNodes}/${workerDesiredNodes}`
                      : 'N/A'}
                  </dd>
                </Flex>
              </dl>
            </DescriptionListDescription>
          </DescriptionListGroup>
        ) : (
          <DescriptionListGroup>
            <DescriptionListTerm>Nodes</DescriptionListTerm>
            <DescriptionListDescription>
              <dl className="pf-v6-l-stack">
                {!isHypershift && (
                  <Flex data-testid="controlPlaneNodesCountContainer">
                    <dt>Control plane: </dt>
                    <dd>{get(cluster, 'metrics.nodes.master', 'N/A')}</dd>
                  </Flex>
                )}
                {showInfraNodes && (
                  <Flex data-testid="InfraNodesCountContainer">
                    <dt>Infra: </dt>
                    <dd>{get(cluster, 'metrics.nodes.infra', 'N/A')}</dd>
                  </Flex>
                )}
                <Flex>
                  <dt>Compute: </dt>
                  <dd>{totalActualNodes || 'N/A'}</dd>
                </Flex>
              </dl>
            </DescriptionListDescription>
          </DescriptionListGroup>
        ))}
      {/* Security Groups */}
      {hasSecurityGroupIds(cluster, machinePools) && (
        <DescriptionListGroup>
          <DescriptionListTerm>Additional security groups</DescriptionListTerm>
          <DescriptionListDescription>
            <dl className="pf-v6-l-stack" data-testid="securityGroupsByNode">
              <SecurityGroupsDisplayByNode
                securityGroups={clusterVpc?.aws_security_groups || []}
                securityGroupIdsForControl={
                  cluster?.aws?.additional_control_plane_security_group_ids
                }
                securityGroupIdsForInfra={cluster?.aws?.additional_infra_security_group_ids}
                machinePoolData={machinePools}
                showLinkToMachinePools={canViewMachinePoolTab(cluster)}
                showWorkerNodesTogether={showWorkerNodesTogether}
              />
            </dl>
          </DescriptionListDescription>
        </DescriptionListGroup>
      )}
      {cluster.aiCluster && (
        <>
          <DescriptionListGroup>
            <DescriptionListTerm>Created at</DescriptionListTerm>
            <DescriptionListDescription>
              <Timestamp
                date={new Date(cluster.creation_timestamp)}
                dateFormat={TimestampFormat.short}
                timeFormat={TimestampFormat.medium}
              >
                {!cluster.creation_timestamp && 'N/A'}
              </Timestamp>
            </DescriptionListDescription>
          </DescriptionListGroup>
          <DescriptionListGroup>
            <DescriptionListTerm>Owner</DescriptionListTerm>
            <DescriptionListDescription>
              {get(cluster, 'subscription.creator.name') ||
                get(cluster, 'subscription.creator.username', 'N/A')}
            </DescriptionListDescription>
          </DescriptionListGroup>
        </>
      )}
      {/* Cluster Autoscaling */}
      {canAutoscaleCluster && (
        <DescriptionListGroup>
          <DescriptionListTerm>Cluster autoscaling</DescriptionListTerm>
          <DescriptionListDescription>
            <span data-testid="clusterAutoscalingStatus">
              {hasAutoscaleCluster ? 'Enabled' : 'Disabled'}
            </span>
          </DescriptionListDescription>
        </DescriptionListGroup>
      )}
      {/* MachinePools Autoscaling */}
      {hasAutoscaleMachinePools && (
        <DescriptionListGroup>
          <DescriptionListTerm>
            Autoscale
            <PopoverHint
              id="autoscaling-hint"
              iconClassName="nodes-hint"
              hint={
                <>
                  {constants.autoscaleHint}{' '}
                  <ExternalLink href={links.APPLYING_AUTOSCALING}>
                    Learn more about autoscaling
                  </ExternalLink>
                </>
              }
            />
          </DescriptionListTerm>
          <DescriptionListDescription>Enabled</DescriptionListDescription>
          <DescriptionListDescription>
            <span className="autoscale-data-t">Min:</span> {totalMinNodesCount}
            <span className="pf-v6-u-ml-lg autoscale-data-t">Max: </span>
            {totalMaxNodesCount}
          </DescriptionListDescription>
        </DescriptionListGroup>
      )}
      {/* IMDS */}
      {isAWS && !isHypershift && (
        <DescriptionListGroup>
          <DescriptionListTerm>Instance Metadata Service (IMDS)</DescriptionListTerm>
          <DescriptionListDescription>
            <span data-testid="instanceMetadataService">
              {imdsConfig === IMDSType.V1AndV2 ? 'IMDSv1 and IMDSv2' : 'IMDSv2 only'}
            </span>
          </DescriptionListDescription>
        </DescriptionListGroup>
      )}
      {/* Network */}
      <ClusterNetwork cluster={cluster} />
      {/* Secure Boot */}
      {showSecureBoot && (
        <DescriptionListGroup>
          <DescriptionListTerm>Secure Boot support for Shielded VMs</DescriptionListTerm>
          <DescriptionListDescription>
            <span data-testid="secureBootSupportForShieldedVMs">
              {secureBoot ? 'Enabled' : 'Disabled'}
            </span>
          </DescriptionListDescription>
        </DescriptionListGroup>
      )}
      {/* OIDC config */}
      {oidcConfig && (
        <DescriptionListGroup>
          <DescriptionListTerm>OIDC Configuration</DescriptionListTerm>
          <DescriptionListDescription>
            <dl className="pf-v6-l-stack">
              <Flex>
                <dt>Type:</dt>
                <dd>{oidcConfig?.managed ? 'Red Hat managed' : 'Self-managed'}</dd>
              </Flex>
              <Flex>
                <dt>ID:</dt>
                <dd>{oidcConfig?.id}</dd>
              </Flex>
            </dl>
          </DescriptionListDescription>
        </DescriptionListGroup>
      )}
    </DescriptionList>
  );
}

DetailsRight.propTypes = {
  cluster: PropTypes.any,
  isDeprovisioned: PropTypes.bool,
  hasAutoscaleCluster: PropTypes.bool,
  clusterDetailsFetching: PropTypes.bool,
};

export default DetailsRight;
