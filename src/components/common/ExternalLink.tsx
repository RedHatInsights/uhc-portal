import React from 'react';

import { Button, ButtonProps, ButtonVariant, Icon } from '@patternfly/react-core';
import { ExternalLinkAltIcon } from '@patternfly/react-icons/dist/esm/icons/external-link-alt-icon';

import { trackEvents } from '~/common/analytics';
import { getLocation } from '~/common/location';
import useAnalytics from '~/hooks/useAnalytics';

import './ExternalLink.scss';

type Props = {
  href: string;
  children?: React.ReactNode;
  noIcon?: boolean;
  noTarget?: boolean;
  className?: string;
  stopClickPropagation?: boolean;
  isButton?: boolean;
  variant?: ButtonProps['variant'];
  customTrackProperties?: Record<string, unknown>;
  'data-testid'?: string;
};

const ExternalLink = ({
  href,
  children,
  noIcon,
  noTarget,
  className,
  stopClickPropagation,
  isButton,
  variant = ButtonVariant.secondary,
  customTrackProperties = {},
  'data-testid': dataTestId,
}: Props) => {
  const track = useAnalytics();

  const trackExternalLink = () => {
    const path = getLocation().pathname;
    let resource;
    if (path.includes('/rosa')) {
      resource = 'moa';
    } else if (path.includes('/osdtrial')) {
      resource = 'osdtrial';
    } else if (path.includes('/osd')) {
      resource = 'osd';
    } else if (path.includes('/crc')) {
      resource = 'crc';
    } else {
      resource = 'all';
    }

    track(trackEvents.ExternalLink, {
      customProperties: {
        link_url: href,
        module: 'openshift',
        ocm_resource_type: resource,
        ...customTrackProperties,
      },
    });
  };

  const handleClick: React.MouseEventHandler = (event) => {
    if (stopClickPropagation) {
      trackExternalLink();
      event.stopPropagation();
    } else {
      trackExternalLink();
    }
  };

  const linkProps = {
    href,
    target: noTarget ? '' : '_blank',
    rel: 'noreferrer noopener',
    className,
    onClick: handleClick,
    'data-testid': dataTestId,
  };

  const childrenComp = (
    <>
      {children}
      {noTarget ? null : <span className="pf-v6-u-screen-reader"> (new window or tab)</span>}
      {
        // TODO: replace it by <Button component="a" href="..." variant="link" icon={<ExternalLinkSquareAltIcon />} ...
        !noIcon && (
          <Icon size="md" isInline className="external-link-alt-icon">
            <ExternalLinkAltIcon data-testid="openInNewWindowIcon" />
          </Icon>
        )
      }
    </>
  );
  return isButton ? (
    <Button component="a" {...linkProps} variant={variant}>
      {childrenComp}
    </Button>
  ) : (
    <a {...linkProps}>{childrenComp}</a>
  );
};

export default ExternalLink;
