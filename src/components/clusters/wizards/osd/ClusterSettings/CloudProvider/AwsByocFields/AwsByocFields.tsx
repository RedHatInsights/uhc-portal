import React from 'react';

import { Alert, Content, ContentVariants, Grid, GridItem, Title } from '@patternfly/react-core';

import links from '~/common/installLinks.mjs';
import { Prerequisites } from '~/components/clusters/wizards/common/Prerequisites/Prerequisites';
import ExternalLink from '~/components/common/ExternalLink';

import { AwsAccountDetails } from './AwsAccountDetails';

export const AwsByocFields = () => (
  <Grid hasGutter>
    <GridItem>
      <Alert variant="info" isInline isPlain title="Customer cloud subscription">
        Provision your cluster in an AWS account owned by you or your company to leverage your
        existing relationship and pay AWS directly for public cloud costs.
      </Alert>
    </GridItem>

    <GridItem>
      <Title headingLevel="h3" className="pf-v6-u-mb-sm">
        AWS account details
      </Title>

      <Prerequisites acknowledgementRequired initiallyExpanded>
        <Content>
          <Content component={ContentVariants.p} className="ocm-secondary-text">
            Successful cluster provisioning requires that:
          </Content>

          <ul>
            <li>
              <Content component={ContentVariants.p} className="ocm-secondary-text">
                Your AWS account has the necessary limits to support your desired cluster size
                according to the{' '}
                <ExternalLink noIcon href={links.OSD_CCS_AWS_LIMITS}>
                  cluster resource requirements
                </ExternalLink>
                .
              </Content>
            </li>
            <li>
              <Content component={ContentVariants.p} className="ocm-secondary-text">
                An IAM user called <b>osdCcsAdmin</b> exists with the AdministratorAccess policy.
              </Content>
            </li>
            <li>
              <Content component={ContentVariants.p} className="ocm-secondary-text">
                An Organization service control policy (SCP) is set up according to the requirements
                for Customer Cloud Subscriptions.
              </Content>
            </li>
          </ul>

          <Content component={ContentVariants.p} className="ocm-secondary-text">
            Business Support for AWS is also recommended. For more guidance, see the{' '}
            <ExternalLink href={links.OSD_CCS_AWS_CUSTOMER_REQ}>
              Customer Cloud Subscription requirements
            </ExternalLink>
            .
          </Content>
        </Content>
      </Prerequisites>
    </GridItem>
    <AwsAccountDetails />
  </Grid>
);
