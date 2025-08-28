import React from 'react';

import { Split, SplitItem, Title } from '@patternfly/react-core';

const MachinePoolAutoRepairDetail = ({
  isAutoRepairEnabled,
}: {
  isAutoRepairEnabled: boolean | undefined;
}) => (
  <>
    <Title headingLevel="h4" className="pf-v6-u-mb-sm pf-v6-u-mt-lg">
      AutoRepair
    </Title>
    <Split hasGutter>
      <SplitItem className="auto_repair">{isAutoRepairEnabled ? 'Enabled' : 'Disabled'}</SplitItem>
    </Split>
  </>
);

export default MachinePoolAutoRepairDetail;
