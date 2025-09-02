import React from 'react';

import {
  Content,
  ContentVariants,
  Flex,
  FlexItem,
  Grid,
  GridItem,
  Title,
} from '@patternfly/react-core';

import ExternalLink from '~/components/common/ExternalLink';

type GeneralDrawerPanelHeadProps = {
  title: string;
  logo: string;
  trialButtonLink?: string;
};

const GeneralDrawerPanelHead = ({ title, logo, trialButtonLink }: GeneralDrawerPanelHeadProps) => (
  <Flex
    alignItems={{
      default: 'alignItemsCenter',
    }}
  >
    <FlexItem>
      <img
        src={logo}
        alt={`${title} logo`}
        className="drawer-panel-content__logo"
        data-testid={`${title}-drawer-panel-content__logo`}
      />
    </FlexItem>
    <Grid hasGutter>
      <GridItem span={12}>
        <Title headingLevel="h2" data-testid="drawer-panel-content__title">
          {title}
        </Title>
        <Content component={ContentVariants.small}>by Red Hat</Content>
      </GridItem>
      {trialButtonLink ? (
        <GridItem span={12}>
          <ExternalLink href={trialButtonLink} isButton variant="primary">
            Start free trial
          </ExternalLink>
        </GridItem>
      ) : null}
    </Grid>
  </Flex>
);

export { GeneralDrawerPanelHead };
