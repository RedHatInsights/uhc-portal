import React from 'react';
import { Location, useLocation } from 'react-router-dom';

import { Button, Spinner, Split, SplitItem, Stack, StackItem, Title } from '@patternfly/react-core';
import { Modal as PfModal, ModalProps, ModalVariant } from '@patternfly/react-core/deprecated';

import { NavigateFunction, useNavigate } from '~/common/routing';

import './Modal.scss';

type Props = Omit<
  ModalProps,
  // exclude props which are supplied
  'ref' | 'aria-label'
> & {
  secondaryTitle?: string;
  showPrimary?: boolean;
  primaryText?: string;
  showSecondary?: boolean;
  secondaryText?: string;
  showTertiary?: boolean;
  tertiaryText?: string;
  onPrimaryClick?: () => void;
  onSecondaryClick?: ({
    location,
    navigate,
  }: {
    location: Location;
    navigate: NavigateFunction;
  }) => void;
  onTertiaryClick?: () => void;
  isSmall?: boolean;
  modalSize?: ModalProps['variant'];
  isPrimaryDisabled?: boolean;
  isSecondaryDisabled?: boolean;
  isPending?: boolean;
  primaryVariant?: React.ComponentProps<typeof Button>['variant'];
  primaryLink?: string;
  secondaryLink?: string;
};

const Modal = ({
  title = '',
  secondaryTitle = '',
  onClose,
  showPrimary = true,
  primaryText = 'Confirm',
  showSecondary = true,
  secondaryText = 'Cancel',
  showTertiary,
  tertiaryText,
  onPrimaryClick,
  onSecondaryClick,
  onTertiaryClick,
  isSmall = true,
  modalSize = ModalVariant.default,
  isPrimaryDisabled,
  isSecondaryDisabled,
  isPending,
  children,
  primaryVariant = 'primary',
  primaryLink,
  secondaryLink,
  ...extraProps
}: Props) => {
  const location = useLocation();
  const navigate = useNavigate();

  const header = secondaryTitle ? (
    <Stack>
      <StackItem>
        <Title headingLevel="h1">{title}</Title>
      </StackItem>
      <StackItem className="modal-secondary-title">
        <Split>
          <SplitItem>Cluster</SplitItem>
          <SplitItem>{secondaryTitle}</SplitItem>
        </Split>
      </StackItem>
    </Stack>
  ) : undefined;

  return (
    <PfModal
      // For a medium size modal use variant="large".
      // For a full screen modal use isSmall=false.
      className={isPending ? 'pending-modal' : undefined}
      aria-label={typeof title === 'string' ? title : ''}
      variant={isSmall ? ModalVariant.small : modalSize}
      title={title}
      header={header}
      isOpen
      onClose={onClose}
      actions={
        isPending
          ? []
          : [
              showPrimary && !primaryLink && (
                <Button
                  key="confirm"
                  variant={primaryVariant}
                  onClick={onPrimaryClick}
                  type="submit"
                  isDisabled={isPrimaryDisabled}
                  data-testid="btn-primary"
                >
                  {primaryText}
                </Button>
              ),
              showPrimary && primaryLink && (
                <Button
                  key="confirm"
                  variant={primaryVariant}
                  component="a"
                  target="_blank"
                  href={primaryLink}
                  isDisabled={isPrimaryDisabled}
                  data-testid="btn-primary"
                >
                  {primaryText}
                </Button>
              ),
              showSecondary && !secondaryLink && (
                <Button
                  key="secondary"
                  variant="secondary"
                  onClick={
                    onSecondaryClick
                      ? () =>
                          onSecondaryClick({
                            location,
                            navigate,
                          })
                      : undefined
                  }
                  isDisabled={isSecondaryDisabled}
                  data-testid="btn-secondary"
                >
                  {secondaryText}
                </Button>
              ),
              showSecondary && secondaryLink && (
                <Button
                  key="secondary"
                  variant="secondary"
                  component="a"
                  target="_blank"
                  href={secondaryLink}
                  isDisabled={isSecondaryDisabled}
                  data-testid="btn-secondary"
                >
                  {secondaryText}
                </Button>
              ),
              showTertiary && (
                <Button
                  key="tertiary"
                  variant="secondary"
                  onClick={onTertiaryClick}
                  data-testid="btn-tertiary"
                >
                  {tertiaryText}
                </Button>
              ),
            ]
      }
      {...extraProps}
    >
      {isPending ? (
        <div className="pf-v6-u-text-align-center">
          <Spinner size="lg" aria-label="Loading..." />
        </div>
      ) : (
        children
      )}
    </PfModal>
  );
};

export default Modal;
