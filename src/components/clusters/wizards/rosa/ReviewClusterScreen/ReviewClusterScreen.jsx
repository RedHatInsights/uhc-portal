import React, { useEffect, useMemo, useState } from 'react';
import isEmpty from 'lodash/isEmpty';
import PropTypes from 'prop-types';

import {
  Bullseye,
  Button,
  Flex,
  FlexItem,
  Icon,
  Spinner,
  Stack,
  StackItem,
  Title,
  Tooltip,
  useWizardContext,
} from '@patternfly/react-core';
import ExclamationTriangleIcon from '@patternfly/react-icons/dist/esm/icons/exclamation-triangle-icon';

import { hasExternalAuthenticationCapability } from '~/common/externalAuthHelper';
import { hasSelectedSecurityGroups } from '~/common/securityGroupsHelpers';
import useOrganization from '~/components/CLILoginPage/useOrganization';
import { canSelectImds } from '~/components/clusters/wizards/common/constants';
import { useFormState } from '~/components/clusters/wizards/hooks';
import { getUserRoleForSelectedAWSAccount } from '~/components/clusters/wizards/rosa/AccountsRolesScreen/AccountsRolesScreen';
import { FieldId } from '~/components/clusters/wizards/rosa/constants';
import {
  stepId as rosaStepId,
  stepNameById as rosaStepNameById,
} from '~/components/clusters/wizards/rosa/rosaWizardConstants';
import HiddenCheckbox from '~/components/common/FormikFormComponents/HiddenCheckbox';
import { SyncEditorModal } from '~/components/SyncEditor/SyncEditorModal';
import config from '~/config';
import useCanClusterAutoscale from '~/hooks/useCanClusterAutoscale';
import {
  ALLOW_EUS_CHANNEL,
  CREATE_CLUSTER_YAML_EDITOR,
  HYPERSHIFT_WIZARD_FEATURE,
  IMDS_SELECTION,
  MULTIREGION_PREVIEW_ENABLED,
} from '~/queries/featureGates/featureConstants';
import { useFeatureGate } from '~/queries/featureGates/useFetchFeatureGate';

import { ClusterRequestTranslatorFactory } from '../../common/ClusterRequestTranslator/ClusterRequestTranslatorFactory';
import { DebugClusterRequest } from '../../common/DebugClusterRequest';
import { MESSAGES } from '../../common/messages';
import ReviewSection, {
  FormikReviewItem as ReviewItem,
} from '../../common/ReviewCluster/ReviewSection';
import { createClusterRequest, upgradeScheduleRequest } from '../../common/submitOSDRequest';

import ReviewRoleItem from './ReviewRoleItem';

import './ReviewClusterScreen.scss';

const ReviewClusterScreen = ({
  getUserRole,
  getOCMRole,
  getUserRoleResponse,
  getOCMRoleResponse,
  clearGetUserRoleResponse,
  clearGetOcmRoleResponse,
  createCluster,
  isSubmitPending,
  createClusterResponse,
}) => {
  const isCreateClusterYamlEditorEnabled = useFeatureGate(CREATE_CLUSTER_YAML_EDITOR);
  const isImdsEnabledHypershift = useFeatureGate(IMDS_SELECTION);
  const {
    values: {
      [FieldId.ApplicationIngress]: applicationIngress,
      [FieldId.AssociatedAwsId]: associatedAwsId,
      [FieldId.AutoscalingEnabled]: autoscalingEnabledValue,
      [FieldId.ByoOidcConfigId]: byoOidcConfigId,
      [FieldId.CloudProvider]: cloudProvider,
      [FieldId.ClusterPrivacy]: clusterPrivacy,
      [FieldId.ClusterPrivacyPublicSubnetId]: clusterPrivacyPublicSubnetId,
      [FieldId.ClusterVersion]: clusterVersion,
      [FieldId.ConfigureProxy]: configureProxySelected,
      [FieldId.EtcdKeyArn]: etcdKeyArn,
      [FieldId.HasDomainPrefix]: hasDomainPrefix,
      [FieldId.Hypershift]: hypershiftValue,
      [FieldId.InstallToVpc]: installToVPCSelected,
      [FieldId.KmsKeyArn]: hasCustomKeyARN,
      [FieldId.MachinePoolsSubnets]: machinePoolsSubnets,
      [FieldId.MaxReplicas]: maxReplicas,
      [FieldId.MultiAz]: multiAz,
      [FieldId.NodeLabels]: nodeLabels,
      [FieldId.Product]: product,
      [FieldId.SecurityGroups]: securityGroups,
      [FieldId.SelectedVpc]: selectedVpc,
      [FieldId.SharedVpc]: sharedVpc,
      [FieldId.UpgradePolicy]: upgradePolicy,
      [FieldId.UsePrivateLink]: usePrivateLink,
      [FieldId.WorkerVolumeSizeGib]: workerVolumeSizeGib,
      [FieldId.BillingModel]: billingModel,
      [FieldId.CustomerManagedKey]: customerManagedKey,
      [FieldId.ClusterName]: clusterName,
      [FieldId.MachineTypeAvailability]: machineTypeAvailability,
    },
    values: formValues,
    setFieldValue,
  } = useFormState();
  const machineTypeUnavailableWarning =
    'OCM does not have access to all AWS account details. Machine node type cannot be verified to be accessible for this AWS user.';

  const { goToStepByIndex, getStep } = useWizardContext();
  const canAutoScale = useCanClusterAutoscale(product, billingModel);
  const autoscalingEnabled = canAutoScale && !!autoscalingEnabledValue;
  const isHypershiftSelected = hypershiftValue === 'true';
  const isMultiRegionEnabled = useFeatureGate(MULTIREGION_PREVIEW_ENABLED) && isHypershiftSelected;

  const hasEtcdEncryption = isHypershiftSelected && !!etcdKeyArn;
  const clusterVersionRawId = clusterVersion?.raw_id;
  const showKMSKey = customerManagedKey === 'true' && !!hasCustomKeyARN;
  const hasSecurityGroups = hasSelectedSecurityGroups(securityGroups, isHypershiftSelected);
  const { organization } = useOrganization();
  const hasExternalAuth = hasExternalAuthenticationCapability(organization?.capabilities);

  const isEUSChannelEnabled = useFeatureGate(ALLOW_EUS_CHANNEL);

  const clusterSettingsFields = [
    FieldId.ClusterName,
    ...(hasDomainPrefix ? [FieldId.DomainPrefix] : []),
    ...(isEUSChannelEnabled ? [FieldId.ChannelGroup] : []),
    FieldId.ClusterVersion,
    FieldId.Region,
    FieldId.MultiAz,
    ...(!isHypershiftSelected ? [FieldId.EnableUserWorkloadMonitoring] : []),
    FieldId.CustomerManagedKey,
    ...(showKMSKey ? [FieldId.KmsKeyArn] : []),
    FieldId.EtcdEncryption,
    FieldId.FipsCryptography,
    ...(hasEtcdEncryption ? [FieldId.EtcdKeyArn] : []),
    ...(isHypershiftSelected && hasExternalAuth ? [FieldId.EnableExteranlAuthentication] : []),
  ];

  const [userRole, setUserRole] = useState('');
  const [ocmRole, setOcmRole] = useState('');
  const [errorWithAWSAccountRoles, setErrorWithAWSAccountRoles] = useState(false);
  const isHypershiftEnabled = useFeatureGate(HYPERSHIFT_WIZARD_FEATURE);

  const [isSyncEditorModalOpen, setIsSyncEditorModalOpen] = useState(false);

  const syncEditorModal = useMemo(
    () =>
      isSyncEditorModalOpen ? (
        <SyncEditorModal
          isOpen={isSyncEditorModalOpen}
          closeCallback={() => setIsSyncEditorModalOpen(false)}
          content={ClusterRequestTranslatorFactory.createClusterRequestTranslator(product).toYaml(
            createClusterRequest({ isWizard: true }, formValues),
          )}
          schema={{
            uri: 'https://api.openshift.com/api/clusters_mgmt/v1/openapi#/components/schemas/Cluster',
            fileMatch: ['*'],
          }}
          submitButtonLabel="Create Cluster"
          downloadFileName={`${product}-cluster-${clusterName}.yaml`}
          onSubmit={(values) => {
            const upgradeSchedule = upgradeScheduleRequest(formValues);
            createCluster(values, upgradeSchedule);
          }}
          translatorToObject={
            ClusterRequestTranslatorFactory.createClusterRequestTranslator(product).fromYaml
          }
          isRequestPending={createClusterResponse.pending}
          isRequestFulfilled={createClusterResponse.fulfilled}
          requestErrorMessage={createClusterResponse.errorMessage}
          requestPendingMessage={MESSAGES.INITIATE_CREATE_CLUSTER_REQUEST}
          closeWarningMessage="You won't be able to view or download the YAML after cluster creation begins."
          readOnlyMessage="Cannot edit while cluster creation is being processed."
        />
      ) : null,
    [
      clusterName,
      createCluster,
      createClusterResponse.errorMessage,
      createClusterResponse.fulfilled,
      createClusterResponse.pending,
      formValues,
      isSyncEditorModalOpen,
      product,
    ],
  );

  useEffect(() => {
    clearGetUserRoleResponse();
    clearGetOcmRoleResponse();
    // reset hidden form field to false
    setFieldValue(FieldId.DetectedOcmAndUserRoles, false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (getUserRoleResponse.fulfilled) {
      const userRoleForAWSAccount = getUserRoleForSelectedAWSAccount(
        getUserRoleResponse.data,
        associatedAwsId,
      );
      setUserRole(userRoleForAWSAccount?.sts_user);
    }
    if (
      !getUserRoleResponse.fulfilled &&
      !getUserRoleResponse.pending &&
      !getUserRoleResponse.error
    ) {
      getUserRole();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [getUserRoleResponse]);

  useEffect(() => {
    if (getOCMRoleResponse.fulfilled) {
      setOcmRole(getOCMRoleResponse.data?.arn);
    }
    if (!getOCMRoleResponse.fulfilled && !getOCMRoleResponse.pending && !getOCMRoleResponse.error) {
      getOCMRole(associatedAwsId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [getOCMRoleResponse]);

  useEffect(() => {
    const hasError =
      getUserRoleResponse?.error || !userRole || getOCMRoleResponse?.error || !ocmRole;
    if (hasError !== errorWithAWSAccountRoles) {
      setErrorWithAWSAccountRoles(hasError);
      // setting hidden form field for field level validation
      setFieldValue(FieldId.DetectedOcmAndUserRoles, !hasError);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [getUserRoleResponse, getOCMRoleResponse, userRole, ocmRole, errorWithAWSAccountRoles]);

  // ensure regionalInstance does not exist if !isMultiRegionEnabled
  useEffect(() => {
    if (!isMultiRegionEnabled) {
      setFieldValue(FieldId.RegionalInstance, undefined);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isMultiRegionEnabled]);

  const getStepIndex = (stepKey) => {
    let step = stepKey;
    if (stepKey === 'CLUSTER_SETTINGS') {
      step = 'CLUSTER_SETTINGS__DETAILS';
    }
    const stepById = getStep(rosaStepId[step]);
    return stepById.index;
  };

  const getStepName = (stepKey) => rosaStepNameById[rosaStepId[stepKey]];

  const accountStepId = isHypershiftEnabled
    ? 'ACCOUNTS_AND_ROLES_AS_SECOND_STEP'
    : 'ACCOUNTS_AND_ROLES_AS_FIRST_STEP';

  return isSubmitPending ? (
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
  ) : (
    <>
      <div className="ocm-create-osd-review-screen">
        <Flex>
          <FlexItem>
            <Title headingLevel="h2" className="pf-v6-u-pb-md">
              Review your ROSA cluster
            </Title>
          </FlexItem>
          {isCreateClusterYamlEditorEnabled ? (
            <FlexItem align={{ default: 'alignRight' }}>
              <Button variant="secondary" onClick={() => setIsSyncEditorModalOpen(true)}>
                Edit YAML
              </Button>
            </FlexItem>
          ) : null}
        </Flex>
        <HiddenCheckbox name={FieldId.DetectedOcmAndUserRoles} />
        {isHypershiftEnabled && (
          <ReviewSection
            title={getStepName('CONTROL_PLANE')}
            onGoToStep={() => goToStepByIndex(getStepIndex('CONTROL_PLANE'))}
          >
            {ReviewItem(FieldId.Hypershift)}
          </ReviewSection>
        )}
        <ReviewSection
          title={getStepName(accountStepId)}
          onGoToStep={() => goToStepByIndex(getStepIndex(accountStepId))}
          initiallyExpanded={errorWithAWSAccountRoles}
        >
          {ReviewItem(FieldId.AssociatedAwsId)}
          {isHypershiftSelected && ReviewItem(FieldId.BillingAccountId)}
          {ReviewRoleItem({
            name: 'ocm-role',
            getRoleResponse: getOCMRoleResponse,
            content: ocmRole,
          })}
          {ReviewRoleItem({
            name: 'user-role',
            getRoleResponse: getUserRoleResponse,
            content: userRole,
          })}
          {ReviewItem(FieldId.InstallerRoleArn)}
          {ReviewItem(FieldId.SupportRoleArn)}
          {!isHypershiftSelected && ReviewItem(FieldId.ControlPlaneRoleArn)}
          {ReviewItem(FieldId.WorkerRoleArn)}
        </ReviewSection>
        <ReviewSection
          title={getStepName('CLUSTER_SETTINGS')}
          onGoToStep={() => goToStepByIndex(getStepIndex('CLUSTER_SETTINGS'))}
        >
          {clusterSettingsFields.map((fieldName) => ReviewItem(fieldName))}
        </ReviewSection>
        <ReviewSection
          title="Default machine pool"
          onGoToStep={() => goToStepByIndex(getStepIndex('CLUSTER_SETTINGS__MACHINE_POOL'))}
        >
          <Flex spaceItems={{ default: 'spaceItemsNone' }}>
            <FlexItem>{ReviewItem(FieldId.MachineType)}</FlexItem>
            {machineTypeAvailability && (
              <FlexItem>
                <Tooltip
                  aria-label="Possibly unavailable machine type"
                  content={machineTypeUnavailableWarning}
                >
                  <Icon status="warning" size="md">
                    <ExclamationTriangleIcon />
                  </Icon>
                </Tooltip>
              </FlexItem>
            )}
          </Flex>
          {canAutoScale && ReviewItem(FieldId.AutoscalingEnabled)}
          {autoscalingEnabled
            ? ReviewItem(FieldId.MinReplicas, {
                [FieldId.MultiAz]: multiAz,
                [FieldId.Hypershift]: hypershiftValue,
                [FieldId.MaxReplicas]: maxReplicas,
              })
            : ReviewItem(FieldId.NodesCompute, {
                [FieldId.MultiAz]: multiAz,
                [FieldId.Hypershift]: hypershiftValue,
                [FieldId.MachinePoolsSubnets]: machinePoolsSubnets,
              })}
          {ReviewItem(isHypershiftSelected ? FieldId.SelectedVpc : FieldId.InstallToVpc)}
          {installToVPCSelected &&
            isHypershiftSelected &&
            ReviewItem('aws_hosted_machine_pools', {
              [FieldId.MachinePoolsSubnets]: machinePoolsSubnets,
              [FieldId.SelectedVpc]: selectedVpc,
            })}
          {!(nodeLabels?.length === 1 && isEmpty(nodeLabels[0].key)) &&
            ReviewItem(FieldId.NodeLabels)}
          {!isHypershiftSelected && canSelectImds(clusterVersionRawId) && ReviewItem(FieldId.IMDS)}
          {isHypershiftSelected &&
            isImdsEnabledHypershift &&
            canSelectImds(clusterVersionRawId) &&
            ReviewItem(FieldId.IMDS)}
          {workerVolumeSizeGib && ReviewItem(FieldId.WorkerVolumeSizeGib)}
          {installToVPCSelected &&
            isHypershiftSelected &&
            hasSecurityGroups &&
            ReviewItem(FieldId.SecurityGroups, {
              [FieldId.SelectedVpc]: selectedVpc,
            })}
        </ReviewSection>
        <ReviewSection
          title={getStepName('NETWORKING')}
          onGoToStep={() => goToStepByIndex(getStepIndex('NETWORKING__CONFIGURATION'))}
        >
          {ReviewItem(FieldId.ClusterPrivacy)}
          {clusterPrivacyPublicSubnetId &&
            isHypershiftSelected &&
            ReviewItem(FieldId.ClusterPrivacyPublicSubnetId, {
              [FieldId.SelectedVpc]: selectedVpc,
            })}
          {clusterPrivacy === 'internal' &&
            installToVPCSelected &&
            ReviewItem(FieldId.UsePrivateLink)}
          {installToVPCSelected &&
            !isHypershiftSelected &&
            ReviewItem('aws_standalone_vpc', {
              [FieldId.SelectedVpc]: selectedVpc,
              [FieldId.MachinePoolsSubnets]: machinePoolsSubnets,
              [FieldId.UsePrivateLink]: usePrivateLink,
            })}
          {installToVPCSelected &&
            !isHypershiftSelected &&
            hasSecurityGroups &&
            ReviewItem(FieldId.SecurityGroups, {
              [FieldId.SelectedVpc]: selectedVpc,
            })}
          {sharedVpc?.is_selected && !isHypershiftSelected && ReviewItem(FieldId.SharedVpc)}
          {installToVPCSelected && ReviewItem(FieldId.ConfigureProxy)}
          {installToVPCSelected && configureProxySelected && ReviewItem(FieldId.HttpProxyUrl)}
          {installToVPCSelected && configureProxySelected && ReviewItem(FieldId.HttpsProxyUrl)}
          {installToVPCSelected && configureProxySelected && ReviewItem(FieldId.NoProxyDomains)}
          {installToVPCSelected &&
            configureProxySelected &&
            ReviewItem(FieldId.AdditionalTrustBundle)}
          {ReviewItem(FieldId.NetworkMachineCidr)}
          {ReviewItem(FieldId.NetworkServiceCidr)}
          {ReviewItem(FieldId.NetworkPodCidr)}
          {ReviewItem(FieldId.NetworkHostPrefix)}

          {!isHypershiftSelected && ReviewItem(FieldId.ApplicationIngress)}
          {applicationIngress !== 'default' && !isHypershiftSelected && (
            <>
              {ReviewItem(FieldId.DefaultRouterSelectors)}
              {ReviewItem(FieldId.DefaultRouterExcludedNamespacesFlag)}
              {ReviewItem(FieldId.IsDefaultRouterWildcardPolicyAllowed)}
              {ReviewItem(FieldId.IsDefaultRouterNamespaceOwnershipPolicyStrict)}
            </>
          )}
        </ReviewSection>
        <ReviewSection
          title={getStepName('CLUSTER_ROLES_AND_POLICIES')}
          onGoToStep={() => goToStepByIndex(getStepIndex('CLUSTER_ROLES_AND_POLICIES'))}
        >
          {!isHypershiftSelected && ReviewItem(FieldId.RosaRolesProviderCreationMode)}
          {byoOidcConfigId && (
            <>
              {ReviewItem(FieldId.ByoOidcConfigIdManaged)}
              {ReviewItem(FieldId.ByoOidcConfigId)}
            </>
          )}
          {ReviewItem(FieldId.CustomOperatorRolesPrefix)}
        </ReviewSection>
        <ReviewSection
          title="Updates"
          onGoToStep={() => goToStepByIndex(getStepIndex('CLUSTER_UPDATES'))}
        >
          {ReviewItem(FieldId.UpgradePolicy)}
          {upgradePolicy === 'automatic' && ReviewItem(FieldId.AutomaticUpgradeSchedule)}
          {!isHypershiftSelected && ReviewItem(FieldId.NodeDrainGracePeriod)}
        </ReviewSection>

        {config.fakeOSD && (
          <DebugClusterRequest
            cloudProvider={cloudProvider}
            product={product}
            formValues={formValues}
          />
        )}
      </div>
      {syncEditorModal}
    </>
  );
};

ReviewClusterScreen.propTypes = {
  getUserRole: PropTypes.func.isRequired,
  getOCMRole: PropTypes.func.isRequired,
  getOCMRoleResponse: PropTypes.func.isRequired,
  getUserRoleResponse: PropTypes.object.isRequired,
  clearGetUserRoleResponse: PropTypes.func.isRequired,
  clearGetOcmRoleResponse: PropTypes.func.isRequired,
  createCluster: PropTypes.func.isRequired,
  isSubmitPending: PropTypes.bool,
  createClusterResponse: PropTypes.shape({
    fulfilled: PropTypes.bool,
    error: PropTypes.bool,
    errorMessage: PropTypes.string,
    pending: PropTypes.bool,
    cluster: PropTypes.shape({
      subscription: PropTypes.shape({
        id: PropTypes.string,
      }),
    }),
  }),
};

export default ReviewClusterScreen;
