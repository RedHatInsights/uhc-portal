import React from 'react';

import {
  Card,
  CardBody,
  CardHeader,
  CardTitle,
  Content,
  Flex,
  FlexItem,
  List,
  ListItem,
  Title,
} from '@patternfly/react-core';

import ExternalLink from '~/components/common/ExternalLink';

import docLinks from '../../../common/installLinks.mjs';

const pricingData = [
  {
    title: 'Hourly',
    first: 'Worker nodes CPU',
    second: 'As low as $0.171/4vCPU/hour',
    third: 'Equivalent to $1500/year',
  },
  {
    title: '1-Year',
    first: 'Worker nodes CPU',
    second: 'As low as $0.114/4vCPU/hour',
    third: 'Equivalent to $1000/year',
  },
  {
    title: '3-Year',
    first: 'Worker nodes CPU',
    second: 'As low as $0.076/4vCPU/hour',
    third: 'Equivalent to $667/year',
  },
];

const recommendationsData = [
  {
    title: 'Infrastructure billing: Customer Cloud Subscription (CCS)',
    first: 'Flexibility in instance availability and portability, private networks, etc.',
  },
  {
    title: 'Purchase channel: Google Cloud Marketplace',
    first: 'Flexible, PAYGO billing across all regions',
    second: 'Optimize spend with Google committed use discounts (CUD).',
    third: 'Auto-scaling is enabled for your clusters.',
  },
  {
    title: 'Cloud provider: Google Cloud',
    first: 'Looking for an AWS option? Red Hat OpenShift on AWS is your best fit.',
  },
];

export const OSDPricingCard = () => (
  <>
    <Title className="pf-v6-u-mt-lg pf-v6-u-mb-lg" headingLevel="h2">
      Pricing
    </Title>
    <Flex direction={{ default: 'column' }}>
      <FlexItem>
        <Flex flexWrap={{ default: 'nowrap' }} alignItems={{ default: 'alignItemsStretch' }}>
          {pricingData.map((card) => (
            <FlexItem>
              <Card data-testid="pricing-card">
                <Flex>
                  <FlexItem>
                    <CardHeader>
                      <CardTitle>
                        <Title headingLevel="h3">{card.title}</Title>
                      </CardTitle>
                    </CardHeader>
                    <CardBody>
                      <Title headingLevel="h4">{card.first}</Title>
                      <Content component="p">{card.second}</Content>
                      <Content component="p">{card.third}</Content>
                    </CardBody>
                  </FlexItem>
                </Flex>
              </Card>
            </FlexItem>
          ))}
        </Flex>
      </FlexItem>
      <FlexItem>
        <div className="pf-v6-u-mb-md">
          <ExternalLink href={docLinks.OSD_PRICING}>Learn more about pricing</ExternalLink>
        </div>
      </FlexItem>
    </Flex>

    <Title className="pf-v6-u-mt-lg pf-v6-u-mb-lg" headingLevel="h2">
      Recommendations
    </Title>

    <Flex flexWrap={{ default: 'nowrap' }} alignItems={{ default: 'alignItemsStretch' }}>
      {recommendationsData.map((card) => (
        <FlexItem>
          <Card style={{ height: '100%' }} data-testid="recommendations-card">
            <CardHeader>
              <CardTitle>
                <Title headingLevel="h3">{card.title}</Title>
              </CardTitle>
            </CardHeader>
            <CardBody>
              <List isPlain>
                <ListItem>{card.first}</ListItem>
                <ListItem>{card?.second}</ListItem>
                <ListItem>{card?.third}</ListItem>
              </List>
            </CardBody>
          </Card>
        </FlexItem>
      ))}
    </Flex>
  </>
);
