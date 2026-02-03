import React, { useCallback } from 'react';
import { Field } from 'formik';
import { useDispatch } from 'react-redux';
import semver from 'semver';

import {
  Alert,
  ExpandableSection,
  Flex,
  Form,
  FormGroup,
  Grid,
  GridItem,
  Split,
  SplitItem,
  Title,
} from '@patternfly/react-core';

import { SupportedFeature } from '~/common/featureCompatibility';
import { noQuotaTooltip } from '~/common/helpers';
import links from '~/common/installLinks.mjs';
import {
  asyncValidateClusterName,
  asyncValidateDomainPrefix,
  clusterNameAsyncValidation,
  clusterNameValidation,
  createPessimisticValidator,
  domainPrefixAsyncValidation,
  domainPrefixValidation,
  required,
  validateAWSKMSKeyARN,
} from '~/common/validators';
import { versionComparator } from '~/common/versionComparator';
import { getIncompatibleVersionReason } from '~/common/versionCompatibility';
import { constants } from '~/components/clusters/common/CreateOSDFormConstants';
import LoadBalancersDropdown from '~/components/clusters/common/LoadBalancersDropdown';
import PersistentStorageDropdown from '~/components/clusters/common/PersistentStorageDropdown';
import { QuotaParams } from '~/components/clusters/common/quotaModel';
import { availableQuota } from '~/components/clusters/common/quotaSelectors';
import {
  getMinReplicasCount,
  getNodesCount,
} from '~/components/clusters/common/ScaleSection/AutoScaleSection/AutoScaleHelper';
import { ClassicEtcdEncryptionSection } from '~/components/clusters/wizards/common/ClusterSettings/Details/ClassicEtcdEncryptionSection';
import CloudRegionSelectField from '~/components/clusters/wizards/common/ClusterSettings/Details/CloudRegionSelectField';
import { FipsCryptographySection } from '~/components/clusters/wizards/common/ClusterSettings/Details/FipsCryptographySection';
import { useResetMaxNodesTotal } from '~/components/clusters/wizards/common/ClusterSettings/Details/useResetMaxNodesTotal/useResetMaxNodesTotal';
import { VersionSelectField } from '~/components/clusters/wizards/common/ClusterSettings/Details/VersionSelectField';
import {
  canConfigureDayOnePrivateServiceConnect,
  CloudProviderType,
  emptyAWSSubnet,
} from '~/components/clusters/wizards/common/constants';
import { quotaParams } from '~/components/clusters/wizards/common/utils/quotas';
import {
  CheckboxField,
  RadioGroupField,
  RadioGroupOption,
  RichInputField,
} from '~/components/clusters/wizards/form';
import { useFormState } from '~/components/clusters/wizards/hooks';
import { CustomerManagedEncryption } from '~/components/clusters/wizards/osd/ClusterSettings/Details/CustomerManagedEncryption';
import { FieldId, MIN_SECURE_BOOT_VERSION } from '~/components/clusters/wizards/osd/constants';
import { CheckboxDescription } from '~/components/common/CheckboxDescription';
import ExternalLink from '~/components/common/ExternalLink';
import PopoverHint from '~/components/common/PopoverHint';
import { ALLOW_EUS_CHANNEL } from '~/queries/featureGates/featureConstants';
import { useFeatureGate } from '~/queries/featureGates/useFetchFeatureGate';
import { useFetchSearchClusterName } from '~/queries/RosaWizardQueries/useFetchSearchClusterName';
import { useFetchSearchDomainPrefix } from '~/queries/RosaWizardQueries/useFetchSearchDomainPrefix';
import { getCloudProviders } from '~/redux/actions/cloudProviderActions';
import { useGlobalState } from '~/redux/hooks/useGlobalState';
import {
  QuotaCostList,
  SubscriptionCommonFieldsCluster_billing_model as SubscriptionCommonFieldsClusterBillingModel,
} from '~/types/accounts_mgmt.v1';
import { Version } from '~/types/clusters_mgmt.v1';

import { ChannelGroupSelectField } from '../../../common/ClusterSettings/Details/ChannelGroupSelectField';
import { ShieldedVM } from '../../../common/ShieldedVM';
import { ClusterPrivacyType } from '../../Networking/constants';

function Details() {
  const dispatch = useDispatch();
  const {
    values: {
      [FieldId.Byoc]: byoc,
      [FieldId.ClusterName]: clusterName,
      [FieldId.DomainPrefix]: domainPrefix,
      [FieldId.MultiAz]: multiAz,
      [FieldId.Product]: product,
      [FieldId.BillingModel]: billingModel,
      [FieldId.Region]: region,
      [FieldId.CloudProvider]: cloudProvider,
      [FieldId.ClusterPrivacy]: clusterPrivacy,
      [FieldId.CustomerManagedKey]: hasCustomerManagedKey,
      [FieldId.KmsKeyArn]: kmsKeyArn,
      [FieldId.ClusterVersion]: selectedVersion,
      [FieldId.SecureBoot]: secureBoot,
      [FieldId.MachinePoolsSubnets]: machinePoolsSubnets,
      [FieldId.HasDomainPrefix]: hasDomainPrefix,
      [FieldId.ChannelGroup]: channelGroup,
    },
    errors,
    isValidating,
    setFieldValue,
    getFieldProps,
  } = useFormState();
  const [isExpanded, setIsExpanded] = React.useState(false);
  const [showSecureBootAlert, setShowSecureBootAlert] = React.useState(false);

  const { clusterVersions: getInstallableVersionsResponse } = useGlobalState(
    (state) => state.clusters,
  );

  const isEUSChannelEnabled = useFeatureGate(ALLOW_EUS_CHANNEL);

  const isByoc = byoc === 'true';
  const isMultiAz = multiAz === 'true';
  const isGCP = cloudProvider === CloudProviderType.Gcp;

  const {
    organization: { quotaList },
  } = useGlobalState((state) => state.userProfile);

  const { gcpKeyRings } = useGlobalState((state) => state.ccsInquiries);

  const {
    [FieldId.KeyRing]: keyRingError,
    [FieldId.KeyName]: keyNameError,
    [FieldId.KmsServiceAccount]: kmsServiceAccountError,
    [FieldId.KeyLocation]: keyLocationError,
  } = errors;

  const isGCPError =
    gcpKeyRings.error || keyRingError || keyNameError || kmsServiceAccountError || keyLocationError;

  const isIncompatibleSecureBootVersion =
    isGCP && versionComparator(selectedVersion?.raw_id, MIN_SECURE_BOOT_VERSION) === -1;

  const clusterNameMaxLength = 54; // After removing feature flag, the max length is always 54
  const { data: hasExistingRegionalClusterName } = useFetchSearchClusterName(
    clusterName,
    undefined,
  );

  const { data: hasExistingRegionalDomainPrefix } = useFetchSearchDomainPrefix(
    domainPrefix,
    undefined,
  );

  const { resetMaxNodesTotal } = useResetMaxNodesTotal();

  React.useEffect(() => {
    dispatch(getCloudProviders());
  }, [dispatch]);

  React.useEffect(() => {
    if (hasCustomerManagedKey === 'true') {
      if ((isGCP && isGCPError) || (!isGCP && validateAWSKMSKeyARN(kmsKeyArn, region))) {
        setIsExpanded(true);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isValidating]);

  React.useEffect(() => {
    if (!secureBoot && !isIncompatibleSecureBootVersion) {
      setShowSecureBootAlert(false);
    }
    if (secureBoot && isIncompatibleSecureBootVersion) {
      setShowSecureBootAlert(true);
      setFieldValue(FieldId.SecureBoot, false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isIncompatibleSecureBootVersion]);

  const azQuotaParams = {
    product,
    billingModel,
    isBYOC: isByoc,
    cloudProviderID: cloudProvider,
  } as QuotaParams;

  const hasSingleAzResources =
    availableQuota(quotaList as QuotaCostList, {
      ...quotaParams.singleAzResources,
      ...azQuotaParams,
    }) > 0;

  const hasMultiAzResources =
    availableQuota(quotaList as QuotaCostList, {
      ...quotaParams.multiAzResources,
      ...azQuotaParams,
    }) > 0;

  React.useEffect(() => {
    if (!hasSingleAzResources && hasMultiAzResources) {
      setFieldValue(FieldId.MultiAz, 'true');
    }
  }, [hasSingleAzResources, hasMultiAzResources, setFieldValue]);

  const handleCloudRegionChange = useCallback(() => {
    // Clears fields related to the region: VPC and machinePoolsSubnets
    const azCount = isMultiAz ? 3 : 1;
    const mpSubnetsReset = [];

    for (let i = 0; i < azCount; i += 1) {
      mpSubnetsReset.push(emptyAWSSubnet());
    }

    setFieldValue(FieldId.MachinePoolsSubnets, mpSubnetsReset);
    setFieldValue(FieldId.SelectedVpc, '');
  }, [isMultiAz, setFieldValue]);

  const handleMultiAzChange = (_event: React.FormEvent<HTMLDivElement>, value: string) => {
    const isMultiAz = value === 'true';

    // When multiAz changes, update the node count
    setFieldValue(FieldId.NodesCompute, getNodesCount(isByoc, isMultiAz, true));
    setFieldValue(FieldId.MinReplicas, getMinReplicasCount(isByoc, isMultiAz, true));
    setFieldValue(FieldId.MaxReplicas, '');

    // Make "machinePoolsSubnets" of the correct length
    const mpSubnetsReset = [machinePoolsSubnets[0]];
    if (isMultiAz) {
      mpSubnetsReset.push(emptyAWSSubnet());
      mpSubnetsReset.push(emptyAWSSubnet());
    }
    setFieldValue(FieldId.MachinePoolsSubnets, mpSubnetsReset);

    resetMaxNodesTotal({ isMultiAz });
  };

  const handleVersionChange = (clusterVersion?: Version) => {
    // If features become incompatible with the new version, clear their settings
    const canDefineSecurityGroups = !getIncompatibleVersionReason(
      SupportedFeature.SECURITY_GROUPS,
      clusterVersion?.raw_id,
      { day1: true },
    );
    if (!canDefineSecurityGroups) {
      setFieldValue(FieldId.SecurityGroups, {
        applyControlPlaneToAll: true,
        controlPlane: [],
        infra: [],
        worker: [],
      });
    }
    if (!canConfigureDayOnePrivateServiceConnect(clusterVersion?.raw_id || '')) {
      setFieldValue(FieldId.PrivateServiceConnect, false);
    } else if (clusterPrivacy === ClusterPrivacyType.Internal) {
      setFieldValue(FieldId.PrivateServiceConnect, true);
      setFieldValue(FieldId.InstallToVpc, true);
    }

    resetMaxNodesTotal({ clusterVersion });
  };

  const availableVersions = getInstallableVersionsResponse.versions.filter(
    (version: Version) => version.channel_group === channelGroup,
  );

  React.useEffect(() => {
    if (isEUSChannelEnabled) {
      const parseVersion = (version: string | undefined) => semver.valid(semver.coerce(version));

      const foundVersion =
        availableVersions.length > 0
          ? availableVersions?.find(
              (version: Version) =>
                parseVersion(version?.raw_id) === parseVersion(selectedVersion?.raw_id),
            )
          : null;

      if (foundVersion) {
        setFieldValue(FieldId.ClusterVersion, foundVersion);
      } else {
        setFieldValue(FieldId.ClusterVersion, availableVersions[0]);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [channelGroup, cloudProvider]);

  React.useEffect(() => {
    if (isEUSChannelEnabled) {
      setFieldValue(FieldId.ClusterVersion, selectedVersion);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  React.useEffect(() => {
    if (isEUSChannelEnabled) {
      setFieldValue(FieldId.ClusterVersion, availableVersions[0]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cloudProvider]);

  const availabilityZoneOptions: RadioGroupOption[] = [
    {
      value: 'false',
      label: 'Single zone',
      disabled: !hasSingleAzResources,
      popoverHint: constants.availabilityHintSingleZone,
      ...(!hasSingleAzResources && { tooltip: noQuotaTooltip }),
    },
    {
      value: 'true',
      label: 'Multi-zone',
      disabled: !hasMultiAzResources,
      popoverHint: constants.availabilityHintMultiZone,
      ...(!hasMultiAzResources && { tooltip: noQuotaTooltip }),
    },
  ];

  const validateClusterName = async (value: string) => {
    const requiredError = required(value);
    if (requiredError) {
      return requiredError;
    }

    const syncError = createPessimisticValidator(clusterNameValidation)(
      value,
      clusterNameMaxLength,
    );
    if (syncError) {
      return syncError;
    }

    const clusterNameAsyncError = await asyncValidateClusterName(
      value,
      hasExistingRegionalClusterName,
    );
    if (clusterNameAsyncError) {
      return clusterNameAsyncError;
    }

    return undefined;
  };

  const validateDomainPrefix = async (value: string) => {
    const syncError = createPessimisticValidator(domainPrefixValidation)(value);
    if (syncError) {
      return syncError;
    }

    const domainPrefixAsyncError = await asyncValidateDomainPrefix(
      value,
      undefined,
      hasExistingRegionalDomainPrefix,
    );
    if (domainPrefixAsyncError) {
      return domainPrefixAsyncError;
    }

    return undefined;
  };

  const onToggle = () => {
    setIsExpanded(!isExpanded);
  };

  const secureBootAlert = (
    <div className="pf-v6-u-mt-sm">
      <Alert
        isInline
        variant="danger"
        title={`Secure Boot support requires OpenShift version ${MIN_SECURE_BOOT_VERSION} or above`}
      />
    </div>
  );

  return (
    <Form>
      <Grid hasGutter md={6}>
        <Flex direction={{ default: 'column' }} spaceItems={{ default: 'spaceItemsLg' }}>
          <Title headingLevel="h3">Cluster details</Title>

          <GridItem>
            <Field
              component={RichInputField}
              name={FieldId.ClusterName}
              label="Cluster name"
              type="text"
              validate={validateClusterName}
              validation={(value: string) => clusterNameValidation(value, clusterNameMaxLength)}
              asyncValidation={(value: string) =>
                clusterNameAsyncValidation(value, hasExistingRegionalClusterName)
              }
              isRequired
              extendedHelpText={constants.clusterNameHint}
              input={getFieldProps(FieldId.ClusterName)}
            />
          </GridItem>

          <GridItem>
            <Split hasGutter className="pf-v6-u-mb-0">
              <SplitItem>
                <CheckboxField name={FieldId.HasDomainPrefix} label="Create custom domain prefix" />
              </SplitItem>
              <SplitItem>
                <PopoverHint hint={constants.domainPrefixHint} />
              </SplitItem>
            </Split>
          </GridItem>
          {hasDomainPrefix && (
            <GridItem>
              <Field
                component={RichInputField}
                name={FieldId.DomainPrefix}
                label="Domain prefix"
                type="text"
                validate={validateDomainPrefix}
                validation={domainPrefixValidation}
                asyncValidation={(value: string) =>
                  domainPrefixAsyncValidation(value, undefined, hasExistingRegionalDomainPrefix)
                }
                isRequired
                input={getFieldProps(FieldId.DomainPrefix)}
              />
            </GridItem>
          )}

          {isEUSChannelEnabled ? (
            <GridItem>
              <FormGroup
                label="Channel group"
                isRequired
                fieldId={FieldId.ChannelGroup}
                labelHelp={
                  <PopoverHint
                    hint={
                      <>
                        {constants.channelGroupHint}{' '}
                        <ExternalLink href={links.OSD_LIFE_CYCLE_DATES}>
                          Learn more about the support lifecycle
                        </ExternalLink>
                      </>
                    }
                  />
                }
              >
                <Field
                  component={ChannelGroupSelectField}
                  name={FieldId.ChannelGroup}
                  getInstallableVersionsResponse={getInstallableVersionsResponse}
                />
              </FormGroup>
            </GridItem>
          ) : null}

          <GridItem>
            <VersionSelectField
              name={FieldId.ClusterVersion}
              channelGroup={channelGroup}
              label={
                billingModel === SubscriptionCommonFieldsClusterBillingModel.marketplace_gcp
                  ? 'Version (Google Cloud Marketplace enabled)'
                  : 'Version'
              }
              onChange={handleVersionChange}
              key={channelGroup}
              isEUSChannelEnabled={isEUSChannelEnabled}
            />
          </GridItem>

          <GridItem>
            <FormGroup
              label="Region"
              isRequired
              fieldId={FieldId.Region}
              labelHelp={<PopoverHint hint={constants.regionHint} />}
            >
              <Field
                component={CloudRegionSelectField}
                name={FieldId.Region}
                cloudProviderID={cloudProvider}
                isMultiAz={isMultiAz}
                isBYOC={isByoc}
                handleCloudRegionChange={handleCloudRegionChange}
              />
            </FormGroup>
          </GridItem>

          <GridItem>
            <RadioGroupField
              label="Availability"
              name={FieldId.MultiAz}
              options={availabilityZoneOptions}
              onChange={handleMultiAzChange}
              direction="row"
              isRequired
            />
          </GridItem>

          {!isByoc && (
            <>
              <GridItem>
                <FormGroup
                  label="Persistent storage"
                  fieldId={FieldId.PersistentStorage}
                  labelHelp={<PopoverHint hint={constants.persistentStorageHint} />}
                >
                  <Field
                    name={FieldId.PersistentStorage}
                    input={{
                      ...getFieldProps(FieldId.PersistentStorage),
                      onChange: (value: string) => setFieldValue(FieldId.PersistentStorage, value),
                    }}
                    component={PersistentStorageDropdown}
                    cloudProviderID={cloudProvider}
                    billingModel={billingModel}
                    product={product}
                    isBYOC={isByoc}
                    isMultiAZ={isMultiAz}
                  />
                </FormGroup>
              </GridItem>

              <GridItem>
                <FormGroup
                  label="Load balancers"
                  fieldId={FieldId.LoadBalancers}
                  labelHelp={<PopoverHint hint={constants.loadBalancersHint} />}
                >
                  <Field
                    name={FieldId.LoadBalancers}
                    input={{
                      ...getFieldProps(FieldId.LoadBalancers),
                      onChange: (value: string) => setFieldValue(FieldId.LoadBalancers, value),
                    }}
                    component={LoadBalancersDropdown}
                    currentValue={null}
                    cloudProviderID={cloudProvider}
                    billingModel={billingModel}
                    product={product}
                    isBYOC={isByoc}
                    isMultiAZ={isMultiAz}
                  />
                </FormGroup>
              </GridItem>
            </>
          )}
          {isGCP && (
            <ShieldedVM
              isEditModal={false}
              showSecureBootAlert={showSecureBootAlert}
              secureBootAlert={secureBootAlert}
              isIncompatibleSecureBootVersion={isIncompatibleSecureBootVersion}
            />
          )}
          <GridItem>
            <Title headingLevel="h4">Monitoring</Title>
          </GridItem>

          <Split hasGutter className="pf-v6-u-mb-0">
            <SplitItem>
              <CheckboxField
                name={FieldId.EnableUserWorkloadMonitoring}
                label="Enable user workload monitoring"
              />
            </SplitItem>
            <SplitItem>
              <PopoverHint
                hint={
                  <>
                    {constants.enableUserWorkloadMonitoringHelp}
                    <ExternalLink href={links.OSD_MONITORING_STACK}>Learn more</ExternalLink>
                  </>
                }
              />
            </SplitItem>
          </Split>
          <CheckboxDescription>{constants.enableUserWorkloadMonitoringHint}</CheckboxDescription>

          <ExpandableSection
            toggleText="Advanced Encryption"
            onToggle={onToggle}
            isExpanded={isExpanded}
          >
            <Grid hasGutter>
              {isByoc && (
                <CustomerManagedEncryption
                  hasCustomerManagedKey={hasCustomerManagedKey}
                  region={region}
                  cloudProvider={cloudProvider}
                  kmsKeyArn={kmsKeyArn}
                />
              )}

              <FipsCryptographySection />
              <ClassicEtcdEncryptionSection learnMoreLink={links.OSD_ETCD_ENCRYPTION} />
            </Grid>
          </ExpandableSection>
        </Flex>
      </Grid>
    </Form>
  );
}

export default Details;
