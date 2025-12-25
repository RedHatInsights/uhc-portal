import React, { useMemo } from 'react';
import get from 'lodash/get';
import PropTypes from 'prop-types';

import {
  DescriptionList,
  DescriptionListDescription,
  DescriptionListGroup,
  DescriptionListTerm,
  Skeleton,
  Timestamp,
  TimestampFormat,
} from '@patternfly/react-core';

import { Owner } from '~/components/clusters/ClusterDetailsMultiRegion/components/Overview/Owner/Owner';
import { isCCS, isGCP, isHypershiftCluster } from '~/components/clusters/common/clusterStates';
import getBillingModelLabel from '~/components/clusters/common/getBillingModelLabel';
import {
  ALLOW_EUS_CHANNEL,
  FIPS_FOR_HYPERSHIFT,
  OSD_GCP_WIF,
} from '~/queries/featureGates/featureConstants';
import { useFeatureGate } from '~/queries/featureGates/useFetchFeatureGate';

import { normalizedProducts } from '../../../../../common/subscriptionTypes';
import PopoverHint from '../../../../common/PopoverHint';
import ClusterTypeLabel from '../../../common/ClusterTypeLabel';
import InfrastructureModelLabel from '../../../common/InfrastructureModelLabel';

import { ChannelGroupEdit } from './ChannelGroupEdit/ChannelGroupEdit';
import ClusterVersionInfo from './ClusterVersionInfo';

const getIdFields = (cluster, showAssistedId) => {
  let label = 'Cluster ID';
  let id = get(cluster, 'external_id', 'N/A');
  const assistedId = get(cluster, 'aiCluster.id', 'N/A');
  if (showAssistedId && assistedId) {
    label = `Assisted cluster ID / ${label}`;
    id = `${assistedId} / ${id}`;
  }
  return { id, idLabel: label };
};
function DetailsLeft({
  cluster,
  cloudProviders,
  showAssistedId,
  wifConfigData,
  isArchived,
  isDeprovisioned,
  isDisconnected,
}) {
  const useEusChannel = useFeatureGate(ALLOW_EUS_CHANNEL);
  const isFipsForHypershiftEnabled = useFeatureGate(FIPS_FOR_HYPERSHIFT);
  const cloudProviderId = cluster.cloud_provider ? cluster.cloud_provider.id : null;
  const region = cluster?.region?.id;
  const clusterID = cluster?.id;
  const planType = get(cluster, 'subscription.plan.type');
  const isROSA = planType === normalizedProducts.ROSA;
  const isHypershift = isHypershiftCluster(cluster);
  const isRHOIC = cluster?.subscription?.plan?.type === normalizedProducts.RHOIC;

  const isWifEnabled = useFeatureGate(OSD_GCP_WIF);
  // Only OSD GCP CCS clusters have the authentication type property as they are the only ones that have
  // more than an option for authentication (service account and WIF)
  const hasAuthenticationType = isWifEnabled && isGCP(cluster) && isCCS(cluster);
  // We only have information about the wif configuration, we imply that if a wif config is not used
  // the user chose the other GCP authentication type, the service account
  const isWifCluster = hasAuthenticationType && cluster?.gcp?.authentication?.kind === 'WifConfig';
  const authenticationType = isWifCluster ? 'Workload Identity Federation' : 'Service Account';
  const wifConfigName = useMemo(() => {
    switch (true) {
      case wifConfigData?.isLoading:
        return <Skeleton fontSize="md" width="10em" screenreaderText="Loading WIF configuration" />;
      case wifConfigData?.isSuccess:
        return wifConfigData?.displayName;
      default:
        return 'N/A';
    }
  }, [wifConfigData]);

  let cloudProvider;
  if (cloudProviderId && cloudProviders && cloudProviders[cloudProviderId]) {
    cloudProvider = cloudProviders[cloudProviderId].display_name || 'N/A';
  } else {
    cloudProvider = cloudProviderId ? cloudProviderId.toUpperCase() : 'N/A';
  }

  const { id, idLabel } = getIdFields(cluster, showAssistedId);
  const controlPlaneType = `${isHypershift ? 'Hosted' : 'Classic'} architecture`;
  const sharedVpcZoneId = get(cluster, 'aws.private_hosted_zone_id', false);
  const domainPrefix = cluster?.domain_prefix;
  const availabilityLabel = useMemo(() => {
    if (typeof cluster.multi_az === 'boolean') {
      return cluster.multi_az ? 'Multi-zone' : 'Single zone';
    }
    return 'N/A';
  }, [cluster.multi_az]);

  return (
    <DescriptionList>
      <DescriptionListGroup>
        <DescriptionListTerm>{idLabel}</DescriptionListTerm>
        <DescriptionListDescription>
          <span data-testid="clusterID">{id}</span>
        </DescriptionListDescription>
      </DescriptionListGroup>
      {domainPrefix && (
        <DescriptionListGroup>
          <DescriptionListTerm>Domain prefix</DescriptionListTerm>
          <DescriptionListDescription>
            <span data-testid="domainPrefix">{domainPrefix}</span>
          </DescriptionListDescription>
        </DescriptionListGroup>
      )}
      <DescriptionListGroup>
        <DescriptionListTerm>Type</DescriptionListTerm>
        <DescriptionListDescription>
          <ClusterTypeLabel cluster={cluster} />
        </DescriptionListDescription>
      </DescriptionListGroup>
      {isROSA && (
        <DescriptionListGroup>
          <DescriptionListTerm>Control plane type</DescriptionListTerm>
          <DescriptionListDescription data-testid="controlType">
            <span data-testid="controlPlaneType">{controlPlaneType}</span>
          </DescriptionListDescription>
        </DescriptionListGroup>
      )}
      {!isRHOIC || (isRHOIC && region) ? (
        <DescriptionListGroup>
          <DescriptionListTerm>Region</DescriptionListTerm>
          <DescriptionListDescription>
            <span data-testid="region">{region || 'N/A'}</span>
          </DescriptionListDescription>
        </DescriptionListGroup>
      ) : null}
      {!isROSA && (
        <DescriptionListGroup>
          <DescriptionListTerm>Provider</DescriptionListTerm>
          <DescriptionListDescription>
            <span data-testid="provider">{cloudProvider}</span>
          </DescriptionListDescription>
        </DescriptionListGroup>
      )}
      {hasAuthenticationType && (
        <DescriptionListGroup>
          <DescriptionListTerm>Authentication type</DescriptionListTerm>
          <DescriptionListDescription>
            <span data-testid="authenticationType">{authenticationType}</span>
          </DescriptionListDescription>
        </DescriptionListGroup>
      )}
      {isWifCluster && (
        <DescriptionListGroup>
          <DescriptionListTerm>WIF configuration</DescriptionListTerm>
          <DescriptionListDescription>
            <span data-testid="wifConfiguration">{wifConfigName}</span>
          </DescriptionListDescription>
        </DescriptionListGroup>
      )}
      {cluster.managed && (
        <DescriptionListGroup>
          <DescriptionListTerm>Availability</DescriptionListTerm>
          <DescriptionListDescription>
            <span data-testid="availability">{availabilityLabel}</span>
          </DescriptionListDescription>
        </DescriptionListGroup>
      )}
      {useEusChannel && !isArchived && !isDeprovisioned && !isDisconnected && (
        <ChannelGroupEdit
          clusterID={clusterID}
          channelGroup={cluster?.version?.channel_group}
          cluster={cluster}
          isROSA={isROSA}
        />
      )}
      <DescriptionListGroup>
        <DescriptionListTerm>
          Version
          {isHypershift && (
            <PopoverHint
              iconClassName="pf-v6-u-ml-sm"
              hint="This version is only for the control plane. Worker nodes may have a different version."
            />
          )}
        </DescriptionListTerm>
        <DescriptionListDescription>
          <ClusterVersionInfo cluster={cluster} />
        </DescriptionListDescription>
      </DescriptionListGroup>
      {!!sharedVpcZoneId && (
        <DescriptionListGroup>
          <DescriptionListTerm>Shared VPC hosted zone ID</DescriptionListTerm>
          <DescriptionListDescription>
            <span>{sharedVpcZoneId}</span>
          </DescriptionListDescription>
        </DescriptionListGroup>
      )}
      {(!isHypershift || isFipsForHypershiftEnabled) && cluster.fips ? (
        <DescriptionListGroup>
          <DescriptionListTerm>Encryption level</DescriptionListTerm>
          <DescriptionListDescription>
            <dl className="pf-v6-l-stack">
              <dt data-testid="fipsCryptographyStatus">FIPS Cryptography enabled</dt>
            </dl>
          </DescriptionListDescription>
        </DescriptionListGroup>
      ) : null}
      {cluster?.aws?.kms_key_arn ? (
        <>
          <DescriptionListGroup>
            <DescriptionListTerm>Encrypt volumes with custom keys</DescriptionListTerm>
            <DescriptionListDescription>Enabled</DescriptionListDescription>
          </DescriptionListGroup>
          <DescriptionListGroup>
            <DescriptionListTerm>Custom KMS key ARN</DescriptionListTerm>
            <DescriptionListDescription>{cluster.aws.kms_key_arn}</DescriptionListDescription>
          </DescriptionListGroup>
        </>
      ) : null}
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
      <Owner />
      {cluster.managed && !isROSA && (
        <>
          <DescriptionListGroup>
            <DescriptionListTerm>Subscription billing model</DescriptionListTerm>
            <DescriptionListDescription data-testid="subscription-billing-model">
              {getBillingModelLabel(cluster)}
            </DescriptionListDescription>
          </DescriptionListGroup>
          <DescriptionListGroup>
            <DescriptionListTerm>Infrastructure billing model</DescriptionListTerm>
            <DescriptionListDescription data-testid="infrastructure-billing-model">
              <InfrastructureModelLabel cluster={cluster} />
            </DescriptionListDescription>
          </DescriptionListGroup>
        </>
      )}
    </DescriptionList>
  );
}

DetailsLeft.propTypes = {
  cluster: PropTypes.any,
  isArchived: PropTypes.bool,
  isDisconnected: PropTypes.bool,
  isDeprovisioned: PropTypes.bool,
  cloudProviders: PropTypes.object.isRequired,
  showAssistedId: PropTypes.bool.isRequired,
  wifConfigData: PropTypes.shape({
    displayName: PropTypes.string,
    isLoading: PropTypes.bool,
    isSuccess: PropTypes.bool,
  }),
};

export default DetailsLeft;
