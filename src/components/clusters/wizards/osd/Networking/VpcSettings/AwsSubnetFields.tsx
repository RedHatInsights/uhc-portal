import React from 'react';
import { Field } from 'formik';

import { Grid, GridItem } from '@patternfly/react-core';

import VPCDropdown from '~/components/clusters/wizards/common/VPCDropdown/VPCDropdown';
import { useFormState } from '~/components/clusters/wizards/hooks';
import { FieldId } from '~/components/clusters/wizards/osd/constants';
import { CloudVpc } from '~/types/clusters_mgmt.v1';

import AwsSingleSubnetField from './AwsSingleSubnetField';

const AwsSubnetFields = () => {
  const { values, dirty, getFieldProps, getFieldMeta, setFieldValue } = useFormState();
  const controlPlaneFieldName = `${FieldId.SecurityGroups}.controlPlane`;
  const infraFieldName = `${FieldId.SecurityGroups}.infra`;
  const workerFieldName = `${FieldId.SecurityGroups}.worker`;

  const {
    [FieldId.MultiAz]: multiAz,
    [FieldId.SelectedVpc]: selectedVPC,
    [FieldId.UsePrivateLink]: usePrivateLink,
  } = values;

  const isMultiAz = multiAz === 'true';
  const vpcMeta = getFieldMeta(FieldId.SelectedVpc);

  return (
    <>
      <Grid>
        <GridItem md={6}>
          <Field
            component={VPCDropdown}
            name={FieldId.SelectedVpc}
            input={{
              ...getFieldProps(FieldId.SelectedVpc),
              onChange: (newVpcValue: string) => {
                setFieldValue(FieldId.SelectedVpc, newVpcValue);
                setFieldValue(controlPlaneFieldName, []);
                setFieldValue(infraFieldName, []);
                setFieldValue(workerFieldName, []);
              },
            }}
            isOSD
            meta={vpcMeta}
            validate={(vpc: CloudVpc) => (dirty && !vpc?.id ? 'error' : undefined)}
            selectedVPC={selectedVPC}
            showRefresh
            isHypershift={false}
            usePrivateLink={usePrivateLink}
          />
        </GridItem>
        <GridItem md={6} />
      </Grid>

      <AwsSingleSubnetField index={0} />
      {isMultiAz && (
        <>
          <AwsSingleSubnetField index={1} />
          <AwsSingleSubnetField index={2} />
        </>
      )}
    </>
  );
};

export default AwsSubnetFields;
