import * as React from 'react';

import { Flex } from '@patternfly/react-core';

import PopoverHint from '~/components/common/PopoverHint';

type AutoNodeKarpenterCountProps = {
  count: number;
};

const AutoNodeKarpenterCount = ({ count }: AutoNodeKarpenterCountProps) => (
  <Flex data-testid="autoNodeKarpenterCountContainer">
    <dt>Autonode (Karpenter): </dt>
    <dd data-testid="autoNodeKarpenterCount">
      {count}{' '}
      <PopoverHint
        iconClassName="nodes-hint"
        buttonAriaLabel="More information about Autonode Karpenter nodes"
        hint="These nodes are automatically provisioned and managed by Karpenter based on workload demands. These nodes are not managed through machine pools."
      />
    </dd>
  </Flex>
);

export default AutoNodeKarpenterCount;
