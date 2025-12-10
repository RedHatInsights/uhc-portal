import React from 'react';
import { Field } from 'formik';
import PropTypes from 'prop-types';

import { Alert, Content, ContentVariants, GridItem } from '@patternfly/react-core';

import { constructSelectedSubnets } from '~/common/helpers';
import links from '~/common/installLinks.mjs';
import validators, { required } from '~/common/validators';
import { useFormState } from '~/components/clusters/wizards/hooks';
import { FieldId } from '~/components/clusters/wizards/rosa/constants';
import ExternalLink from '~/components/common/ExternalLink';
import { ReduxCheckbox } from '~/components/common/ReduxFormComponents_deprecated';

import ReduxVerticalFormGroup from '../../../../common/ReduxFormComponents_deprecated/ReduxVerticalFormGroup';
import { constants } from '../../../common/CreateOSDFormConstants';
import {
  HOST_PREFIX_DEFAULT,
  MACHINE_CIDR_DEFAULT,
  POD_CIDR_DEFAULT,
  SERVICE_CIDR_DEFAULT,
} from '../../../common/networkingConstants';

const machineDisjointSubnets = validators.disjointSubnets('network_machine_cidr');
const serviceDisjointSubnets = validators.disjointSubnets('network_service_cidr');
const podDisjointSubnets = validators.disjointSubnets('network_pod_cidr');
const awsMachineSingleAZSubnetMask = validators.awsSubnetMask('network_machine_cidr_single_az');
const awsMachineMultiAZSubnetMask = validators.awsSubnetMask('network_machine_cidr_multi_az');
const awsServiceSubnetMask = validators.awsSubnetMask('network_service_cidr');

function CIDRFields({
  disabled,
  cloudProviderID,
  isMultiAz,
  installToVpcSelected,
  isDefaultValuesChecked,
  formValues,
}) {
  const { getFieldProps, getFieldMeta, setFieldValue, validateForm } = useFormState();

  const isFieldDisabled = isDefaultValuesChecked || disabled;
  const isHypershift = formValues.hypershift === 'true';

  const formatHostPrefix = (value) => {
    if (value && value.charAt(0) !== '/') {
      return `/${value}`;
    }
    return value;
  };

  const selectedSubnets = constructSelectedSubnets(formValues);

  const cidrValidators = (value) =>
    required(value) || validators.cidr(value) || validators.validateRange(value) || undefined;

  const machineCidrValidators = (value) =>
    cidrValidators(value) ||
    (cloudProviderID === 'aws' && validators.awsMachineCidr(value, formValues)) ||
    validators.validateRange(value) ||
    (cloudProviderID === 'aws' &&
      validators.subnetCidrs(value, formValues, FieldId.NetworkMachineCidr, selectedSubnets)) ||
    machineDisjointSubnets(value, formValues) ||
    (cloudProviderID === 'aws' && !isMultiAz && awsMachineSingleAZSubnetMask(value)) ||
    (cloudProviderID === 'aws' && isMultiAz && awsMachineMultiAZSubnetMask(value)) ||
    undefined;

  const serviceCidrValidators = (value) =>
    cidrValidators(value) ||
    validators.serviceCidr(value) ||
    serviceDisjointSubnets(value, formValues) ||
    (cloudProviderID === 'aws' && awsServiceSubnetMask(value)) ||
    (cloudProviderID === 'aws' &&
      validators.subnetCidrs(value, formValues, FieldId.NetworkServiceCidr, selectedSubnets)) ||
    undefined;

  const podCidrValidators = (value) =>
    cidrValidators(value) ||
    validators.podCidr(value, formValues) ||
    podDisjointSubnets(value, formValues) ||
    (cloudProviderID === 'aws' &&
      validators.subnetCidrs(value, formValues, FieldId.NetworkPodCidr, selectedSubnets)) ||
    undefined;

  const awsMachineCIDRMax =
    isMultiAz || isHypershift
      ? validators.AWS_MACHINE_CIDR_MAX_MULTI_AZ
      : validators.AWS_MACHINE_CIDR_MAX_SINGLE_AZ;

  const hostValidators = (value) => required(value) || validators.hostPrefix(value);

  const onDefaultValuesToggle = (_event, isChecked) => {
    setFieldValue(FieldId.CidrDefaultValuesToggle, isChecked);
    if (isChecked) {
      Promise.all([
        setFieldValue(FieldId.NetworkMachineCidr, MACHINE_CIDR_DEFAULT),
        setFieldValue(FieldId.NetworkServiceCidr, SERVICE_CIDR_DEFAULT),
        setFieldValue(FieldId.NetworkPodCidr, POD_CIDR_DEFAULT),
        setFieldValue(FieldId.NetworkHostPrefix, HOST_PREFIX_DEFAULT),
      ]).then(() => {
        validateForm();
      });
    }
  };

  return (
    <>
      <GridItem>
        <Alert
          id="advanced-networking-alert"
          isInline
          variant="info"
          title="CIDR ranges cannot be changed after you create your cluster."
        >
          <p className="pf-v6-u-mb-md">
            Specify non-overlapping ranges for machine, service, and pod ranges. Each range should
            correspond to the first IP address in their subnet.
          </p>

          <ExternalLink
            href={
              isHypershift
                ? links.CIDR_RANGE_DEFINITIONS_ROSA
                : links.CIDR_RANGE_DEFINITIONS_ROSA_CLASSIC
            }
          >
            Learn more to avoid conflicts
          </ExternalLink>
        </Alert>
      </GridItem>
      <GridItem>
        <Field
          component={ReduxCheckbox}
          name={FieldId.CidrDefaultValuesToggle}
          label="Use default values"
          description="The below values are safe defaults. However, you must ensure that the Machine CIDR is valid for your chosen subnet(s)."
          input={{
            ...getFieldProps(FieldId.CidrDefaultValuesToggle),
            onChange: (event, value) => onDefaultValuesToggle(event, value),
          }}
          meta={getFieldMeta(FieldId.CidrDefaultValuesToggle)}
        />
      </GridItem>
      <GridItem md={6}>
        <Field
          component={ReduxVerticalFormGroup}
          name={FieldId.NetworkMachineCidr}
          label="Machine CIDR"
          placeholder={MACHINE_CIDR_DEFAULT}
          type="text"
          validate={machineCidrValidators}
          disabled={isFieldDisabled}
          input={getFieldProps(FieldId.NetworkMachineCidr)}
          meta={getFieldMeta(FieldId.NetworkMachineCidr)}
          helpText={
            <div className="pf-v6-c-form__helper-text">
              {`Subnet mask must be between /${validators.AWS_MACHINE_CIDR_MIN} and /${awsMachineCIDRMax}.`}
              {installToVpcSelected && (
                <Alert
                  variant="info"
                  isPlain
                  isInline
                  title="Ensure the Machine CIDR range matches the selected VPC subnets."
                />
              )}
            </div>
          }
          extendedHelpText={
            <>
              {constants.machineCIDRHint}

              <Content component={ContentVariants.p}>
                <ExternalLink
                  href={isHypershift ? links.ROSA_CIDR_MACHINE : links.ROSA_CLASSIC_CIDR_MACHINE}
                >
                  Learn more
                </ExternalLink>
              </Content>
            </>
          }
          showHelpTextOnError={false}
        />
      </GridItem>
      <GridItem md={6} />
      <GridItem md={6}>
        <Field
          component={ReduxVerticalFormGroup}
          name={FieldId.NetworkServiceCidr}
          label="Service CIDR"
          placeholder={SERVICE_CIDR_DEFAULT}
          type="text"
          validate={serviceCidrValidators}
          disabled={isFieldDisabled}
          input={getFieldProps(FieldId.NetworkServiceCidr)}
          meta={getFieldMeta(FieldId.NetworkServiceCidr)}
          helpText={
            cloudProviderID === 'aws'
              ? `Subnet mask must be at most /${validators.SERVICE_CIDR_MAX}.`
              : `Range must be private. Subnet mask must be at most /${validators.SERVICE_CIDR_MAX}.`
          }
          extendedHelpText={
            <>
              {constants.serviceCIDRHint}

              <Content component={ContentVariants.p}>
                <ExternalLink
                  href={isHypershift ? links.ROSA_CIDR_SERVICE : links.ROSA_CLASSIC_CIDR_SERVICE}
                >
                  Learn more
                </ExternalLink>
              </Content>
            </>
          }
          showHelpTextOnError={false}
        />
      </GridItem>
      <GridItem md={6} />
      <GridItem md={6}>
        <Field
          component={ReduxVerticalFormGroup}
          name={FieldId.NetworkPodCidr}
          label="Pod CIDR"
          placeholder={POD_CIDR_DEFAULT}
          type="text"
          validate={podCidrValidators}
          disabled={isFieldDisabled}
          input={getFieldProps(FieldId.NetworkPodCidr)}
          meta={getFieldMeta(FieldId.NetworkPodCidr)}
          helpText={
            cloudProviderID === 'aws'
              ? `Subnet mask must allow for at least ${validators.POD_NODES_MIN} nodes.`
              : `Range must be private. Subnet mask must allow for at least ${validators.POD_NODES_MIN} nodes.`
          }
          extendedHelpText={
            <>
              {constants.podCIDRHint}

              <Content component={ContentVariants.p}>
                <ExternalLink
                  href={isHypershift ? links.ROSA_CIDR_POD : links.ROSA_CLASSIC_CIDR_POD}
                >
                  Learn more
                </ExternalLink>
              </Content>
            </>
          }
          showHelpTextOnError={false}
        />
      </GridItem>
      <GridItem md={6} />
      <GridItem md={6}>
        <Field
          component={ReduxVerticalFormGroup}
          name={FieldId.NetworkHostPrefix}
          label="Host prefix"
          placeholder={HOST_PREFIX_DEFAULT}
          type="text"
          validate={hostValidators}
          disabled={isFieldDisabled}
          input={getFieldProps(FieldId.NetworkHostPrefix)}
          meta={getFieldMeta(FieldId.NetworkHostPrefix)}
          onChange={(_event, value) =>
            setFieldValue(FieldId.NetworkHostPrefix, formatHostPrefix(value))
          }
          helpText={`Must be between /${validators.HOST_PREFIX_MIN} and /${validators.HOST_PREFIX_MAX}.`}
          extendedHelpText={
            <>
              {constants.hostPrefixHint}

              <Content component={ContentVariants.p}>
                <ExternalLink
                  href={isHypershift ? links.ROSA_CIDR_HOST : links.ROSA_CLASSIC_CIDR_HOST}
                >
                  Learn more
                </ExternalLink>
              </Content>
            </>
          }
          showHelpTextOnError={false}
        />
      </GridItem>
    </>
  );
}

CIDRFields.propTypes = {
  disabled: PropTypes.bool,
  cloudProviderID: PropTypes.string,
  isMultiAz: PropTypes.bool,
  installToVpcSelected: PropTypes.bool,
  isDefaultValuesChecked: PropTypes.bool,
  formValues: PropTypes.object,
};

export default CIDRFields;
