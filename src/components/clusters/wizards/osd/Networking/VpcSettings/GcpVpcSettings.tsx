import React, { ReactElement, useMemo } from 'react';
import { Field } from 'formik';

import {
  Alert,
  AlertActionLink,
  Content,
  ContentVariants,
  GridItem,
  Title,
  useWizardContext,
} from '@patternfly/react-core';

import links from '~/common/installLinks.mjs';
import { required, validateGCPHostProjectId, validateGCPSubnet } from '~/common/validators';
import { versionComparator } from '~/common/versionComparator';
import { useFormState } from '~/components/clusters/wizards/hooks';
import { FieldId, StepId } from '~/components/clusters/wizards/osd/constants';
import ExternalLink from '~/components/common/ExternalLink';
import PopoverHint from '~/components/common/PopoverHint';

import { CheckboxField, TextInputField } from '../../../form';
import { ClusterPrivacyType } from '../constants';

import { GcpVpcNameSelectField } from './GcpVpcNameSelectField';
import { GcpVpcSubnetSelectField } from './GcpVpcSubnetSelectField';

export const GcpVpcSettings = () => {
  const {
    values: {
      [FieldId.ClusterVersion]: clusterVersion,
      [FieldId.InstallToSharedVpc]: installToSharedVpc,
      [FieldId.PrivateServiceConnect]: privateServiceConnect,
      [FieldId.ClusterPrivacy]: clusterPrivacy,
    },
    getFieldProps,
    getFieldMeta,
    setFieldValue,
  } = useFormState();

  const { goToStepById } = useWizardContext();

  const onInstallIntoSharedVPCchange = (
    _event: React.FormEvent<HTMLInputElement>,
    checked: boolean,
  ) => {
    setFieldValue(FieldId.InstallToSharedVpc, checked);
  };

  const hostProjectId = useMemo<ReactElement | null>(() => {
    if (installToSharedVpc) {
      const wrongVersion = versionComparator(clusterVersion?.raw_id, '4.13.15') === -1;
      return (
        <>
          {wrongVersion && (
            <div className="pf-v6-u-mt-md">
              <Alert
                variant="danger"
                isInline
                title="You must use OpenShift version 4.13.15 or above."
                actionLinks={
                  <AlertActionLink onClick={() => goToStepById(StepId.ClusterSettingsDetails)}>
                    Change version
                  </AlertActionLink>
                }
              />
            </div>
          )}
          <div className="pf-v6-u-mt-md" style={{ display: wrongVersion ? 'none' : 'block' }}>
            <TextInputField
              name={FieldId.SharedHostProjectID}
              label="Host project ID"
              validate={validateGCPHostProjectId}
            />

            <div className="pf-v6-u-mt-md">
              <Alert
                variant="info"
                isInline
                title="NOTE: To install a cluster into a shared VPC, the shared VPC administrator must enable a project as a
              host project in their Google Cloud console. Then you can attach service projects to the host project."
              />
            </div>
          </div>
        </>
      );
    }
    return null;
  }, [clusterVersion?.raw_id, goToStepById, installToSharedVpc]);

  const showPSCSubnet = privateServiceConnect && clusterPrivacy === ClusterPrivacyType.Internal;
  return (
    <>
      <GridItem span={8}>
        <Title headingLevel="h4" size="md">
          GCP shared VPC
        </Title>
        <div className="pf-v6-u-mt-md  pf-v6-u-mb-lg">
          <CheckboxField
            name={FieldId.InstallToSharedVpc}
            label="Install into GCP Shared VPC"
            tooltip={
              <>
                <p>Install into a VPC shared by another account in your GCP organization.</p>
                <ExternalLink href={links.INSTALL_GCP_SHARED_VPC}>
                  Learn more about GCP shared VPC.
                </ExternalLink>
              </>
            }
            input={{ onChange: onInstallIntoSharedVPCchange }}
          />
          {hostProjectId}
        </div>
      </GridItem>

      <GridItem>
        <Title headingLevel="h4" size="md">
          Existing VPC
          <PopoverHint
            iconClassName="pf-v6-u-ml-sm"
            hint={
              <>
                <Content component={ContentVariants.p}>
                  Install into a user-defined subnet within a custom VPC network that is provisioned
                  and fully managed within the same GCP project.
                </Content>
                <ExternalLink href={links.INSTALL_GCP_VPC}>
                  Learn more about installing into an existing VPC
                </ExternalLink>
              </>
            }
          />
        </Title>
        <div
          className="pf-v6-u-ml-sm pf-v6-u-mt-md  pf-v6-u-mb-lg"
          style={{ width: 'fit-content' }}
        >
          <p className="pf-v6-u-mt-sm">
            To install into an existing VPC, you need to ensure that your VPC is configured with a
            control plane subnet and compute subnet.
          </p>
          <p className="pf-v6-u-mt-sm">
            You&#39;ll also need to match these VPC subnets when you define the CIDR ranges.
          </p>
        </div>
      </GridItem>

      <GridItem md={showPSCSubnet ? 12 : 4}>
        {installToSharedVpc ? (
          <TextInputField
            name={FieldId.VpcName}
            label="Existing VPC name"
            validate={validateGCPSubnet}
          />
        ) : (
          <Field
            component={GcpVpcNameSelectField}
            name={FieldId.VpcName}
            validate={required}
            label="Existing VPC name"
            placeholder="Select VPC name"
            emptyPlaceholder="No existing VPCs"
            input={{
              ...getFieldProps(FieldId.VpcName),
              onChange: (value: string) => setFieldValue(FieldId.VpcName, value),
            }}
            meta={getFieldMeta(FieldId.VpcName)}
          />
        )}
      </GridItem>

      <GridItem md={showPSCSubnet ? 12 : 4}>
        {installToSharedVpc ? (
          <TextInputField
            name={FieldId.ControlPlaneSubnet}
            label="Control plane subnet name"
            validate={validateGCPSubnet}
          />
        ) : (
          <Field
            component={GcpVpcSubnetSelectField}
            name={FieldId.ControlPlaneSubnet}
            validate={required}
            label="Control plane subnet name"
            placeholder="Select subnet name"
            emptyPlaceholder="No subnet names"
            input={{
              ...getFieldProps(FieldId.ControlPlaneSubnet),
              onChange: (value: string) => setFieldValue(FieldId.ControlPlaneSubnet, value),
            }}
            meta={getFieldMeta(FieldId.ControlPlaneSubnet)}
          />
        )}
      </GridItem>

      <GridItem md={showPSCSubnet ? 12 : 4}>
        {installToSharedVpc ? (
          <TextInputField
            name={FieldId.ComputeSubnet}
            label="Compute subnet name"
            validate={validateGCPSubnet}
          />
        ) : (
          <Field
            component={GcpVpcSubnetSelectField}
            name={FieldId.ComputeSubnet}
            validate={required}
            label="Compute subnet name"
            placeholder="Select subnet name"
            emptyPlaceholder="No subnet names"
            input={{
              ...getFieldProps(FieldId.ComputeSubnet),
              onChange: (value: string) => setFieldValue(FieldId.ComputeSubnet, value),
            }}
            meta={getFieldMeta(FieldId.ComputeSubnet)}
          />
        )}
      </GridItem>
      {showPSCSubnet ? (
        <GridItem md={12}>
          {installToSharedVpc ? (
            <TextInputField
              name={FieldId.PSCSubnet}
              label="Private Service Connect subnet name"
              validate={validateGCPSubnet}
            />
          ) : (
            <Field
              component={GcpVpcSubnetSelectField}
              name={FieldId.PSCSubnet}
              validate={required}
              label="Private Service Connect subnet name"
              placeholder="Select subnet name"
              emptyPlaceholder="No subnet names"
              input={{
                ...getFieldProps(FieldId.PSCSubnet),
                onChange: (value: string) => setFieldValue(FieldId.PSCSubnet, value),
              }}
              meta={getFieldMeta(FieldId.PSCSubnet)}
            />
          )}
        </GridItem>
      ) : null}

      {installToSharedVpc && (
        <GridItem span={9}>
          <div className="pf-v6-u-mt-md  pf-v6-u-mb-lg">
            <Alert
              variant="info"
              isInline
              title={`For successful installation, be sure your Host project ID, Existing VPC name, Control plane subnet name, ${showPSCSubnet ? 'Compute subnet name, and Private Service Connect subnet name' : 'and Compute subnet name'} are correct.`}
            />
          </div>
        </GridItem>
      )}
    </>
  );
};
