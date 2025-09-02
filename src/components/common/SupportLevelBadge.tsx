import React from 'react';

import { Icon, Label, Popover, PopoverPosition } from '@patternfly/react-core';
import { InfoCircleIcon } from '@patternfly/react-icons/dist/esm/icons/info-circle-icon';

import links from '../../common/installLinks.mjs';

import ExternalLink from './ExternalLink';

// TODO: Merge with @openshift-assisted/ui-lib's <PreviewBadge>?

type SupportLevelProps = {
  text: string;
  popoverContent: React.ReactNode;
  externalLink?: string;
  className?: string;
};

// Same as @openshift-assisted/ui-lib's <TechnologyPreview>
export const TECH_PREVIEW: SupportLevelProps = {
  text: 'Technology Preview',
  externalLink: links.TECH_PREVIEW_KCS,
  popoverContent:
    'Technology preview features provide early access to upcoming product innovations, enabling you to test functionality and provide feedback during the development process.',
};

export const DEV_PREVIEW: SupportLevelProps = {
  // TODO: this differs from @openshift-assisted/ui-lib's <DeveloperPreview>
  text: 'Developer Preview',
  externalLink: links.INSTALL_PRE_RELEASE_SUPPORT_KCS,
  popoverContent:
    'Developer preview features provide early access to upcoming product innovations, enabling\n' +
    'you to test functionality and provide feedback during the development process.',
};

export const COOPERATIVE_COMMUNITY: SupportLevelProps = {
  text: 'Cooperative Community',
  externalLink: links.COOPERATIVE_COMMUNITY_SUPPORT_KCS,
  popoverContent:
    'Cooperative Community Support provides assistance to Red Hat customers that have questions\n' +
    'about community-provided software that is often used with our Red Hat products',
};

const SupportLevelBadge = ({
  text,
  popoverContent,
  externalLink,
  className = 'pf-v6-u-ml-md',
}: SupportLevelProps) => {
  const infoElem = (
    <>
      <div className="pf-v6-u-mb-sm">{popoverContent}</div>
      {externalLink && <ExternalLink href={externalLink}>Learn more</ExternalLink>}
    </>
  );
  return (
    <Popover position={PopoverPosition.top} bodyContent={infoElem}>
      <Label
        style={{ cursor: 'pointer' }}
        color="orange"
        onClick={(event) => {
          event.preventDefault();
        }}
        icon={
          <Icon>
            <InfoCircleIcon />
          </Icon>
        }
        className={`${className} pf-v6-u-display-inline`}
      >
        {text}
      </Label>
    </Popover>
  );
};

export default SupportLevelBadge;
