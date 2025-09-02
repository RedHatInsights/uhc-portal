import React from 'react';

import { Alert, AlertVariant, Form, Grid, GridItem, Title } from '@patternfly/react-core';

import { getAllSubnetFieldNames } from '~/common/vpcHelpers';
import { emptyAWSSubnet } from '~/components/clusters/wizards/common/constants';
import { useFormState } from '~/components/clusters/wizards/hooks';

import { FormSubnet } from '../../common/FormSubnet';
import { FieldId } from '../constants';

import { InstallToVPC } from './InstallToVPC';

type VPCScreenProps = {
  privateLinkSelected: boolean;
};

const VPCScreen = ({ privateLinkSelected }: VPCScreenProps) => {
  const {
    setFieldValue,
    setFieldTouched,
    values: {
      [FieldId.ClusterName]: clusterName,
      [FieldId.ClusterVersion]: version,
      [FieldId.SharedVpc]: sharedVpcSettings,
      [FieldId.SelectedVpc]: selectedVPC,
      [FieldId.MachinePoolsSubnets]: machinePoolsSubnets,
      [FieldId.MultiAz]: multiAzField,
      [FieldId.Region]: selectedRegion,
      [FieldId.CloudProvider]: cloudProviderID,
      [FieldId.Hypershift]: isHypershift,
    },
  } = useFormState();
  const isSharedVpcSelected = sharedVpcSettings?.is_selected || false;
  const hostedZoneDomainName = isSharedVpcSelected
    ? `${clusterName}.${sharedVpcSettings.base_dns_domain || '<selected-base-domain>'}`
    : undefined;
  const selectedAZs = (machinePoolsSubnets as FormSubnet[])?.map(
    (subnet) => subnet.availabilityZone,
  );
  const isMultiAz = multiAzField === 'true';
  const openshiftVersion = version?.raw_id;
  const isHypershiftSelected = isHypershift === 'true';

  React.useEffect(() => {
    if (!selectedVPC.id) {
      const subnetReset = [emptyAWSSubnet()];

      if (isMultiAz) {
        subnetReset.push(emptyAWSSubnet());
        subnetReset.push(emptyAWSSubnet());
      }
      setFieldValue(FieldId.MachinePoolsSubnets, subnetReset);

      // Prevent the validation errors from showing - fields have been reset
      const untouchFields = getAllSubnetFieldNames(isMultiAz);
      // Fails sometimes if we only touch the main "machinePoolsSubnets"
      untouchFields.forEach((field) => {
        setFieldTouched(field, false);
      });
    }
  }, [setFieldValue, setFieldTouched, isMultiAz, selectedVPC]);

  return (
    <Form
      onSubmit={(event) => {
        event.preventDefault();
        return false;
      }}
    >
      <Grid hasGutter>
        <GridItem>
          <Title headingLevel="h3">Virtual Private Cloud (VPC) subnet settings</Title>
        </GridItem>

        {(() => {
          switch (true) {
            case !openshiftVersion:
              return (
                <Alert variant={AlertVariant.warning} title="No cluster version" isInline>
                  No cluster version defined. Please select a cluster version before proceeding with
                  the VPC configuration.
                </Alert>
              );
            default:
              return (
                <InstallToVPC
                  isMultiAz={isMultiAz}
                  selectedRegion={selectedRegion}
                  selectedVPC={selectedVPC}
                  selectedAZs={selectedAZs}
                  openshiftVersion={openshiftVersion}
                  isSharedVpcSelected={isSharedVpcSelected}
                  privateLinkSelected={privateLinkSelected}
                  hostedZoneDomainName={hostedZoneDomainName as string}
                  cloudProviderID={cloudProviderID}
                  isHypershiftSelected={isHypershiftSelected}
                />
              );
          }
        })()}
      </Grid>
    </Form>
  );
};

export { VPCScreen };
