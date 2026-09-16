import * as React from 'react';

import { Flex, FlexItem, Label } from '@patternfly/react-core';

import { getSpotInterruptionHandlingModeLabel } from '~/components/clusters/common/SpotInterruptionHandling/spotInterruptionHandlingConstants';
import { ClusterFromSubscription } from '~/types/types';

type SpotInterruptionHandlingModeFieldProps = {
  cluster: ClusterFromSubscription;
};

const SpotInterruptionHandlingModeField = ({ cluster }: SpotInterruptionHandlingModeFieldProps) => (
  <Flex className="pf-v6-u-mt-md">
    <FlexItem>Spot interruption handling: </FlexItem>
    <FlexItem>
      <Label variant="outline" color="blue" isCompact data-testid="spotInterruptionHandlingMode">
        {getSpotInterruptionHandlingModeLabel(cluster)}
      </Label>
    </FlexItem>
  </Flex>
);

export default SpotInterruptionHandlingModeField;
