import React from 'react';
import { FormikValues } from 'formik';

import { Banner, ExpandableSection, GridItem } from '@patternfly/react-core';

import {
  createClusterRequest,
  upgradeScheduleRequest,
} from '~/components/clusters/wizards/common/submitOSDRequest';

interface DebugClusterRequestProps {
  cloudProvider: string;
  product: string;
  formValues: FormikValues;
}

export const DebugClusterRequest = ({
  cloudProvider,
  product,
  formValues,
}: DebugClusterRequestProps) => {
  let clusterRequest;
  let upgradeSchedule;

  try {
    clusterRequest = createClusterRequest({ product, cloudProviderID: cloudProvider }, formValues);
  } catch (err) {
    clusterRequest = `error computing cluster request: ${err}`;
  }

  try {
    upgradeSchedule = upgradeScheduleRequest(formValues);
    if (!upgradeSchedule) {
      upgradeSchedule = 'Manual upgrade strategy, no request to be made.';
    }
  } catch (err) {
    upgradeSchedule = `error computing upgrade request: ${err}`;
  }

  return (
    <GridItem>
      <Banner color="blue">
        <ExpandableSection toggleText="Debug: cluster request to be sent">
          <pre>{JSON.stringify(clusterRequest, null, 2)}</pre>
        </ExpandableSection>
        <ExpandableSection toggleText="Debug: upgrade schedule request to be sent">
          <pre>{JSON.stringify(upgradeSchedule, null, 2)}</pre>
        </ExpandableSection>
      </Banner>
    </GridItem>
  );
};
