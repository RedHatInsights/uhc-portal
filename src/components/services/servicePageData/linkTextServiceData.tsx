import React from 'react';

import { Label } from '@patternfly/react-core';

import ExternalLink from '~/components/common/ExternalLink';

import docLinks from '../../../common/installLinks.mjs';

type TextLabelLinkItem = {
  listItemText: string;
  listItemLabel: React.ReactNode;
  listItemLink: React.ReactNode;
};

export type LinkTextLabelLinkCardContents = {
  cardClassName: string;
  textLabelLinkItems: TextLabelLinkItem[];
};

export const osdLinkTextLabelLinkCardContents: LinkTextLabelLinkCardContents = {
  cardClassName: 'pf-v6-u-mb-lg',
  textLabelLinkItems: [
    {
      listItemText: 'Red Hat OpenShift Dedicated on Google Cloud Marketplace',
      listItemLabel: <Label color="yellow">Documentation</Label>,
      listItemLink: <ExternalLink href={docLinks.OSD_GOOGLE_MARKETPLACE}>Learn More</ExternalLink>,
    },
    {
      listItemText: 'Red Hat OpenShift Dedicated Interactive Walkthrough',
      listItemLabel: <Label color="green">Walkthrough</Label>,
      listItemLink: <ExternalLink href={docLinks.LEARN_MORE_OSD}>Learn More</ExternalLink>,
    },
    {
      listItemText: 'How to get started with OpenShift Dedicated on Google Cloud Marketplace',
      listItemLabel: <Label color="yellow">Quickstart</Label>,
      listItemLink: <ExternalLink href={docLinks.OSD_QUICKSTART}>Learn More</ExternalLink>,
    },
  ],
};

export const rosaLinkTextLabelLinkCardContents: LinkTextLabelLinkCardContents = {
  cardClassName: 'pf-v6-u-mb-lg',
  textLabelLinkItems: [
    {
      listItemText: 'Product Documentation for Red Hat OpenShift Service on AWS 4',
      listItemLabel: <Label color="yellow">Documentation</Label>,
      listItemLink: <ExternalLink href={docLinks.ROSA_CP_DOCS}>Learn More</ExternalLink>,
    },
    {
      listItemText: 'Red Hat OpenShift Service on AWS quickstart guide',
      listItemLabel: <Label color="green">Quickstart</Label>,
      listItemLink: <ExternalLink href={docLinks.ROSA_QUICKSTART}>Learn More</ExternalLink>,
    },
    {
      listItemText: 'Troubleshooting installations',
      listItemLabel: <Label color="yellow">Documentation</Label>,
      listItemLink: (
        <ExternalLink href={docLinks.ROSA_TROUBLESHOOTING_INSTALLATIONS}>Learn More</ExternalLink>
      ),
    },
    {
      listItemText: 'Red Hat OpenShift Service on AWS service definition',
      listItemLabel: <Label color="yellow">Documentation</Label>,
      listItemLink: <ExternalLink href={docLinks.ROSA_DEFINITION_DOC}>Learn More</ExternalLink>,
    },
  ],
};
