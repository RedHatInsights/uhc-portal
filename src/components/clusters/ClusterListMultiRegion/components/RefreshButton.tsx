import React from 'react';

import { Button, Tooltip, TooltipPosition } from '@patternfly/react-core';
import { RedoIcon } from '@patternfly/react-icons/dist/esm/icons/redo-icon';

type Props = {
  classOptions?: string;
  refreshFunc: () => void;
  isDisabled?: boolean;
};

export const RefreshButton = ({ classOptions, refreshFunc, isDisabled }: Props) => (
  <Tooltip position={TooltipPosition.bottom} content="Refresh">
    <Button
      icon={<RedoIcon />}
      variant="plain"
      aria-label="Refresh"
      className={classOptions}
      onClick={refreshFunc}
      isAriaDisabled={isDisabled}
    />
  </Tooltip>
);
