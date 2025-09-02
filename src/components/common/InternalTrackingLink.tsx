import React from 'react';

import { Button, ButtonProps } from '@patternfly/react-core';

import { trackEvents } from '~/common/analytics';
import { Link } from '~/common/routing';
import useAnalytics from '~/hooks/useAnalytics';

import './ExternalLink.scss';

type InternalTrackingLinkProps = {
  to: string;
  children?: React.ReactNode;
  className?: string;
  stopClickPropagation?: boolean;
  isButton?: boolean;
  variant?: ButtonProps['variant'];
  component?: (props: any) => React.JSX.Element;
  'data-testid'?: string;
  isAriaDisabled?: boolean;
};

enum servicePageLinks {
  createRosaClusterURL = '/create/rosa/getstarted',
  rosaHandsOnURL = '/overview/rosa/hands-on',
  rosaServicePageURL = '/overview/rosa',
  createOSDClusterURL = '/create/osd',
  createClusterURL = '/create',
  registerClusterURL = '/register',
}

const InternalLink = (props: InternalTrackingLinkProps) => {
  const { to, children, stopClickPropagation, isButton, component } = props;
  const track = useAnalytics();

  const trackInternalLink = () => {
    let eventType;
    if (to.includes(servicePageLinks.createRosaClusterURL)) {
      eventType = trackEvents.CreateClusterROSA;
    } else if (to.includes(servicePageLinks.rosaServicePageURL)) {
      eventType = trackEvents.RosaOverview;
    } else if (to.includes(servicePageLinks.rosaHandsOnURL)) {
      eventType = trackEvents.TryRosaHandsOnExperience;
    } else if (to.includes(servicePageLinks.createOSDClusterURL)) {
      eventType = trackEvents.CreateClusterOSD;
    } else if (to.includes(servicePageLinks.createClusterURL)) {
      eventType = trackEvents.CreateClusterRHOCP;
    } else if (to.includes(servicePageLinks.registerClusterURL)) {
      eventType = trackEvents.RegisterCluster;
    }

    if (eventType) {
      track(eventType, {
        url: to,
        path: window.location.pathname,
      });
    }
  };

  const handleClick: React.MouseEventHandler = (event) => {
    if (stopClickPropagation) {
      trackInternalLink();
      event.stopPropagation();
    } else {
      trackInternalLink();
    }
  };

  return isButton ? (
    <Button component={component || 'a'} {...props} onClick={handleClick}>
      {children}
    </Button>
  ) : (
    <Link {...props} onClick={handleClick}>
      {children}
    </Link>
  );
};

export default InternalLink;
