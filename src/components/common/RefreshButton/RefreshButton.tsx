import React from 'react';

import { Button, Tooltip, TooltipPosition } from '@patternfly/react-core';
import { RedoIcon } from '@patternfly/react-icons/dist/esm/icons/redo-icon';

type Props = {
  classOptions?: string;
  refreshFunc: () => void;
  clickRefreshFunc?: () => void;
  autoRefresh?: boolean;
  isDisabled?: boolean;
  ouiaId?: string | number;
  useShortTimer?: boolean;
};

const shortTimerSeconds = 10;
const longTimerSeconds = 60;
const numberOfShortTries = 3;

// See https://overreacted.io/making-setinterval-declarative-with-react-hooks/
const useInterval = (callback: () => void, delay: number) => {
  const savedCallback = React.useRef(callback);

  // Remember the latest callback.
  React.useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  // Set up the interval.
  React.useEffect(() => {
    function tick() {
      savedCallback.current();
    }
    const id = setInterval(tick, delay);
    return () => clearInterval(id);
  }, [delay]);
};

const RefreshBtn = ({
  classOptions,
  refreshFunc,
  clickRefreshFunc,
  autoRefresh,
  isDisabled,
  ouiaId,
  useShortTimer,
}: Props) => {
  const [shortTimerTries, setShortTimerTries] = React.useState(0);
  const [interValTime, setInterValTime] = React.useState(
    useShortTimer ? shortTimerSeconds : longTimerSeconds,
  );

  useInterval(() => {
    if (interValTime === shortTimerSeconds) {
      if (shortTimerTries < numberOfShortTries - 1) {
        // there is a -1 because we are setting the interval after this attempt
        setShortTimerTries(shortTimerTries + 1);
      } else {
        setInterValTime(longTimerSeconds);
        setShortTimerTries(0);
      }
    }

    // autoRefresh check allows refresh to be turned off or on during the lifetime of the component
    // visibilityState checks allows avoiding refreshes when the tab is not visible
    // "online" state check allows to avoid refreshes when the network is offline.
    if (autoRefresh && document.visibilityState === 'visible' && navigator.onLine && !isDisabled) {
      refreshFunc();
    }
  }, interValTime * 1000);

  React.useEffect(() => {
    setInterValTime(useShortTimer ? shortTimerSeconds : longTimerSeconds);
  }, [useShortTimer]);

  return (
    <Tooltip position={TooltipPosition.bottom} content="Refresh">
      <Button
        icon={<RedoIcon />}
        variant="plain"
        aria-label="Refresh"
        className={classOptions}
        onClick={clickRefreshFunc || refreshFunc}
        isAriaDisabled={isDisabled}
        ouiaId={ouiaId}
      />
    </Tooltip>
  );
};

export default RefreshBtn;
