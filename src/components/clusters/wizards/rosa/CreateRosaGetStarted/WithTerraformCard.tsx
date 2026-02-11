import React from 'react';

import { Card, CardBody, CardTitle, Content, ContentVariants, Title } from '@patternfly/react-core';

import docLinks from '~/common/docLinks.mjs';
import ExternalLink from '~/components/common/ExternalLink';

import TerraformLogo from './TerraformLogo';

const WithTerraform = () => (
  <Card isFullHeight data-testid="deploy-with-terraform-card">
    <CardTitle>
      <Title headingLevel="h3" size="lg">
        <TerraformLogo className="ocm-c-wizard-get-started-terraform--card-icon " />
        {/* <DesktopIcon className="ocm-c-wizard-get-started--card-icon" /> */}
        Deploy with Terraform
      </Title>
    </CardTitle>
    <CardBody>
      <Content component={ContentVariants.p} className="pf-v6-u-mb-sm">
        Create a ROSA HCP cluster using Terraform
      </Content>
      <Content component={ContentVariants.p} className="pf-v6-u-mb-sm">
        Learn how to{' '}
        <ExternalLink href={docLinks.TERRAFORM_ROSA_HCP_URL}>
          deploy a ROSA HCP cluster
        </ExternalLink>
        or{' '}
        <ExternalLink href={docLinks.TERRAFORM_REGISTRY_ROSA_HCP}>
          visit the Terraform registry
        </ExternalLink>
      </Content>
    </CardBody>
  </Card>
);

export default WithTerraform;
