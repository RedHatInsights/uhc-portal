import React from 'react';

import { Card, CardBody, CardFooter, CardHeader, CardTitle, Title } from '@patternfly/react-core';

import ExternalLink from '~/components/common/ExternalLink';

import docLinks from '../../../common/installLinks.mjs';

export const LearnMoreOSDCard = () => (
  <Card style={{ height: '100%' }} data-testid="learn-more-osdcard">
    <CardHeader>
      <CardTitle>
        <Title headingLevel="h3">Want to learn more?</Title>
      </CardTitle>
    </CardHeader>
    <CardBody>
      Learn how to get started with OpenShift Dedicated on Google Cloud Marketplace.
    </CardBody>
    <CardFooter>
      <ExternalLink href={docLinks.LEARN_MORE_OSD}>Go to interactive walkthrough</ExternalLink>
    </CardFooter>
  </Card>
);
