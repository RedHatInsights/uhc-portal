import React from 'react';

import { Button, Tooltip } from '@patternfly/react-core';
import { PencilAltIcon } from '@patternfly/react-icons/dist/esm/icons/pencil-alt-icon';

type Props = {
  children?: React.ReactNode | string;
  disableReason?: React.ComponentProps<typeof Tooltip>['content'];
  isAriaDisabled?: boolean;
  tooltipProps?: React.ComponentProps<typeof Tooltip>;
  onClick: () => void;
  'data-testid'?: string;
  ariaLabel?: string;
};

const PencilButton = ({
  isAriaDisabled,
  onClick,
  'data-testid': dataTestId,
  ariaLabel = 'Edit',
}: {
  isAriaDisabled: boolean;
  onClick: () => void;
  'data-testid'?: string;
  ariaLabel?: string;
}) => (
  <Button
    variant="link"
    isInline
    isAriaDisabled={isAriaDisabled}
    icon={<PencilAltIcon />}
    onClick={onClick}
    data-testid={dataTestId}
    aria-label={ariaLabel}
    className="pf-v6-u-p-sm" // Padding is needed to ensure the button has enough click area
  />
);

const EditButton = ({
  disableReason,
  isAriaDisabled = false,
  tooltipProps,
  children,
  ariaLabel,
  onClick,
  'data-testid': dataTestId,
}: Props) => {
  const isDisabled = !!(isAriaDisabled || disableReason);

  const BaseButton = (
    <PencilButton
      isAriaDisabled={isDisabled}
      onClick={onClick}
      data-testid={dataTestId}
      ariaLabel={ariaLabel}
    />
  );

  if ((tooltipProps && tooltipProps.content) || disableReason) {
    return (
      <>
        {children}
        <Tooltip {...tooltipProps} content={disableReason || tooltipProps?.content}>
          {BaseButton}
        </Tooltip>
      </>
    );
  }

  return (
    <>
      {children}
      {BaseButton}
    </>
  );
};

export default EditButton;
