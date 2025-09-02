import React from 'react';

import {
  Card,
  CardBody,
  CardHeader,
  CardTitle,
  Flex,
  FlexItem,
  Title,
} from '@patternfly/react-core';

import ExternalLink from '~/components/common/ExternalLink';

import docLinks from '../../../common/installLinks.mjs';

export const RosaPricingCard = () => (
  <>
    <Title className="pf-v6-u-mt-lg pf-v6-u-mb-lg" headingLevel="h2">
      Pricing
    </Title>
    <Flex>
      <FlexItem flex={{ default: 'flex_1' }}>
        <Card>
          <Flex justifyContent={{ default: 'justifyContentSpaceBetween' }}>
            <FlexItem>
              <CardHeader>
                <CardTitle>
                  <Title headingLevel="h3">Cost Component 1: ROSA service fees</Title>
                </CardTitle>
              </CardHeader>
              <CardBody>
                Accrue on demand at an hourly rate per 4 vCPU used by worker nodes. Annual contracts
                are also available for further discounts. ROSA service fees are uniform across all
                supported regions.
              </CardBody>
            </FlexItem>
          </Flex>
        </Card>
      </FlexItem>
      <FlexItem flex={{ default: 'flex_1' }} alignSelf={{ default: 'alignSelfStretch' }}>
        <Card isFullHeight>
          <Flex justifyContent={{ default: 'justifyContentSpaceBetween' }}>
            <FlexItem>
              <CardHeader>
                <CardTitle>
                  <Title headingLevel="h3">Cost Component 2: AWS infrastructure fees</Title>
                </CardTitle>
              </CardHeader>
              <CardBody>
                Includes fees for the underlying worker nodes, infrastructure nodes, control plane
                nodes, storage, and network.
              </CardBody>
            </FlexItem>
          </Flex>
        </Card>
      </FlexItem>
    </Flex>
    <div className="pf-v6-u-mt-md">
      <ExternalLink href={docLinks.ROSA_PRICING}>Learn more about pricing</ExternalLink>
    </div>
  </>
);
