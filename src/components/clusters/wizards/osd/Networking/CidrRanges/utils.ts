import { FormikValues } from 'formik';

import { Subnet } from '~/common/helpers';
import validators, { required } from '~/common/validators';
import { CloudProviderType } from '~/components/clusters/wizards/common/constants';
import { FieldId } from '~/components/clusters/wizards/osd/constants';

const machineDisjointSubnets = validators.disjointSubnets(FieldId.NetworkMachineCidr);
const serviceDisjointSubnets = validators.disjointSubnets(FieldId.NetworkServiceCidr);
const podDisjointSubnets = validators.disjointSubnets(FieldId.NetworkPodCidr);
const awsMachineSingleAZSubnetMask = validators.awsSubnetMask(FieldId.NetworkMachineCidrSingleAz);
const awsMachineMultiAZSubnetMask = validators.awsSubnetMask(FieldId.NetworkMachineCidrMultiAz);
const awsServiceSubnetMask = validators.awsSubnetMask(FieldId.NetworkServiceCidr);

export const validateCidr =
  (value: string, isMachineCidr?: boolean) => (cloudProvider: CloudProviderType) =>
    required(value) ||
    validators.cidr(value) ||
    validators.validateRange(value) ||
    (cloudProvider === CloudProviderType.Gcp && validators.privateAddress(value, isMachineCidr)) ||
    undefined;

export const validateMachineCidr =
  (value: string) => (values: FormikValues, selectedSubnets?: Subnet[]) => {
    const { [FieldId.CloudProvider]: cloudProvider, [FieldId.MultiAz]: multiAz } = values;
    const isMultiAz = multiAz === 'true';

    return (
      validateCidr(value, true)(cloudProvider) ||
      (cloudProvider === CloudProviderType.Aws && validators.awsMachineCidr(value, values)) ||
      (cloudProvider === CloudProviderType.Gcp && validators.gcpMachineCidr(value, values)) ||
      validators.validateRange(value) ||
      (cloudProvider === CloudProviderType.Aws &&
        validators.subnetCidrs(value, values, FieldId.NetworkMachineCidr, selectedSubnets)) ||
      machineDisjointSubnets(value, values) ||
      (cloudProvider === CloudProviderType.Aws &&
        !isMultiAz &&
        awsMachineSingleAZSubnetMask(value)) ||
      (cloudProvider === CloudProviderType.Aws &&
        isMultiAz &&
        awsMachineMultiAZSubnetMask(value)) ||
      undefined
    );
  };

export const validateServiceCidr =
  (value: string) => (values: FormikValues, selectedSubnets?: Subnet[]) => {
    const { [FieldId.CloudProvider]: cloudProvider } = values;

    return (
      validateCidr(value)(cloudProvider) ||
      validators.serviceCidr(value) ||
      serviceDisjointSubnets(value, values) ||
      (cloudProvider === CloudProviderType.Aws && awsServiceSubnetMask(value)) ||
      (cloudProvider === CloudProviderType.Aws &&
        validators.subnetCidrs(value, values, FieldId.NetworkServiceCidr, selectedSubnets)) ||
      undefined
    );
  };

export const validatePodrCidr =
  (value: string) => (values: FormikValues, selectedSubnets?: Subnet[]) => {
    const { [FieldId.CloudProvider]: cloudProvider } = values;

    return (
      validateCidr(value)(values[FieldId.CloudProvider]) ||
      validators.podCidr(value, values) ||
      podDisjointSubnets(value, values) ||
      (cloudProvider === CloudProviderType.Aws &&
        validators.subnetCidrs(value, values, FieldId.NetworkPodCidr, selectedSubnets)) ||
      undefined
    );
  };

export const formatHostPrefix = (value: string) => {
  if (value && value.charAt(0) !== '/') {
    return `/${value}`;
  }

  return value;
};
