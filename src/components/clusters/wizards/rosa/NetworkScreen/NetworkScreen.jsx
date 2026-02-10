import React from 'react';
import { Field } from 'formik';
import PropTypes from 'prop-types';

import {
  Alert,
  Content,
  Form,
  FormFieldGroup,
  FormGroup,
  Grid,
  GridItem,
  Title,
  Tooltip,
} from '@patternfly/react-core';

import { ocmResourceType, trackEvents } from '~/common/analytics';
import { getDefaultSecurityGroupsSettings } from '~/common/securityGroupsHelpers';
import { validateRequiredPublicSubnetId } from '~/common/validators';
import { isExactMajorMinor } from '~/common/versionHelpers';
import { getSelectedAvailabilityZones } from '~/common/vpcHelpers';
import { constants } from '~/components/clusters/common/CreateOSDFormConstants';
import { SubnetSelectField } from '~/components/clusters/common/SubnetSelectField';
import { canConfigureDayOneManagedIngress } from '~/components/clusters/wizards/common/constants';
import { useFormState } from '~/components/clusters/wizards/hooks';
import { FieldId } from '~/components/clusters/wizards/rosa/constants';
import { DefaultIngressFieldsFormik } from '~/components/clusters/wizards/rosa/NetworkScreen/DefaultIngressFieldsFormik';
import { CheckboxDescription } from '~/components/common/CheckboxDescription';
import ExternalLink from '~/components/common/ExternalLink';
import { RadioButtons, ReduxCheckbox } from '~/components/common/ReduxFormComponents_deprecated';
import useAnalytics from '~/hooks/useAnalytics';
import { isRestrictedEnv } from '~/restrictedEnv';

import links from '../../../../../common/installLinks.mjs';

function NetworkScreen(props) {
  const {
    showClusterPrivacy,
    showVPCCheckbox,
    showClusterWideProxyCheckbox,
    privateLinkSelected,
    forcePrivateLink,
  } = props;

  const {
    setFieldValue, // Set value of form field directly
    getFieldProps, // Access: name, value, onBlur, onChange for a <Field>, useful for mapping to a field
    getFieldMeta, // Access: error, touched for a <Field>, useful for mapping to a field
    values: {
      [FieldId.CloudProvider]: cloudProviderID,
      [FieldId.ConfigureProxy]: configureProxySelected,
      [FieldId.ClusterPrivacy]: clusterPrivacy,
      [FieldId.ClusterVersion]: clusterVersionValue,
      [FieldId.Hypershift]: hypershiftValue,
      [FieldId.ApplicationIngress]: applicationIngress,
      [FieldId.MachinePoolsSubnets]: machinePoolsSubnets,
      [FieldId.SecurityGroups]: securityGroups,
      [FieldId.ClusterPrivacyPublicSubnetId]: publicSubnetId,
      [FieldId.InstallToVpc]: installToVPC,
      [FieldId.SharedVpc]: sharedVPC,
      [FieldId.SelectedVpc]: selectedVPC,
    },
  } = useFormState();
  const privateClusterSelected = clusterPrivacy === 'internal';
  const isHypershiftSelected = hypershiftValue === 'true';
  const clusterVersionRawId = clusterVersionValue?.raw_id;
  const publicSubnetIdRef = React.useRef();

  const isManagedIngressAllowed = canConfigureDayOneManagedIngress(clusterVersionRawId);
  const isOcp413 = isExactMajorMinor(clusterVersionRawId, 4, 13);

  const track = useAnalytics();

  const trackCheckedState = (trackEvent, checked) =>
    track(trackEvent, {
      resourceType: ocmResourceType.MOA,
      customProperties: {
        checked,
      },
    });

  const shouldUncheckInstallToVPC = () => {
    const hasEmptyByoVpcInfo = machinePoolsSubnets.every(
      (mpSubnet) =>
        !mpSubnet.privateSubnetId && !mpSubnet.publicSubnetId && !mpSubnet.availabilityZone,
    );

    if (hasEmptyByoVpcInfo) {
      setFieldValue(FieldId.InstallToVpc, false);

      // Also unset "Configure a cluster-wide proxy" if enabled
      if (configureProxySelected) {
        setFieldValue(FieldId.ConfigureProxy, false);
      }

      // Clear also associated security groups when the wizard has this option
      if (securityGroups) {
        setFieldValue(FieldId.SecurityGroups, getDefaultSecurityGroupsSettings());
      }
    }
  };

  const onClusterPrivacyChange = (_, value) => {
    setFieldValue(FieldId.ClusterPrivacy, value);
    if (value === 'external') {
      setFieldValue(FieldId.UsePrivateLink, false);

      if (!isHypershiftSelected) {
        shouldUncheckInstallToVPC();
      }

      // When toggling from Private to Public, if a previous public subnet ID was selected,
      // use that previous value to rehydrate the dropdown.
      if (publicSubnetIdRef.current && clusterPrivacy === 'internal') {
        setFieldValue(FieldId.ClusterPrivacyPublicSubnetId, publicSubnetIdRef.current);
      }
    } else {
      publicSubnetIdRef.current = publicSubnetId;
      setFieldValue(FieldId.ClusterPrivacyPublicSubnetId, '');
    }
  };

  const onPrivateLinkChange = (_event, checked) => {
    setFieldValue(FieldId.UsePrivateLink, checked);
    if (checked) {
      setFieldValue(FieldId.InstallToVpc, true);
    }
  };

  if (forcePrivateLink && privateClusterSelected && !privateLinkSelected) {
    setFieldValue(FieldId.InstallToVpc, true);
    setFieldValue(FieldId.UsePrivateLink, true);
  }

  const onClusterProxyChange = (_event, checked) => {
    trackCheckedState(trackEvents.ConfigureClusterWideProxy, checked);
    setFieldValue(FieldId.ConfigureProxy, checked);
    if (checked && !installToVPC) {
      setFieldValue(FieldId.InstallToVpc, true);
      trackCheckedState(trackEvents.InstallIntoVPC, checked);
    }
  };

  const onInstallIntoVPCchange = (_event, checked) => {
    setFieldValue(FieldId.InstallToVpc, checked);
    if (!checked) {
      if (sharedVPC.is_selected) {
        setFieldValue(FieldId.SharedVpc, {
          is_allowed: sharedVPC.is_allowed,
          is_selected: false,
          base_dns_domain: '',
          hosted_zone_id: '',
          hosted_zone_role_arn: '',
        });
      }
      if (securityGroups) {
        setFieldValue(FieldId.SecurityGroups, getDefaultSecurityGroupsSettings());
      }
    }
    trackCheckedState(trackEvents.InstallIntoVPC, checked);
  };

  const privateLinkAndClusterSelected = privateLinkSelected && privateClusterSelected;
  const installToVPCCheckbox = (
    <Field
      component={ReduxCheckbox}
      name={FieldId.InstallToVpc}
      label="Install into an existing VPC"
      isDisabled={privateLinkAndClusterSelected || configureProxySelected}
      input={{
        ...getFieldProps(FieldId.InstallToVpc),
        onChange: (event, value) => onInstallIntoVPCchange(event, value),
      }}
      meta={getFieldMeta(FieldId.InstallToVpc)}
    />
  );
  const configureClusterProxyField = (
    <Field
      component={ReduxCheckbox}
      name={FieldId.ConfigureProxy}
      label="Configure a cluster-wide proxy"
      helpText={<CheckboxDescription>{constants.clusterProxyHint}</CheckboxDescription>}
      input={{
        ...getFieldProps(FieldId.ConfigureProxy),
        onChange: (event, value) => onClusterProxyChange(event, value),
      }}
      meta={getFieldMeta(FieldId.ConfigureProxy)}
    />
  );
  const optionsAvailableInRestrictedEnv = [
    {
      value: 'internal',
      label: 'Private',
      description:
        'Access Kubernetes API endpoint and application routes from direct private connections only.',
    },
  ];
  const optionsAvailableInCommercialEnv = [
    {
      value: 'external',
      label: 'Public',
      description: 'Access Kubernetes API endpoint and application routes from the internet.',
      extraField: isHypershiftSelected && !privateClusterSelected && (
        <Field
          component={SubnetSelectField}
          name={FieldId.ClusterPrivacyPublicSubnetId}
          input={{
            ...getFieldProps(FieldId.ClusterPrivacyPublicSubnetId),
            onChange: (value) => setFieldValue(FieldId.ClusterPrivacyPublicSubnetId, value),
          }}
          meta={getFieldMeta(FieldId.ClusterPrivacyPublicSubnetId)}
          label="Public subnet name"
          className="pf-v6-u-mt-md pf-v6-u-ml-lg"
          isRequired
          validate={(value) => validateRequiredPublicSubnetId(value, {})}
          withAutoSelect={false}
          selectedVPC={selectedVPC}
          privacy="public"
          allowedAZs={getSelectedAvailabilityZones(selectedVPC, machinePoolsSubnets)}
        />
      ),
    },
    ...optionsAvailableInRestrictedEnv,
  ];

  return (
    <Form
      onSubmit={(event) => {
        event.preventDefault();
        return false;
      }}
    >
      <Grid hasGutter>
        <GridItem>
          <Title headingLevel="h3">Networking configuration</Title>
        </GridItem>
        <GridItem>
          <Content component="p">Configure network access for your cluster.</Content>
        </GridItem>

        {showClusterPrivacy && (
          <>
            <GridItem>
              <Title headingLevel="h4" size="xl" className="privacy-heading">
                Cluster privacy
              </Title>
            </GridItem>
            <GridItem>
              <Content component="p">
                Install your cluster with all public or private API endpoints and application
                routes.{' '}
                {isHypershiftSelected && 'You can customize these options after installation.'}
              </Content>
            </GridItem>
            <Field
              component={RadioButtons}
              isDisabled={isRestrictedEnv()}
              name={FieldId.ClusterPrivacy}
              ariaLabel="Cluster privacy"
              input={{
                ...getFieldProps(FieldId.ClusterPrivacy),
                onChange: (value) => onClusterPrivacyChange(undefined, value),
              }}
              options={
                isRestrictedEnv() && isHypershiftSelected
                  ? optionsAvailableInRestrictedEnv
                  : optionsAvailableInCommercialEnv
              }
              disableDefaultValueHandling
            />

            {privateClusterSelected && (
              <GridItem>
                <Alert
                  variant="warning"
                  isInline
                  title="You will not be able to access your cluster until you edit network settings in your cloud provider."
                >
                  {cloudProviderID === 'aws' && (
                    <ExternalLink href={links.ROSA_PRIVATE_CONNECTIONS}>
                      Learn more about configuring network settings
                    </ExternalLink>
                  )}
                </Alert>
              </GridItem>
            )}
          </>
        )}

        {isHypershiftSelected && <GridItem>{configureClusterProxyField}</GridItem>}

        {showVPCCheckbox && !isHypershiftSelected && (
          <>
            <GridItem>
              <Title headingLevel="h4" size="xl" className="privacy-heading">
                Virtual Private Cloud (VPC)
              </Title>
            </GridItem>
            {!privateClusterSelected && (
              <GridItem>
                <Content component="p">
                  By default, a new VPC will be created for your cluster. Alternatively, you may opt
                  to install to an existing VPC below.
                </Content>
              </GridItem>
            )}
            <GridItem>
              <FormGroup fieldId="install-to-vpc">
                {privateClusterSelected ? (
                  <Tooltip
                    position="top-start"
                    enableFlip
                    content={
                      <p>
                        Private clusters must be installed into an existing VPC and have PrivateLink
                        enabled.
                      </p>
                    }
                  >
                    {installToVPCCheckbox}
                  </Tooltip>
                ) : (
                  installToVPCCheckbox
                )}
                <FormFieldGroup>
                  {privateClusterSelected && cloudProviderID === 'aws' && (
                    <FormGroup>
                      <Field
                        component={ReduxCheckbox}
                        name={FieldId.UsePrivateLink}
                        label="Use a PrivateLink"
                        onChange={onPrivateLinkChange}
                        isDisabled={forcePrivateLink && privateClusterSelected}
                        helpText={
                          <CheckboxDescription>{constants.privateLinkHint}</CheckboxDescription>
                        }
                        input={{
                          ...getFieldProps(FieldId.UsePrivateLink),
                          onChange: (event, value) => onPrivateLinkChange(event, value),
                        }}
                        meta={getFieldMeta(FieldId.UsePrivateLink)}
                      />
                    </FormGroup>
                  )}
                  {showClusterWideProxyCheckbox && (
                    <FormGroup>{configureClusterProxyField}</FormGroup>
                  )}
                </FormFieldGroup>
              </FormGroup>
            </GridItem>
          </>
        )}

        {!isHypershiftSelected && (
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
              <Field
                component={RadioButtons}
                name={FieldId.ApplicationIngress}
                ariaLabel="Use application ingress defaults"
                isDisabled={!isManagedIngressAllowed}
                disableDefaultValueHandling
                input={{
                  ...getFieldProps(FieldId.ApplicationIngress),
                  onChange: (value) => setFieldValue(FieldId.ApplicationIngress, value),
                }}
                meta={getFieldMeta(FieldId.ApplicationIngress)}
                options={[
                  {
                    value: 'default',
                    ariaLabel: 'Default settings',
                    label: 'Default settings',
                    // Do not show the form when "default" is requested
                  },
                  {
                    value: 'custom',
                    ariaLabel: 'Custom settings',
                    label: 'Custom settings',
                    extraField: applicationIngress !== 'default' && (
                      <DefaultIngressFieldsFormik
                        hasSufficientIngressEditVersion
                        className="pf-v6-u-mt-md pf-v6-u-ml-lg"
                        isDay2={false}
                        canShowLoadBalancer={false}
                      />
                    ),
                  },
                ]}
              />
            )}
          </>
        )}
      </Grid>
    </Form>
  );
}

NetworkScreen.propTypes = {
  showClusterPrivacy: PropTypes.bool,
  showVPCCheckbox: PropTypes.bool,
  showClusterWideProxyCheckbox: PropTypes.bool,
  privateLinkSelected: PropTypes.bool,
  forcePrivateLink: PropTypes.bool,
};

export default NetworkScreen;
