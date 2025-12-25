import React, { useState } from 'react';
import { Field } from 'formik';
import { useDispatch, useSelector } from 'react-redux';
import semver from 'semver';

import {
  Alert,
  ExpandableSection,
  Form,
  FormGroup,
  Grid,
  GridItem,
  Split,
  SplitItem,
  Title,
} from '@patternfly/react-core';

import { hasExternalAuthenticationCapability } from '~/common/externalAuthHelper';
import { SupportedFeature } from '~/common/featureCompatibility';
import { noQuotaTooltip } from '~/common/helpers';
import links from '~/common/installLinks.mjs';
import { getDefaultSecurityGroupsSettings } from '~/common/securityGroupsHelpers';
import { normalizedProducts } from '~/common/subscriptionTypes';
import {
  asyncValidateClusterName,
  asyncValidateDomainPrefix,
  clusterNameAsyncValidation,
  clusterNameValidation,
  createPessimisticValidator,
  domainPrefixAsyncValidation,
  domainPrefixValidation,
} from '~/common/validators';
import { getIncompatibleVersionReason } from '~/common/versionCompatibility';
import { constants } from '~/components/clusters/common/CreateOSDFormConstants';
import { QuotaTypes } from '~/components/clusters/common/quotaModel';
import { availableQuota } from '~/components/clusters/common/quotaSelectors';
import {
  getMinReplicasCount,
  getNodesCount,
} from '~/components/clusters/common/ScaleSection/AutoScaleSection/AutoScaleHelper';
import { CloudProviderType } from '~/components/clusters/wizards/common';
import { ChannelGroupSelectField } from '~/components/clusters/wizards/common/ClusterSettings/Details/ChannelGroupSelectField';
import { ClassicEtcdEncryptionSection } from '~/components/clusters/wizards/common/ClusterSettings/Details/ClassicEtcdEncryptionSection';
import CloudRegionSelectField from '~/components/clusters/wizards/common/ClusterSettings/Details/CloudRegionSelectField';
import { FipsCryptographySection } from '~/components/clusters/wizards/common/ClusterSettings/Details/FipsCryptographySection';
import { useResetMaxNodesTotal } from '~/components/clusters/wizards/common/ClusterSettings/Details/useResetMaxNodesTotal/useResetMaxNodesTotal';
import { emptyAWSSubnet } from '~/components/clusters/wizards/common/constants';
import { RadioGroupField, RichInputField } from '~/components/clusters/wizards/form';
import { CheckboxField } from '~/components/clusters/wizards/form/CheckboxField';
import { useFormState } from '~/components/clusters/wizards/hooks';
import { createOperatorRolesPrefix } from '~/components/clusters/wizards/rosa/ClusterRolesScreen/clusterRolesHelper';
import { AWSCustomerManagedEncryption } from '~/components/clusters/wizards/rosa/ClusterSettings/Details/AWSCustomerManagedEncryption';
import { HCPEtcdEncryptionSection } from '~/components/clusters/wizards/rosa/ClusterSettings/Details/HCPEtcdEncryptionSection';
import VersionSelection from '~/components/clusters/wizards/rosa/ClusterSettings/VersionSelection';
import { FieldId } from '~/components/clusters/wizards/rosa/constants';
import ExternalLink from '~/components/common/ExternalLink';
import PopoverHint from '~/components/common/PopoverHint';
import {
  ALLOW_EUS_CHANNEL,
  FIPS_FOR_HYPERSHIFT,
  MULTIREGION_PREVIEW_ENABLED,
} from '~/queries/featureGates/featureConstants';
import { useFeatureGate } from '~/queries/featureGates/useFetchFeatureGate';
import { findRegionalInstance } from '~/queries/helpers';
import { useFetchGetAvailableRegionalInstances } from '~/queries/RosaWizardQueries/useFetchGetAvailableRegionalInstances';
import { useFetchSearchClusterName } from '~/queries/RosaWizardQueries/useFetchSearchClusterName';
import { useFetchSearchDomainPrefix } from '~/queries/RosaWizardQueries/useFetchSearchDomainPrefix';
import { getMachineTypesByRegionARN } from '~/redux/actions/machineTypesActions';
import { useGlobalState } from '~/redux/hooks';
import { QuotaCostList } from '~/types/accounts_mgmt.v1';
import { Version } from '~/types/clusters_mgmt.v1';

import { MultiRegionCloudRegionSelectField } from '../../../common/ClusterSettings/Details/CloudRegionSelectField/MultiRegionCloudRegionSelectField';

import { EnableExternalAuthentication } from './EnableExternalAuthentication';

function Details() {
  const {
    values: {
      [FieldId.Hypershift]: hypershiftValue,
      [FieldId.MultiAz]: multiAz,
      [FieldId.BillingModel]: billingModel,
      [FieldId.Region]: region,
      [FieldId.RegionalInstance]: regionalInstance,
      [FieldId.MachinePoolsSubnets]: machinePoolsSubnets,
      [FieldId.ClusterPrivacy]: clusterPrivacy,
      [FieldId.InstallerRoleArn]: installerRoleArn,
      [FieldId.HasDomainPrefix]: hasDomainPrefix,
      [FieldId.ClusterName]: clusterName,
      [FieldId.DomainPrefix]: domainPrefix,
      [FieldId.ChannelGroup]: channelGroup,
      [FieldId.ClusterVersion]: selectedVersion,
    },
    errors,
    getFieldProps,
    setFieldValue,
    setFieldTouched,
    validateForm,
  } = useFormState();

  const machineTypesByRegion = useSelector((state: any) => state.machineTypesByRegion);
  const dispatch = useDispatch();

  React.useEffect(() => {
    // if machineTypeByRegion.region cache does not exist or if the region is new, load new machines
    if (
      region &&
      (!machineTypesByRegion.region ||
        (machineTypesByRegion.region && machineTypesByRegion.region.id !== region))
    ) {
      dispatch(getMachineTypesByRegionARN(installerRoleArn, region));
    }
  }, [region, installerRoleArn, machineTypesByRegion.region, dispatch]);

  const isHypershiftSelected = hypershiftValue === 'true';
  const isMultiAz = multiAz === 'true';
  const isMultiRegionEnabled = useFeatureGate(MULTIREGION_PREVIEW_ENABLED) && isHypershiftSelected;
  const isEUSChannelEnabled = useFeatureGate(ALLOW_EUS_CHANNEL);
  const isFipsForHypershiftEnabled = useFeatureGate(FIPS_FOR_HYPERSHIFT);

  const getInstallableVersionsResponse = useGlobalState((state) => state.clusters.clusterVersions);

  React.useEffect(() => {
    if (isEUSChannelEnabled) {
      const parseVersion = (version: string | undefined) => semver.valid(semver.coerce(version));

      const availableVersions = getInstallableVersionsResponse.versions.filter(
        (version: Version) => version.channel_group === channelGroup,
      );

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
  }, [channelGroup]);

  const [isExpanded, setIsExpanded] = useState(false);
  const onToggle = () => {
    setIsExpanded(!isExpanded);
  };

  const [isExternalAuthExpanded, setIsExternalAuthExpanded] = useState(false);

  const onExternalAuthToggle = () => {
    setIsExternalAuthExpanded(!isExternalAuthExpanded);
  };

  const {
    data: availableRegionalInstances,
    isFetching: isAvailableRegionalInstancesFetching,
    isError: isAvailableRegionalInstancesError,
  } = useFetchGetAvailableRegionalInstances(isMultiRegionEnabled);

  React.useEffect(() => {
    if (
      isMultiRegionEnabled &&
      availableRegionalInstances &&
      !isAvailableRegionalInstancesFetching &&
      !isAvailableRegionalInstancesError
    ) {
      setFieldValue(
        FieldId.RegionalInstance,
        findRegionalInstance(region, availableRegionalInstances),
      );
    }
  }, [
    isMultiRegionEnabled,
    region,
    availableRegionalInstances,
    isAvailableRegionalInstancesFetching,
    setFieldValue,
    isAvailableRegionalInstancesError,
  ]);

  const regionSearch = regionalInstance?.id;

  const { data: hasExistingRegionalClusterName, isFetching: isSearchClusterNameFetching } =
    useFetchSearchClusterName(clusterName, regionSearch);

  const { data: hasExistingRegionalDomainPrefix, isFetching: isSearchDomainPrefixFetching } =
    useFetchSearchDomainPrefix(domainPrefix, regionSearch);

  React.useEffect(() => {
    if (isMultiRegionEnabled) {
      setFieldTouched(FieldId.ClusterName);
      setFieldTouched(FieldId.DomainPrefix);
    }
  }, [
    isMultiRegionEnabled,
    hasExistingRegionalClusterName,
    hasExistingRegionalDomainPrefix,
    setFieldTouched,
  ]);

  // Region change may invalidate various fields.
  React.useEffect(() => {
    validateForm();
  }, [region, hasExistingRegionalClusterName, hasExistingRegionalDomainPrefix, validateForm]);

  // Expand section to reveal validation errors.
  React.useEffect(() => {
    if (errors[FieldId.KmsKeyArn]) {
      setIsExpanded(true);
      setFieldTouched(FieldId.KmsKeyArn);
    }

    if (errors[FieldId.EtcdKeyArn]) {
      setIsExpanded(true);
      setFieldTouched(FieldId.EtcdKeyArn);
    }
  }, [errors, setFieldTouched]);

  const {
    organization: { quotaList, details: organizationDetails },
  } = useGlobalState((state) => state.userProfile);

  const clusterNameMaxLength = 54; // After removing feature flag, the max length is always 54

  const { resetMaxNodesTotal } = useResetMaxNodesTotal();

  const validateClusterName = async (value: string) => {
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

    if (isMultiRegionEnabled && (isSearchClusterNameFetching || !region)) {
      return true;
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
      isMultiRegionEnabled,
      hasExistingRegionalDomainPrefix,
    );
    if (domainPrefixAsyncError) {
      return domainPrefixAsyncError;
    }

    if (isMultiRegionEnabled && (isSearchDomainPrefixFetching || !region)) {
      return true;
    }

    return undefined;
  };

  const handleVersionChange = (clusterVersion: Version | undefined) => {
    if (!clusterVersion) {
      return;
    }
    // If features become incompatible with the new version, clear their settings
    const canDefineSecurityGroups = !getIncompatibleVersionReason(
      SupportedFeature.SECURITY_GROUPS,
      clusterVersion.raw_id,
      { day1: true },
    );
    if (!canDefineSecurityGroups) {
      setFieldValue(FieldId.SecurityGroups, getDefaultSecurityGroupsSettings());
    }

    if (!isHypershiftSelected) {
      resetMaxNodesTotal({ clusterVersion });
    }
  };

  const handleCloudRegionChange = () => {
    // Clears fields related to the region: Availability zones, subnet IDs, VPCs
    const mpSubnetsReset = new Array(isMultiAz ? 3 : 1).fill(emptyAWSSubnet());
    setFieldValue(FieldId.MachinePoolsSubnets, mpSubnetsReset);
    setFieldValue(FieldId.SelectedVpc, { id: '', name: '' });

    // Reset the public subnet ID selection associated with cluster privacy on region change,
    // since the list of values there can change entirely based on the selected region.
    if (clusterPrivacy === 'external') {
      setFieldValue(FieldId.ClusterPrivacyPublicSubnetId, '');
    }
  };

  const hasAzResources = (isMultiAz: boolean) => {
    const params = {
      product: normalizedProducts.ROSA,
      cloudProviderID: CloudProviderType.Aws,
      isBYOC: true,
      billingModel,
      isMultiAz,
    };
    // TODO: OCMUI-943: CCS requires quota for both cluster and node.
    //   But how many nodes does ROSA require at creation time?
    const clusterQuota = availableQuota(quotaList as QuotaCostList, {
      ...params,
      resourceType: QuotaTypes.CLUSTER,
    });
    return clusterQuota >= 1;
  };

  const quotaDisabledAndTooltip = (hasQuota: boolean) =>
    hasQuota
      ? {
          disabled: false,
        }
      : {
          disabled: true,
          tooltip: noQuotaTooltip,
        };

  const availabilityZoneOptions = [
    {
      value: 'false',
      label: 'Single zone',
      popoverHint: constants.availabilityHintSingleZone,
      ...quotaDisabledAndTooltip(hasAzResources(false)),
    },
    {
      value: 'true',
      label: 'Multi-zone',
      popoverHint: constants.availabilityHintMultiZone,
      ...quotaDisabledAndTooltip(hasAzResources(true)),
    },
  ];

  const handleMultiAzChange = (_event: React.FormEvent<HTMLDivElement>, value: string) => {
    // when multiAz changes, reset node count
    const isValueMultiAz = value === 'true';
    setFieldValue(FieldId.NodesCompute, getNodesCount(true, isValueMultiAz, true));
    const replicas = getMinReplicasCount(true, isValueMultiAz, true, isHypershiftSelected);
    setFieldValue(FieldId.MinReplicas, replicas);
    setFieldValue(FieldId.MaxReplicas, replicas);

    // Make "machinePoolsSubnets" of the correct length
    const mpSubnetsReset = [machinePoolsSubnets?.[0] || emptyAWSSubnet()];
    if (isValueMultiAz) {
      mpSubnetsReset.push(emptyAWSSubnet());
      mpSubnetsReset.push(emptyAWSSubnet());
    }
    setFieldValue(FieldId.MachinePoolsSubnets, mpSubnetsReset);

    if (!isHypershiftSelected) {
      resetMaxNodesTotal({ isMultiAz: isValueMultiAz });
    }
  };

  const RegionField = (
    <>
      <GridItem md={6}>
        <FormGroup
          label="Region"
          isRequired
          fieldId={FieldId.Region}
          labelHelp={<PopoverHint hint={constants.regionHint} />}
        >
          {isMultiRegionEnabled ? (
            <Field
              component={MultiRegionCloudRegionSelectField}
              name={FieldId.Region}
              cloudProviderID={CloudProviderType.Aws}
              handleCloudRegionChange={handleCloudRegionChange}
            />
          ) : (
            <Field
              component={CloudRegionSelectField}
              name={FieldId.Region}
              cloudProviderID={CloudProviderType.Aws}
              isBYOC
              isMultiAz={isMultiAz}
              isHypershiftSelected={isHypershiftSelected}
              handleCloudRegionChange={handleCloudRegionChange}
            />
          )}
        </FormGroup>
      </GridItem>
      <GridItem md={6} />
    </>
  );

  return (
    <Form
      onSubmit={(event) => {
        event.preventDefault();
        return false;
      }}
    >
      <Grid hasGutter>
        <GridItem>
          <Title headingLevel="h3">Cluster details</Title>
        </GridItem>

        {isMultiRegionEnabled ? RegionField : null}

        <GridItem md={6}>
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
            input={{
              ...getFieldProps(FieldId.ClusterName),
              onChange: async (value: string) => {
                setFieldValue(
                  FieldId.CustomOperatorRolesPrefix,
                  createOperatorRolesPrefix(value),
                  false,
                );
              },
            }}
          />
        </GridItem>
        <GridItem md={6} />

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
          <>
            <GridItem md={6}>
              <Field
                component={RichInputField}
                name={FieldId.DomainPrefix}
                label="Domain prefix"
                type="text"
                validate={validateDomainPrefix}
                validation={domainPrefixValidation}
                asyncValidation={(value: string) =>
                  domainPrefixAsyncValidation(
                    value,
                    isMultiRegionEnabled,
                    hasExistingRegionalDomainPrefix,
                  )
                }
                isRequired
                input={getFieldProps(FieldId.DomainPrefix)}
              />
            </GridItem>
            <GridItem md={6} />
          </>
        )}

        {isEUSChannelEnabled ? (
          <GridItem md={6}>
            <FormGroup
              label="Channel group"
              isRequired
              fieldId={FieldId.ChannelGroup}
              labelHelp={
                <PopoverHint
                  hint={
                    <>
                      {constants.channelGroupHint}{' '}
                      <ExternalLink href={links.ROSA_LIFE_CYCLE_DATES}>
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
        {isEUSChannelEnabled ? <GridItem md={6} /> : null}

        <GridItem md={6}>
          <VersionSelection
            label="Version"
            onChange={handleVersionChange}
            channelGroup={channelGroup}
            isEUSChannelEnabled={isEUSChannelEnabled}
            key={selectedVersion?.id}
          />
        </GridItem>
        <GridItem md={6} />

        {!isMultiRegionEnabled ? RegionField : null}

        {isHypershiftSelected ? (
          <Alert
            isInline
            variant="info"
            title="The hosted control plane uses multiple availability zones."
          />
        ) : (
          <>
            <GridItem md={6}>
              <RadioGroupField
                label="Availability"
                name={FieldId.MultiAz}
                options={availabilityZoneOptions}
                onChange={handleMultiAzChange}
                direction="row"
                isRequired
              />
            </GridItem>
            <GridItem md={6} />
          </>
        )}

        {!isHypershiftSelected && (
          <>
            <GridItem>
              <Title headingLevel="h4">Monitoring</Title>
            </GridItem>

            <GridItem>
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
                        <ExternalLink href={links.ROSA_MONITORING}>Learn more</ExternalLink>
                      </>
                    }
                  />
                </SplitItem>
              </Split>
              <div className="ocm-c--reduxcheckbox-description">
                {constants.enableUserWorkloadMonitoringHint}
              </div>
            </GridItem>
          </>
        )}

        <ExpandableSection
          toggleText="Advanced Encryption"
          onToggle={onToggle}
          isExpanded={isExpanded}
        >
          <Grid hasGutter>
            <AWSCustomerManagedEncryption />
            {!isHypershiftSelected || isFipsForHypershiftEnabled ? (
              <FipsCryptographySection />
            ) : null}
            {isHypershiftSelected ? <HCPEtcdEncryptionSection /> : <ClassicEtcdEncryptionSection />}
          </Grid>
        </ExpandableSection>
        {isHypershiftSelected &&
        hasExternalAuthenticationCapability(organizationDetails?.capabilities) ? (
          <ExpandableSection
            toggleText="External Authentication"
            onToggle={onExternalAuthToggle}
            isExpanded={isExternalAuthExpanded}
          >
            <EnableExternalAuthentication />
          </ExpandableSection>
        ) : null}
      </Grid>
    </Form>
  );
}

export default Details;
