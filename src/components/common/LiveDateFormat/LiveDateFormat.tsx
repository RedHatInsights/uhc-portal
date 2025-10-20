import React from 'react';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

import { Timestamp, TimestampFormat, TimestampTooltipVariant } from '@patternfly/react-core';

dayjs.extend(relativeTime);

type Props = {
  date?: Date | undefined;
};

const LiveDateFormat = ({ date }: Props) => {
  // use state to trigger an update on a set interval
  const [, triggerUpdate] = React.useState(0);
  React.useEffect(() => {
    // use Date.now() to set a new state value
    const timer = setInterval(() => triggerUpdate(Date.now()), 60000);
    return () => clearInterval(timer);
  }, []);

  if (!date) {
    return 'N/A';
  }

  return (
    <Timestamp
      date={date}
      dateFormat={TimestampFormat.medium}
      timeFormat={TimestampFormat.medium}
      shouldDisplayUTC
      locale="eng-GB"
      tooltip={{ variant: TimestampTooltipVariant.default }}
    >
      {dayjs().to(dayjs(date))}
    </Timestamp>
  );
};

export default LiveDateFormat;
