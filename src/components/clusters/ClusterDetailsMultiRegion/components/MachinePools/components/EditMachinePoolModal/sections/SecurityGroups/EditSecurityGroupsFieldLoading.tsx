import React from 'react';

import { Grid, GridItem, Skeleton } from '@patternfly/react-core';

const EditSecurityGroupsFieldLoading = () => (
  <Grid hasGutter>
    <GridItem span={12}>
      <Skeleton height="92px" width="100%" screenreaderText="Loading alert" />
    </GridItem>
    <GridItem span={12}>
      <Skeleton height="50px" width="100%" screenreaderText="Loading header" />
    </GridItem>
    <GridItem span={12}>
      <Grid hasGutter>
        <GridItem span={2}>
          <Skeleton height="30px" width="100%" screenreaderText="Loading chip" />
        </GridItem>
        <GridItem span={2}>
          <Skeleton height="30px" width="100%" screenreaderText="Loading chip" />
        </GridItem>
        <GridItem span={2}>
          <Skeleton height="30px" width="100%" screenreaderText="Loading chip" />
        </GridItem>
      </Grid>
    </GridItem>
    <GridItem span={12}>
      <Grid hasGutter>
        <GridItem span={10}>
          <Skeleton height="90px" width="100%" screenreaderText="Loading security groups" />
        </GridItem>
        <GridItem span={2}>
          <Skeleton height="90px" width="100%" screenreaderText="Loading refresh" />
        </GridItem>
      </Grid>
    </GridItem>
  </Grid>
);

export { EditSecurityGroupsFieldLoading };
