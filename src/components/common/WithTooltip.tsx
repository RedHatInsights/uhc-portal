import * as React from 'react';

import { Tooltip } from '@patternfly/react-core';

type WithTooltipProps = {
  showTooltip: boolean;
  content: React.ReactNode;
  children: React.ReactElement;
  position?: React.ComponentProps<typeof Tooltip>['position'];
};

const WithTooltip = ({ showTooltip, content, children, position }: WithTooltipProps) =>
  showTooltip ? (
    <Tooltip content={content} position={position || 'top'}>
      {children}
    </Tooltip>
  ) : (
    children
  );

export default WithTooltip;
