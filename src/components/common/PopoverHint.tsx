import React from 'react';

import { Button, Popover, PopoverProps } from '@patternfly/react-core';
import { ExclamationCircleIcon } from '@patternfly/react-icons/dist/esm/icons/exclamation-circle-icon';
import { OutlinedQuestionCircleIcon } from '@patternfly/react-icons/dist/esm/icons/outlined-question-circle-icon';

import './PopoverHint.scss';

interface PopoverHintProps extends Omit<PopoverProps, 'bodyContent'> {
  hint?: React.ReactNode;
  title?: React.ReactNode;
  iconClassName?: string;
  buttonAriaLabel?: string;
  footer?: React.ReactNode;
  bodyContent?: React.ReactNode | ((hide: () => void) => React.ReactNode);
  isError?: boolean;
}

const PopoverHint = ({
  title,
  hint,
  iconClassName,
  footer,
  bodyContent,
  buttonAriaLabel,
  isError,
  ...popoverProps
}: PopoverHintProps) => (
  <Popover
    headerContent={title}
    footerContent={footer}
    aria-label="help"
    bodyContent={bodyContent ?? hint}
    className="openshift"
    {...popoverProps}
  >
    <Button
      icon={
        <span className={iconClassName}>
          {isError ? <ExclamationCircleIcon className="danger" /> : <OutlinedQuestionCircleIcon />}
        </span>
      }
      className="popover-hint-button"
      aria-label={buttonAriaLabel || (isError ? 'Error' : 'More information')}
      variant="plain"
      hasNoPadding
    />
  </Popover>
);

export default PopoverHint;
