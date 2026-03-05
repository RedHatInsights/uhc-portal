import React from 'react';

import { Card, CardBody, Title } from '@patternfly/react-core';

import links from '../../../../../../common/installLinks.mjs';
import ExternalLink from '../../../../../common/ExternalLink';

import { BreakGlassCredentialList } from './BreakGlassCredentialList';
import { ExternalAuthProviderList } from './ExternalAuthProviderList';

type ExternalAuthenticationSectionProps = {
  clusterID: string;
  subscriptionID: string;
  canUpdateClusterResource: boolean;
  region?: string;
};

export const ExternalAuthenticationSection = ({
  clusterID,
  subscriptionID,
  canUpdateClusterResource,
  region,
}: ExternalAuthenticationSectionProps) => (
  <Card>
    <CardBody>
      <Title className="card-title" headingLevel="h3" size="lg">
        External authentication
      </Title>
      <p>
        Allow authentication to be handled by an external provider.
        <ExternalLink href={links.ROSA_HCP_EXT_AUTH}> Learn more.</ExternalLink>
      </p>

      <ExternalAuthProviderList
        clusterID={clusterID}
        canUpdateClusterResource={canUpdateClusterResource}
        region={region}
      />
    </CardBody>
    <CardBody>
      <Title className="card-title" headingLevel="h3" size="lg">
        Credentials
      </Title>
      <p>
        Allows temporary admin access to the cluster using kubeconfig file.
        <ExternalLink href={links.ROSA_HCP_BREAK_GLASS}> Learn more.</ExternalLink>
      </p>
      <BreakGlassCredentialList
        subscriptionID={subscriptionID}
        clusterID={clusterID}
        region={region}
      />
    </CardBody>
  </Card>
);
