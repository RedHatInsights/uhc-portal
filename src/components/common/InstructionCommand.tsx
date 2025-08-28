import React from 'react';

import { ClipboardCopy, clipboardCopyFunc, Content } from '@patternfly/react-core';

import { TrackEvent } from '~/common/analytics';
import useAnalytics from '~/hooks/useAnalytics';

import './InstructionCommand.scss';

type Props = {
  children: string;
  textAriaLabel?: string;
  trackEvent?: TrackEvent;
  className?: string;
  outerClassName?: string;
};

const InstructionCommand = ({
  children,
  textAriaLabel,
  trackEvent,
  className,
  outerClassName,
  ...props
}: Props) => {
  const track = useAnalytics();
  return (
    <Content component="pre" className={outerClassName}>
      <ClipboardCopy
        isReadOnly
        textAriaLabel={textAriaLabel}
        onCopy={(event, text) => {
          if (trackEvent) {
            track(trackEvent);
          }
          clipboardCopyFunc(event, text);
        }}
        className={className}
        {...props}
      >
        {children}
      </ClipboardCopy>
    </Content>
  );
};

export default InstructionCommand;
