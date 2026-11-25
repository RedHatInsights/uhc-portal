import React from 'react';
import { Field } from 'formik';

import { GridItem, Title } from '@patternfly/react-core';

import validators, { required } from '~/common/validators';
import {
  JOIN_SUBNET_DEFAULT,
  MASQUERADE_SUBNET_DEFAULT,
  TRANSIT_SUBNET_DEFAULT,
} from '~/components/clusters/common/networkingConstants';
import { useFormState } from '~/components/clusters/wizards/hooks';
import { FieldId } from '~/components/clusters/wizards/rosa/constants';
import { ReduxCheckbox } from '~/components/common/ReduxFormComponents_deprecated';
import ReduxVerticalFormGroup from '~/components/common/ReduxFormComponents_deprecated/ReduxVerticalFormGroup';

const joinDisjointSubnets = validators.disjointSubnets(
  FieldId.NetworkInternalJoinSubnet,
  validators.OVN_NETWORKING_OVERLAP_FIELDS,
);
const transitDisjointSubnets = validators.disjointSubnets(
  FieldId.NetworkInternalTransitSwitchSubnet,
  validators.OVN_NETWORKING_OVERLAP_FIELDS,
);
const masqueradeDisjointSubnets = validators.disjointSubnets(
  FieldId.NetworkInternalMasqueradeSubnet,
  validators.OVN_NETWORKING_OVERLAP_FIELDS,
);

const joinNotEqualTransit = validators.ovnJoinTransitNotEqual(
  FieldId.NetworkInternalTransitSwitchSubnet,
  'Transit subnet',
);
const transitNotEqualJoin = validators.ovnJoinTransitNotEqual(
  FieldId.NetworkInternalJoinSubnet,
  'Join subnet',
);

const ovnCidrValidators = (value: string) =>
  required(value) || validators.cidr(value) || validators.validateRange(value) || undefined;

type OvnSubnetFieldsProps = {
  isDisabled?: boolean;
};

export const OvnSubnetFields = ({ isDisabled = false }: OvnSubnetFieldsProps) => {
  const {
    values: { [FieldId.OvnDefaultValuesToggle]: isOvnDefaultValuesChecked },
    values,
    getFieldProps,
    getFieldMeta,
    setFieldValue,
    setFieldTouched,
    validateForm,
  } = useFormState();

  const isFieldDisabled = isOvnDefaultValuesChecked || isDisabled;

  const onOvnDefaultValuesToggle = (_event: unknown, isChecked: boolean) => {
    setFieldValue(FieldId.OvnDefaultValuesToggle, isChecked);
    if (isChecked) {
      Promise.all([
        setFieldValue(FieldId.NetworkInternalJoinSubnet, JOIN_SUBNET_DEFAULT),
        setFieldValue(FieldId.NetworkInternalTransitSwitchSubnet, TRANSIT_SUBNET_DEFAULT),
        setFieldValue(FieldId.NetworkInternalMasqueradeSubnet, MASQUERADE_SUBNET_DEFAULT),
      ]).then(() => {
        setFieldTouched(FieldId.NetworkInternalJoinSubnet, false);
        setFieldTouched(FieldId.NetworkInternalTransitSwitchSubnet, false);
        setFieldTouched(FieldId.NetworkInternalMasqueradeSubnet, false);
        validateForm();
      });
    }
  };

  const joinValidators = (value: string) =>
    ovnCidrValidators(value) ||
    validators.ovnJoinTransitSubnetMask(value) ||
    joinNotEqualTransit(value, values) ||
    joinDisjointSubnets(value, values) ||
    undefined;

  const transitValidators = (value: string) =>
    ovnCidrValidators(value) ||
    validators.ovnJoinTransitSubnetMask(value) ||
    transitNotEqualJoin(value, values) ||
    transitDisjointSubnets(value, values) ||
    undefined;

  const masqueradeValidators = (value: string) =>
    ovnCidrValidators(value) ||
    validators.ovnMasqueradeSubnetMask(value) ||
    masqueradeDisjointSubnets(value, values) ||
    undefined;

  return (
    <>
      <GridItem>
        <Title headingLevel="h4">OVN SUBNETS</Title>
      </GridItem>
      <GridItem>
        <Field
          component={ReduxCheckbox}
          name={FieldId.OvnDefaultValuesToggle}
          label="Use default values"
          description="Safe defaults for Join, Transit, and Masquerade subnets. Uncheck to customize and avoid overlaps with your VPC or other CIDRs."
          input={{
            ...getFieldProps(FieldId.OvnDefaultValuesToggle),
            onChange: (event: unknown, value: boolean) => onOvnDefaultValuesToggle(event, value),
          }}
          meta={getFieldMeta(FieldId.OvnDefaultValuesToggle)}
        />
      </GridItem>
      <GridItem md={6}>
        <Field
          component={ReduxVerticalFormGroup}
          name={FieldId.NetworkInternalJoinSubnet}
          label="Join subnet"
          placeholder={JOIN_SUBNET_DEFAULT}
          type="text"
          validate={joinValidators}
          disabled={isFieldDisabled}
          input={getFieldProps(FieldId.NetworkInternalJoinSubnet)}
          meta={getFieldMeta(FieldId.NetworkInternalJoinSubnet)}
          helpText={`Subnet mask must be at most /${validators.OVN_JOIN_TRANSIT_PREFIX_MAX}.`}
          showHelpTextOnError={false}
        />
      </GridItem>
      <GridItem md={6} />
      <GridItem md={6}>
        <Field
          component={ReduxVerticalFormGroup}
          name={FieldId.NetworkInternalTransitSwitchSubnet}
          label="Transit subnet"
          placeholder={TRANSIT_SUBNET_DEFAULT}
          type="text"
          validate={transitValidators}
          disabled={isFieldDisabled}
          input={getFieldProps(FieldId.NetworkInternalTransitSwitchSubnet)}
          meta={getFieldMeta(FieldId.NetworkInternalTransitSwitchSubnet)}
          helpText={`Subnet mask must be at most /${validators.OVN_JOIN_TRANSIT_PREFIX_MAX}.`}
          showHelpTextOnError={false}
        />
      </GridItem>
      <GridItem md={6} />
      <GridItem md={6}>
        <Field
          component={ReduxVerticalFormGroup}
          name={FieldId.NetworkInternalMasqueradeSubnet}
          label="Masquerade subnet"
          placeholder={MASQUERADE_SUBNET_DEFAULT}
          type="text"
          validate={masqueradeValidators}
          disabled={isFieldDisabled}
          input={getFieldProps(FieldId.NetworkInternalMasqueradeSubnet)}
          meta={getFieldMeta(FieldId.NetworkInternalMasqueradeSubnet)}
          helpText={`Subnet mask must be at most /${validators.OVN_MASQUERADE_PREFIX_MAX}.`}
          showHelpTextOnError={false}
        />
      </GridItem>
    </>
  );
};
