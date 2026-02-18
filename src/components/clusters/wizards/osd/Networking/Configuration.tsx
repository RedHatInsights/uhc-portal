import React from 'react';

import { Alert, Content, Form, FormGroup, Grid, GridItem, Title } from '@patternfly/react-core';

import { ocmResourceType, TrackEvent, trackEvents } from '~/common/analytics';
import links from '~/common/installLinks.mjs';
import { getDefaultSecurityGroupsSettings } from '~/common/securityGroupsHelpers';
import { normalizedProducts } from '~/common/subscriptionTypes';
import { isExactMajorMinor } from '~/common/versionHelpers';
import { constants } from '~/components/clusters/common/CreateOSDFormConstants';
import {
  canConfigureDayOneManagedIngress,
  canConfigureDayOnePrivateServiceConnect,
  CloudProviderType,
} from '~/components/clusters/wizards/common/constants';
import {
  CheckboxField,
  RadioGroupField,
  RadioGroupOption,
} from '~/components/clusters/wizards/form';
import { useFormState } from '~/components/clusters/wizards/hooks';
import { GCPAuthType } from '~/components/clusters/wizards/osd/ClusterSettings/CloudProvider/types';
import { FieldId } from '~/components/clusters/wizards/osd/constants';
import { useIsOSDFromGoogleCloud } from '~/components/clusters/wizards/osd/useIsOSDFromGoogleCloud';
import ExternalLink from '~/components/common/ExternalLink';
import useAnalytics from '~/hooks/useAnalytics';

import { FormSubnet } from '../../common/FormSubnet';

import { ApplicationIngressType, ClusterPrivacyType } from './constants';
import { DefaultIngressFields } from './DefaultIngressFields';

export const Configuration = () => {
  const track = useAnalytics();
  const {
    values: {
      [FieldId.CloudProvider]: cloudProvider,
      [FieldId.Product]: product,
      [FieldId.Byoc]: byoc,
      [FieldId.ClusterVersion]: clusterVersion,
      [FieldId.ClusterPrivacy]: clusterPrivacy,
      [FieldId.ConfigureProxy]: configureProxy,
      [FieldId.InstallToVpc]: installToVpc,
      [FieldId.UsePrivateLink]: usePrivateLink,
      [FieldId.ApplicationIngress]: applicationIngress,
      [FieldId.MachinePoolsSubnets]: machinePoolSubnets,
      [FieldId.GcpAuthType]: authTypeFormValue,
    },
    values,
    setFieldValue,
  } = useFormState();
  const isByoc = byoc === 'true';
  const isGCP = cloudProvider === CloudProviderType.Gcp;
  const isPrivateCluster = clusterPrivacy === ClusterPrivacyType.Internal;
  const showClusterPrivacy =
    cloudProvider === CloudProviderType.Aws || (cloudProvider === CloudProviderType.Gcp && isByoc);
  const showConfigureProxy =
    isByoc && [normalizedProducts.OSD, normalizedProducts.OSDTrial].includes(product);
  const clusterVersionRawId: string | undefined = clusterVersion?.raw_id;
  const showPrivateServiceConnect =
    isByoc &&
    isGCP &&
    [normalizedProducts.OSD, normalizedProducts.OSDTrial].includes(product) &&
    clusterVersionRawId &&
    canConfigureDayOnePrivateServiceConnect(clusterVersionRawId);
  const isWifAuth = authTypeFormValue === GCPAuthType.WorkloadIdentityFederation;

  const showExistingVpcInstallText = !(isGCP && isPrivateCluster && isWifAuth);
  const PSCPrivateWifWarning =
    isGCP && isPrivateCluster && isWifAuth
      ? 'Private clusters deployed using Workload Identity Federation must be deployed into an existing VPC.'
      : '';
  const isOSDFromGoogleCloud = useIsOSDFromGoogleCloud();
  const trackOcmResourceType =
    product === normalizedProducts.ROSA ? ocmResourceType.MOA : ocmResourceType.OSD;

  const showIngressSection = isByoc;
  const isManagedIngressAllowed =
    clusterVersionRawId && canConfigureDayOneManagedIngress(clusterVersionRawId);
  const isOcp413 = clusterVersionRawId && isExactMajorMinor(clusterVersionRawId, 4, 13);

  React.useEffect(() => {
    if (isWifAuth && showPrivateServiceConnect && isPrivateCluster) {
      setFieldValue(FieldId.InstallToVpc, true);
      setFieldValue(FieldId.PrivateServiceConnect, true);
    }
  }, [isWifAuth, showPrivateServiceConnect, isPrivateCluster, setFieldValue]);

  const trackCheckedState = (trackEvent: TrackEvent, checked: boolean) =>
    track(trackEvent, {
      resourceType: trackOcmResourceType,
      customProperties: {
        checked,
      },
    });

  const clearSecurityGroups = () => {
    if (values.securityGroups) {
      setFieldValue(FieldId.SecurityGroups, getDefaultSecurityGroupsSettings());
    }
  };

  const onClusterPrivacyChange = (_event: React.FormEvent<HTMLInputElement>, value: string) => {
    if (value === ClusterPrivacyType.External) {
      setFieldValue(FieldId.UsePrivateLink, false);

      const hasFilledMachinePoolsSubnets = machinePoolSubnets.some(
        (mpSubnet: FormSubnet) =>
          mpSubnet.availabilityZone || mpSubnet.publicSubnetId || mpSubnet.privateSubnetId,
      );

      if (!hasFilledMachinePoolsSubnets) {
        if (!isOSDFromGoogleCloud) {
          setFieldValue(FieldId.InstallToVpc, false);
        }
        clearSecurityGroups();

        // Also unset "Configure a cluster-wide proxy" if enabled
        if (configureProxy) {
          setFieldValue(FieldId.ConfigureProxy, false);
        }
      }
      trackCheckedState(trackEvents.PrivateServiceConnect, false);
      setFieldValue(FieldId.PrivateServiceConnect, false);
    } else if (showPrivateServiceConnect) {
      trackCheckedState(trackEvents.PrivateServiceConnect, true);
      setFieldValue(FieldId.PrivateServiceConnect, true);
      setFieldValue(FieldId.InstallToVpc, true);
      trackCheckedState(trackEvents.InstallIntoVPC, true);
    }
  };

  const onPrivateLinkChange = (_event: React.FormEvent<HTMLInputElement>, checked: boolean) => {
    setFieldValue(FieldId.UsePrivateLink, checked);

    if (checked) {
      setFieldValue(FieldId.InstallToVpc, true);
    }
  };

  const onClusterProxyChange = (_event: React.FormEvent<HTMLInputElement>, checked: boolean) => {
    trackCheckedState(trackEvents.ConfigureClusterWideProxy, checked);
    setFieldValue(FieldId.ConfigureProxy, checked);

    if (checked && !installToVpc) {
      setFieldValue(FieldId.InstallToVpc, true);
      trackCheckedState(trackEvents.InstallIntoVPC, checked);
    }
  };

  const onPrivateServiceConnectChange = (
    _event: React.FormEvent<HTMLInputElement>,
    checked: boolean,
  ) => {
    trackCheckedState(trackEvents.PrivateServiceConnect, checked);
    setFieldValue(FieldId.PrivateServiceConnect, checked);
    if (checked && !installToVpc) {
      setFieldValue(FieldId.InstallToVpc, true);
      trackCheckedState(trackEvents.InstallIntoVPC, checked);
    }
  };

  const onInstallIntoVPCchange = (_event: React.FormEvent<HTMLInputElement>, checked: boolean) => {
    setFieldValue(FieldId.InstallToVpc, checked);
    clearSecurityGroups();
    trackCheckedState(trackEvents.InstallIntoVPC, checked);
    if (showPrivateServiceConnect && isPrivateCluster) {
      setFieldValue(FieldId.PrivateServiceConnect, checked);
    }
  };

  const onApplicationIngressChange = (value: string) => {
    setFieldValue(FieldId.ApplicationIngress, value);
  };

  const clusterPrivacyOptions: RadioGroupOption[] = [
    {
      value: ClusterPrivacyType.External,
      label: 'Public',
      description: 'Access Kubernetes API endpoint and application routes from the internet.',
    },
    {
      value: ClusterPrivacyType.Internal,
      label: 'Private',
      description:
        'Access Kubernetes API endpoint and application routes from direct private connections only.',
    },
  ];

  const applicationIngressOptions: RadioGroupOption[] = [
    {
      value: ApplicationIngressType.Default,
      label: 'Default settings',
    },
    {
      value: ApplicationIngressType.Custom,
      label: 'Custom settings',
    },
  ];

  return (
    <Form>
      <Grid hasGutter>
        <GridItem>
          <Title headingLevel="h3">Networking configuration</Title>
          <Content component="p" className="pf-v6-u-mt-sm">
            Configure network access for your cluster.
          </Content>
        </GridItem>

        {showClusterPrivacy && (
          <>
            <GridItem>
              <Title headingLevel="h4" size="xl" className="privacy-heading">
                Cluster privacy
              </Title>
              <Content component="p" className="pf-v6-u-mt-sm">
                Install your cluster with all public or private API endpoints and application
                routes.
              </Content>
            </GridItem>

            <GridItem span={6}>
              <RadioGroupField
                name={FieldId.ClusterPrivacy}
                options={clusterPrivacyOptions}
                onChange={onClusterPrivacyChange}
              />
            </GridItem>

            {isPrivateCluster && (
              <GridItem>
                <Alert
                  isInline
                  variant="warning"
                  title={`${PSCPrivateWifWarning} You will not be able to access your cluster until you properly configure private network connectivity to your cloud provider.`}
                >
                  {cloudProvider === CloudProviderType.Aws && (
                    <ExternalLink href={links.OSD_AWS_PRIVATE_CONNECTIONS}>
                      Learn more about configuring network settings
                    </ExternalLink>
                  )}
                </Alert>
              </GridItem>
            )}
          </>
        )}

        {isByoc && (
          <>
            <GridItem>
              <Title headingLevel="h4" size="xl" className="privacy-heading">
                Virtual Private Cloud (VPC)
              </Title>
              {!isOSDFromGoogleCloud && showExistingVpcInstallText ? (
                <Content component="p" className="pf-v6-u-mt-sm">
                  By default, a new VPC will be created for your cluster. Alternatively, you may opt
                  to install to an existing VPC below.
                </Content>
              ) : null}
            </GridItem>

            <GridItem span={6}>
              <FormGroup fieldId={FieldId.InstallToVpc}>
                <CheckboxField
                  name={FieldId.InstallToVpc}
                  label="Install into an existing VPC"
                  input={{ onChange: onInstallIntoVPCchange }}
                  isDisabled={
                    usePrivateLink ||
                    configureProxy ||
                    (isPrivateCluster && isWifAuth) ||
                    isOSDFromGoogleCloud
                  }
                />

                <div className="pf-v6-u-ml-lg pf-v6-u-mt-md">
                  {isPrivateCluster && cloudProvider === CloudProviderType.Aws && (
                    <CheckboxField
                      name={FieldId.UsePrivateLink}
                      label="Use a PrivateLink"
                      input={{
                        onChange: onPrivateLinkChange,
                      }}
                      helperText={constants.privateLinkHint}
                    />
                  )}
                  {isPrivateCluster && showPrivateServiceConnect && (
                    <div className="pf-v6-u-mt-md">
                      <CheckboxField
                        name={FieldId.PrivateServiceConnect}
                        label="Use Private Service Connect"
                        input={{
                          onChange: onPrivateServiceConnectChange,
                        }}
                        isDisabled={isWifAuth}
                        hint={
                          <p>
                            Red Hat recommends using Private Service Connect when deploying a
                            Private OpenShift Dedicated cluster on Google Cloud. Private Service
                            Connect ensures there is a secured, private connectivity between Red Hat
                            infrastructure, Site Reliability Engineering (SRE) and private OpenShift
                            clusters.
                          </p>
                        }
                        helperText={constants.privateServiceConnectHint}
                      />
                    </div>
                  )}
                  {showConfigureProxy && (
                    <div className="pf-v6-u-mt-md">
                      <CheckboxField
                        name={FieldId.ConfigureProxy}
                        label="Configure a cluster-wide proxy"
                        input={{
                          onChange: onClusterProxyChange,
                        }}
                        helperText={constants.clusterProxyHint}
                      />
                    </div>
                  )}
                </div>
              </FormGroup>
            </GridItem>
          </>
        )}

        {showIngressSection && (
          <>
            <GridItem>
              <Title headingLevel="h4" size="xl">
                Application ingress settings
              </Title>
              <Content component="p" className="pf-v6-u-mt-sm">
                Ingress is configured by default.{' '}
                {isManagedIngressAllowed
                  ? 'Customize settings if needed.'
                  : 'It can be customized for 4.14 clusters or newer.'}
                {isOcp413 && (
                  <>
                    {' '}
                    For 4.13 clusters, refer to{' '}
                    <ExternalLink href={links.MANAGED_INGRESS_KNOWLEDGE_BASE}>
                      this knowledge base article
                    </ExternalLink>
                    .
                  </>
                )}
              </Content>
            </GridItem>

            {isManagedIngressAllowed && (
              <>
                <GridItem>
                  <RadioGroupField
                    name={FieldId.ApplicationIngress}
                    options={applicationIngressOptions}
                    onChange={(_event, value) => onApplicationIngressChange(value)}
                  />
                </GridItem>
                {applicationIngress === ApplicationIngressType.Custom && <DefaultIngressFields />}
              </>
            )}
          </>
        )}
      </Grid>
    </Form>
  );
};
