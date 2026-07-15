import React from 'react';

import { Card, CardBody, CardFooter, CardHeader, CardTitle, Title } from '@patternfly/react-core';

import InternalTrackingLink from '~/components/common/InternalTrackingLink';

export const TryRosaCard = () => {
  const rosaHandsOnURL = '/overview/rosa/hands-on';

  return (
    <Card style={{ height: '100%' }}>
      <CardHeader>
        <CardTitle>
          <Title headingLevel="h3">Want a preview of ROSA?</Title>
        </CardTitle>
      </CardHeader>
      <CardBody>Access a no-cost, hands-on Red Hat OpenShift Service on AWS experience.</CardBody>
      <CardFooter>
        <InternalTrackingLink isButton variant="secondary" to={rosaHandsOnURL}>
          Try it
        </InternalTrackingLink>
      </CardFooter>
    </Card>
  );
};
