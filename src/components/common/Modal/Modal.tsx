import React from 'react';
import { Location, useLocation } from 'react-router-dom';

import {
  Button,
  Modal as PfModal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  ModalHeaderProps,
  ModalProps,
  ModalVariant,
  Spinner,
} from '@patternfly/react-core';

import { NavigateFunction, useNavigate } from '~/common/routing';

import './Modal.scss';

type ModalDescriptionProps = {
  description?: string | React.ReactNode;
  secondaryTitle?: string;
};

const ModalDescription = ({ description, secondaryTitle }: ModalDescriptionProps) => {
  if (description) {
    return description;
  }
  if (secondaryTitle) {
    return (
      <div className="custom-modal__secondary-title">
        <span className="custom-modal__secondary-title__label">Cluster</span> {secondaryTitle}
      </div>
    );
  }
  return undefined;
};

type DefaultModalFooterProps = {
  showPrimary?: boolean;
  primaryLink?: string;
  primaryVariant?: React.ComponentProps<typeof Button>['variant'];
  onPrimaryClick?: () => void;
  isPrimaryDisabled?: boolean;
  primaryText?: string;
  showSecondary?: boolean;
  secondaryLink?: string;
  secondaryText?: string;
  isSecondaryDisabled?: boolean;
  onSecondaryClick?: ({
    location,
    navigate,
  }: {
    location: Location;
    navigate: NavigateFunction;
  }) => void;
  showTertiary?: boolean;
  tertiaryText?: string;
  onTertiaryClick?: () => void;
};

const DefaultModalFooter = ({
  showPrimary,
  primaryLink,
  primaryVariant,
  onPrimaryClick,
  isPrimaryDisabled,
  primaryText,
  showSecondary,
  secondaryLink,
  secondaryText,
  isSecondaryDisabled,
  onSecondaryClick,
  showTertiary,
  tertiaryText,
  onTertiaryClick,
}: DefaultModalFooterProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  return (
    <>
      {showPrimary && !primaryLink && (
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
      )}
      {showPrimary && primaryLink && (
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
      )}
      {showSecondary && !secondaryLink && (
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
      )}
      {showSecondary && secondaryLink && (
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
      )}
      {showTertiary && (
        <Button
          key="tertiary"
          variant="secondary"
          onClick={onTertiaryClick}
          data-testid="btn-tertiary"
        >
          {tertiaryText}
        </Button>
      )}
    </>
  );
};

type Props = DefaultModalFooterProps &
  ModalDescriptionProps & {
    title: string | React.ReactNode;
    onClose?: () => void;
    modalSize?: ModalProps['variant'];
    isPending?: boolean;
    children: React.ReactNode;
    id?: string;
    footer?: React.ReactNode;
    'data-testid'?: string;
    isOpen?: boolean;
    titleIconVariant?: ModalHeaderProps['titleIconVariant'];
    className?: string;
    hideDefaultFooter?: boolean;
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
  modalSize = ModalVariant.small,
  isPrimaryDisabled,
  isSecondaryDisabled,
  isPending,
  children,
  primaryVariant = 'primary',
  primaryLink,
  secondaryLink,
  id,
  description,
  footer,
  'data-testid': dataTestid,
  isOpen = true,
  titleIconVariant,
  className,
  hideDefaultFooter,
}: Props) => (
  <PfModal
    id={id}
    className={`${className || ''} openshift custom-modal ${isPending ? 'pending-modal' : ''}`}
    aria-label={typeof title === 'string' ? title : ''}
    variant={modalSize}
    isOpen={isOpen}
    onClose={onClose}
    data-testid={dataTestid}
  >
    <ModalHeader
      title={title}
      description={ModalDescription({ description, secondaryTitle })}
      titleIconVariant={titleIconVariant}
    />
    <ModalBody>
      {isPending ? (
        <div className="pf-v6-u-text-align-center">
          <Spinner size="lg" aria-label="Loading..." />
        </div>
      ) : (
        children
      )}
    </ModalBody>
    <ModalFooter>
      {footer || null}
      {hideDefaultFooter
        ? null
        : DefaultModalFooter({
            showPrimary,
            primaryLink,
            primaryVariant,
            onPrimaryClick,
            isPrimaryDisabled: isPrimaryDisabled || isPending,
            primaryText,
            showSecondary,
            secondaryLink,
            secondaryText,
            isSecondaryDisabled: isSecondaryDisabled || isPending,
            onSecondaryClick,
            showTertiary,
            tertiaryText,
            onTertiaryClick,
          })}
    </ModalFooter>
  </PfModal>
);

export default Modal;
