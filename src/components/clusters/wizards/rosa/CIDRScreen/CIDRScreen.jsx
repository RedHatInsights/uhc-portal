import React from 'react';

import { Form, Grid, GridItem, Title } from '@patternfly/react-core';

import { canConfigureDayOneOvnSubnets } from '~/components/clusters/wizards/common/constants';
import { useFormState } from '~/components/clusters/wizards/hooks';
import { FieldId } from '~/components/clusters/wizards/rosa/constants';

import CIDRFields from './CIDRFields';

function CIDRScreen() {
  const {
    values: {
      [FieldId.CloudProvider]: cloudProviderID,
      [FieldId.MultiAz]: multiAz,
      [FieldId.InstallToVpc]: installToVPC,
      [FieldId.CidrDefaultValuesToggle]: cidrDefaultValuesToggle,
      [FieldId.Hypershift]: hypershift,
      [FieldId.ClusterVersion]: clusterVersion,
    },
    values,
  } = useFormState();

  const isHypershiftSelected = hypershift === 'true';
  const shouldShowOvnSubnets =
    isHypershiftSelected && canConfigureDayOneOvnSubnets(clusterVersion?.raw_id);

  const isMultiAz = multiAz === true;

  return (
    <Form
      onSubmit={(event) => {
        event.preventDefault();
        return false;
      }}
    >
      <Grid hasGutter>
        <GridItem>
          <Title headingLevel="h3">CIDR ranges</Title>
        </GridItem>

        <CIDRFields
          cloudProviderID={cloudProviderID}
          isMultiAz={isMultiAz}
          installToVpcSelected={installToVPC}
          isDefaultValuesChecked={cidrDefaultValuesToggle}
          isHypershiftSelected={isHypershiftSelected}
          shouldShowOvnSubnets={shouldShowOvnSubnets}
          formValues={values}
        />
      </Grid>
    </Form>
  );
}

export default CIDRScreen;
