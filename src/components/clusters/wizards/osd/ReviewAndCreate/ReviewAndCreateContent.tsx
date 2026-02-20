import React from 'react';
import isEmpty from 'lodash/isEmpty';

import {
  Bullseye,
  Spinner,
  Stack,
  StackItem,
  Title,
  useWizardContext,
} from '@patternfly/react-core';

import { hasSelectedSecurityGroups } from '~/common/securityGroupsHelpers';
import {
  canSelectImds,
  CloudProviderType,
  UpgradePolicyType,
} from '~/components/clusters/wizards/common/constants';
import { DebugClusterRequest } from '~/components/clusters/wizards/common/DebugClusterRequest';
import ReviewSection, {
  ReviewItem,
} from '~/components/clusters/wizards/common/ReviewCluster/ReviewSection';
import { useFormState } from '~/components/clusters/wizards/hooks';
import { GCPAuthType } from '~/components/clusters/wizards/osd/ClusterSettings/CloudProvider/types';
import { FieldId, StepId } from '~/components/clusters/wizards/osd/constants';
import config from '~/config';
import useCanClusterAutoscale from '~/hooks/useCanClusterAutoscale';
import {
  ALLOW_EUS_CHANNEL,
  OSD_GCP_WIF,
  Y_STREAM_CHANNEL,
} from '~/queries/featureGates/featureConstants';
import { useFeatureGate } from '~/queries/featureGates/useFetchFeatureGate';

import { MESSAGES } from '../../common/messages';
import { ClusterPrivacyType } from '../Networking/constants';

interface ReviewAndCreateContentProps {
  isPending: boolean;
}

export const ReviewAndCreateContent = ({ isPending }: ReviewAndCreateContentProps) => {
  const { goToStepById } = useWizardContext();
  const {
    values: {
      [FieldId.Product]: product,
      [FieldId.BillingModel]: billingModel,
      [FieldId.InstallToVpc]: installToVpc,
      [FieldId.InstallToSharedVpc]: installToSharedVpc,
      [FieldId.ConfigureProxy]: configureProxy,
      [FieldId.Byoc]: byoc,
      [FieldId.CloudProvider]: cloudProvider,
      [FieldId.NodeLabels]: nodeLabels,
      [FieldId.ClusterPrivacy]: clusterPrivacy,
      [FieldId.ClusterVersion]: clusterVersion,
      [FieldId.ApplicationIngress]: applicationIngress,
      [FieldId.SecurityGroups]: securityGroups,
      [FieldId.HasDomainPrefix]: hasDomainPrefix,
      [FieldId.GcpAuthType]: gcpAuthType,
      [FieldId.GcpWifConfig]: wifConfig,
    },
    values: formValues,
  } = useFormState();
  const canAutoScale = useCanClusterAutoscale(product, billingModel);
  const autoscalingEnabled = canAutoScale && !!formValues[FieldId.AutoscalingEnabled];
  const isWifEnabled = useFeatureGate(OSD_GCP_WIF);
  const isEUSChannelEnabled = useFeatureGate(ALLOW_EUS_CHANNEL);
  const isYStreamChannelEnabled = useFeatureGate(Y_STREAM_CHANNEL);

  const isByoc = byoc === 'true';
  const isAWS = cloudProvider === CloudProviderType.Aws;
  const isGCP = cloudProvider === CloudProviderType.Gcp;

  const hasSecurityGroups = isByoc && hasSelectedSecurityGroups(securityGroups);
  const hasGcpAuthType = isWifEnabled && isGCP && isByoc;
  const hasWIFConfiguration =
    hasGcpAuthType && gcpAuthType === GCPAuthType.WorkloadIdentityFederation && wifConfig;
  const isGCPPrivateClusterInstalltoVPC =
    clusterPrivacy === ClusterPrivacyType.Internal && installToVpc && isGCP;
  const clusterSettingsFields = [
    FieldId.CloudProvider,
    ...(hasGcpAuthType ? [FieldId.GcpAuthType] : []),
    ...(hasWIFConfiguration ? [FieldId.GcpWifConfig] : []),
    FieldId.ClusterName,
    ...(hasDomainPrefix ? [FieldId.DomainPrefix] : []),
    ...(isEUSChannelEnabled && !isYStreamChannelEnabled ? [FieldId.ChannelGroup] : []),
    FieldId.ClusterVersion,
    ...(isYStreamChannelEnabled ? [FieldId.VersionChannel] : []),
    FieldId.Region,
    FieldId.MultiAz,
    ...(isGCP ? [FieldId.SecureBoot] : []),
    FieldId.EnableUserWorkloadMonitoring,
    ...(isByoc ? [FieldId.CustomerManagedKey] : [FieldId.PersistentStorage]),
    ...(isByoc && isAWS ? [FieldId.DisableScpChecks] : []),
    FieldId.EtcdEncryption,
    FieldId.FipsCryptography,
  ];

  if (isPending) {
    return (
      <Bullseye>
        <Stack>
          <StackItem>
            <Bullseye>
              <Spinner size="xl" />
            </Bullseye>
          </StackItem>
          <StackItem>
            <Bullseye>{MESSAGES.INITIATE_CREATE_CLUSTER_REQUEST}</Bullseye>
          </StackItem>
        </Stack>
      </Bullseye>
    );
  }

  return (
    <div className="ocm-create-osd-review-screen">
      <Title headingLevel="h2">Review your dedicated cluster</Title>

      <ReviewSection title="Billing model" onGoToStep={() => goToStepById(StepId.BillingModel)}>
        <ReviewItem name={FieldId.BillingModel} formValues={formValues} />
        <ReviewItem name={FieldId.Byoc} formValues={formValues} />
      </ReviewSection>

      <ReviewSection
        title="Cluster settings"
        onGoToStep={() => goToStepById(StepId.ClusterSettingsCloudProvider)}
      >
        {clusterSettingsFields.map((name) => (
          <ReviewItem key={name} name={name} formValues={formValues} />
        ))}
      </ReviewSection>

      <ReviewSection
        title="Default machine pool"
        onGoToStep={() => goToStepById(StepId.ClusterSettingsMachinePool)}
      >
        <ReviewItem name={FieldId.MachineType} formValues={formValues} />
        {canAutoScale && <ReviewItem name={FieldId.AutoscalingEnabled} formValues={formValues} />}
        {autoscalingEnabled ? (
          <ReviewItem name={FieldId.MinReplicas} formValues={formValues} />
        ) : (
          <ReviewItem name={FieldId.NodesCompute} formValues={formValues} />
        )}
        {!(nodeLabels.length === 1 && isEmpty(nodeLabels[0].key)) && (
          <ReviewItem name={FieldId.NodeLabels} formValues={formValues} />
        )}
        {isAWS && isByoc && clusterVersion && canSelectImds(clusterVersion.raw_id) && (
          <ReviewItem name={FieldId.IMDS} formValues={formValues} />
        )}
      </ReviewSection>

      <ReviewSection
        title="Networking"
        onGoToStep={() =>
          goToStepById(isAWS ? StepId.NetworkingConfiguration : StepId.NetworkingCidrRanges)
        }
      >
        <ReviewItem name={FieldId.ClusterPrivacy} formValues={formValues} />
        {isByoc && <ReviewItem name={FieldId.InstallToVpc} formValues={formValues} />}
        {isByoc && clusterPrivacy === ClusterPrivacyType.Internal && installToVpc && isAWS && (
          <ReviewItem name={FieldId.UsePrivateLink} formValues={formValues} />
        )}
        {isGCPPrivateClusterInstalltoVPC && (
          <ReviewItem name={FieldId.PrivateServiceConnect} formValues={formValues} />
        )}
        {isByoc && isGCP && installToSharedVpc && (
          <ReviewItem name={FieldId.SharedHostProjectID} formValues={formValues} />
        )}
        {isByoc && installToVpc && (
          <ReviewItem name={isAWS ? 'aws_standalone_vpc' : 'gpc_vpc'} formValues={formValues} />
        )}
        {isByoc && installToVpc && hasSecurityGroups && (
          <ReviewItem name="securityGroups" formValues={formValues} />
        )}
        {installToVpc && <ReviewItem name={FieldId.ConfigureProxy} formValues={formValues} />}
        {installToVpc && configureProxy && (
          <>
            <ReviewItem name={FieldId.HttpProxyUrl} formValues={formValues} />
            <ReviewItem name={FieldId.HttpsProxyUrl} formValues={formValues} />
            <ReviewItem name={FieldId.NoProxyDomains} formValues={formValues} />
            <ReviewItem name={FieldId.AdditionalTrustBundle} formValues={formValues} />
          </>
        )}

        <ReviewItem name={FieldId.NetworkMachineCidr} formValues={formValues} />
        <ReviewItem name={FieldId.NetworkServiceCidr} formValues={formValues} />
        <ReviewItem name={FieldId.NetworkPodCidr} formValues={formValues} />
        <ReviewItem name={FieldId.NetworkHostPrefix} formValues={formValues} />

        {isByoc && <ReviewItem name={FieldId.ApplicationIngress} formValues={formValues} />}

        {applicationIngress !== 'default' && isByoc && (
          <>
            <ReviewItem name={FieldId.DefaultRouterSelectors} formValues={formValues} />
            <ReviewItem
              name={FieldId.DefaultRouterExcludedNamespacesFlag}
              formValues={formValues}
            />
            <ReviewItem
              name={FieldId.IsDefaultRouterWildcardPolicyAllowed}
              formValues={formValues}
            />
            <ReviewItem
              name={FieldId.IsDefaultRouterNamespaceOwnershipPolicyStrict}
              formValues={formValues}
            />
          </>
        )}
      </ReviewSection>

      <ReviewSection title="Updates" onGoToStep={() => goToStepById(StepId.ClusterUpdates)}>
        <ReviewItem name={FieldId.UpgradePolicy} formValues={formValues} />
        {formValues[FieldId.UpgradePolicy] === UpgradePolicyType.Automatic && (
          <ReviewItem name={FieldId.AutomaticUpgradeSchedule} formValues={formValues} />
        )}
        <ReviewItem name={FieldId.NodeDrainGracePeriod} formValues={formValues} />
      </ReviewSection>

      {config.fakeOSD && (
        <DebugClusterRequest
          cloudProvider={cloudProvider}
          product={product}
          formValues={formValues}
        />
      )}
    </div>
  );
};
