import React from 'react';

import {
  Alert,
  Content,
  ContentVariants,
  Flex,
  Form,
  Grid,
  GridItem,
  List,
  ListItem,
  Title,
} from '@patternfly/react-core';

import { constructSelectedSubnets } from '~/common/helpers';
import links from '~/common/installLinks.mjs';
import validators, { required } from '~/common/validators';
import { constants } from '~/components/clusters/common/CreateOSDFormConstants';
import {
  HOST_PREFIX_DEFAULT,
  MACHINE_CIDR_DEFAULT,
  POD_CIDR_DEFAULT,
  SERVICE_CIDR_DEFAULT,
} from '~/components/clusters/common/networkingConstants';
import { CloudProviderType } from '~/components/clusters/wizards/common/constants';
import { CheckboxField, TextInputField } from '~/components/clusters/wizards/form';
import { useFormState } from '~/components/clusters/wizards/hooks';
import { FieldId } from '~/components/clusters/wizards/osd/constants';
import ExternalLink from '~/components/common/ExternalLink';

import {
  formatHostPrefix,
  validateMachineCidr,
  validatePodrCidr,
  validateServiceCidr,
} from './utils';

export const CidrRanges = () => {
  const {
    values: {
      [FieldId.CloudProvider]: cloudProvider,
      [FieldId.InstallToVpc]: installToVpc,
      [FieldId.MultiAz]: multiAz,
      [FieldId.CidrDefaultValuesEnabled]: isDefaultValuesChecked,
      [FieldId.NetworkPodCidr]: networkPodCidr,
    },
    values,
    setFieldValue,
    setFieldTouched,
  } = useFormState();
  const isMultiAz = multiAz === 'true';

  React.useEffect(() => {
    if (networkPodCidr === undefined) {
      setFieldValue(FieldId.NetworkPodCidr, POD_CIDR_DEFAULT);
    }
  }, [networkPodCidr, setFieldValue]);

  const awsMachineCIDRMax = isMultiAz
    ? validators.AWS_MACHINE_CIDR_MAX_MULTI_AZ
    : validators.AWS_MACHINE_CIDR_MAX_SINGLE_AZ;

  const privateRangesHint =
    cloudProvider === CloudProviderType.Gcp ? (
      <>
        <br />
        <span>
          The address must be a private IPv4 address, belonging to one of the following ranges:
          <List>
            <ListItem>10.0.0.0 – 10.255.255.255</ListItem>
            <ListItem>172.16.0.0 – 172.31.255.255</ListItem>
            <ListItem>192.168.0.0 – 192.168.255.255</ListItem>
          </List>
        </span>
      </>
    ) : null;

  const onDefaultValuesToggle = (_event: React.FormEvent<HTMLInputElement>, checked: boolean) => {
    setFieldValue(FieldId.CidrDefaultValuesEnabled, checked);

    if (checked) {
      setFieldValue(FieldId.NetworkMachineCidr, MACHINE_CIDR_DEFAULT);
      setFieldValue(FieldId.NetworkServiceCidr, SERVICE_CIDR_DEFAULT);
      setFieldValue(FieldId.NetworkPodCidr, POD_CIDR_DEFAULT);
      setFieldValue(FieldId.NetworkHostPrefix, HOST_PREFIX_DEFAULT);

      // Untouch all fields after setting defaults to reset validation
      setFieldTouched(FieldId.NetworkMachineCidr, false);
      setFieldTouched(FieldId.NetworkServiceCidr, false);
      setFieldTouched(FieldId.NetworkPodCidr, false);
      setFieldTouched(FieldId.NetworkHostPrefix, false);
    }
  };

  const selectedSubnets = constructSelectedSubnets(values);

  return (
    <Form>
      <Grid hasGutter>
        <GridItem>
          <Title headingLevel="h3">CIDR ranges</Title>

          <Alert
            id="advanced-networking-alert"
            isInline
            variant="info"
            className="pf-v6-u-mt-sm"
            title="CIDR ranges cannot be changed after you create your cluster."
          >
            <p className="pf-v6-u-mb-md">
              Specify non-overlapping ranges for machine, service, and pod ranges. Each range should
              correspond to the first IP address in their subnet.
            </p>

            <ExternalLink href={links.CIDR_RANGE_DEFINITIONS_OSD}>
              Learn more to avoid conflicts
            </ExternalLink>
          </Alert>
        </GridItem>
      </Grid>

      <Grid hasGutter md={6}>
        <Flex direction={{ default: 'column' }} spaceItems={{ default: 'spaceItemsLg' }}>
          <GridItem>
            <CheckboxField
              name={FieldId.CidrDefaultValuesEnabled}
              label="Use default values"
              input={{
                onChange: onDefaultValuesToggle,
                description:
                  'The below values are safe defaults. However, you must ensure that the Machine CIDR is valid for your chosen subnet(s).',
              }}
            />
          </GridItem>

          <GridItem>
            <TextInputField
              name={FieldId.NetworkMachineCidr}
              label="Machine CIDR"
              validate={(value: string) => validateMachineCidr(value)(values, selectedSubnets)}
              isDisabled={isDefaultValuesChecked}
              helperText={
                <div className="pf-v6-c-form__helper-text">
                  {cloudProvider === CloudProviderType.Aws
                    ? `Subnet mask must be between /${validators.AWS_MACHINE_CIDR_MIN} and /${awsMachineCIDRMax}.`
                    : `Range must be private. Subnet mask must be at most /${validators.GCP_MACHINE_CIDR_MAX}.`}
                  {installToVpc && (
                    <Alert
                      variant="info"
                      isPlain
                      isInline
                      title="Ensure the Machine CIDR range matches the selected VPC subnets."
                    />
                  )}
                </div>
              }
              tooltip={
                <>
                  {constants.machineCIDRHint}
                  {privateRangesHint}

                  <Content component={ContentVariants.p}>
                    <ExternalLink href={links.OSD_CIDR_MACHINE}>Learn more</ExternalLink>
                  </Content>
                </>
              }
              input={{ placeholder: MACHINE_CIDR_DEFAULT }}
            />
          </GridItem>

          <GridItem>
            <TextInputField
              name={FieldId.NetworkServiceCidr}
              label="Service CIDR"
              validate={(value) => validateServiceCidr(value)(values, selectedSubnets)}
              isDisabled={isDefaultValuesChecked}
              helperText={
                cloudProvider === CloudProviderType.Aws
                  ? `Subnet mask must be at most /${validators.SERVICE_CIDR_MAX}.`
                  : `Range must be private. Subnet mask must be at most /${validators.SERVICE_CIDR_MAX}.`
              }
              tooltip={
                <>
                  {constants.serviceCIDRHint}
                  {privateRangesHint}

                  <Content component={ContentVariants.p}>
                    <ExternalLink href={links.OSD_CIDR_SERVICE}>Learn more</ExternalLink>
                  </Content>
                </>
              }
              input={{ placeholder: SERVICE_CIDR_DEFAULT }}
            />
          </GridItem>

          <GridItem>
            <TextInputField
              name={FieldId.NetworkPodCidr}
              label="Pod CIDR"
              validate={(value) => validatePodrCidr(value)(values, selectedSubnets)}
              isDisabled={isDefaultValuesChecked}
              helperText={
                cloudProvider === CloudProviderType.Aws
                  ? `Subnet mask must allow for at least ${validators.POD_NODES_MIN} nodes.`
                  : `Range must be private. Subnet mask must allow for at least ${validators.POD_NODES_MIN} nodes.`
              }
              tooltip={
                <>
                  {constants.podCIDRHint}
                  {privateRangesHint}

                  <Content component={ContentVariants.p}>
                    <ExternalLink href={links.OSD_CIDR_POD}>Learn more</ExternalLink>
                  </Content>
                </>
              }
              input={{ placeholder: POD_CIDR_DEFAULT }}
            />
          </GridItem>

          <GridItem>
            <TextInputField
              name={FieldId.NetworkHostPrefix}
              label="Host prefix"
              validate={(value) => required(value) || validators.hostPrefix(value)}
              isDisabled={isDefaultValuesChecked}
              helperText={`Must be between /${validators.HOST_PREFIX_MIN} and /${validators.HOST_PREFIX_MAX}.`}
              tooltip={constants.hostPrefixHint}
              input={{
                placeholder: HOST_PREFIX_DEFAULT,
                onChange: (_event, value) =>
                  setFieldValue(FieldId.NetworkHostPrefix, formatHostPrefix(value)),
              }}
            />
          </GridItem>
        </Flex>
      </Grid>
    </Form>
  );
};
