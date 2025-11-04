import React from 'react';

import { Icon, Popover } from '@patternfly/react-core';
import { HelpIcon } from '@patternfly/react-icons/dist/esm/icons/help-icon';

import { PLATFORM_LIGHTSPEED_REBRAND } from '~/queries/featureGates/featureConstants';
import { useFeatureGate } from '~/queries/featureGates/useFetchFeatureGate';

import links from '../../../common/installLinks.mjs';
import ExternalLink from '../../common/ExternalLink';

const InfoPopover = () => {
  const allowPlatformLightspeedRebrand = useFeatureGate(PLATFORM_LIGHTSPEED_REBRAND);
  const productName = allowPlatformLightspeedRebrand ? 'Red Hat Lightspeed' : 'Insights';

  const informationText = [
    `${productName} identifies and prioritizes risks to security, performance, availability, and stability of your clusters.`,
    `This feature uses the Remote Health functionality of OpenShift Container Platform. For further details about ${productName}, see the `,
  ];

  return (
    <Popover
      className="openshift ocm-insights--info-popover"
      aria-label={`What is ${productName}?`}
      position="left"
      maxWidth="25rem"
      enableFlip
      bodyContent={
        <>
          <p>{informationText[0]}</p>
          <p>
            {informationText[1]}
            <ExternalLink href={links.REMOTE_HEALTH_INSIGHTS}>OpenShift documentation</ExternalLink>
          </p>
        </>
      }
    >
      <Icon
        className="ocm-insights--info-popover__icon"
        role="button"
        aria-label={`Learn more about ${productName}`}
      >
        <HelpIcon />
      </Icon>
    </Popover>
  );
};

export default InfoPopover;
