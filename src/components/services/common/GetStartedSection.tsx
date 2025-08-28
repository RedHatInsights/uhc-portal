import React from 'react';

import { Content, Flex, FlexItem, Title } from '@patternfly/react-core';

import { CreateClusterCard } from './CreateClusterCard';

interface GetStartedSectionProps {
  linkComponentURL: string;
  learnMore: React.ReactNode;
  bodyContent: string;
  title: string;
  createClusterBtnTitle: string;
}

export const GetStartedSection = ({
  bodyContent,
  linkComponentURL,
  title,
  learnMore,
  createClusterBtnTitle,
}: GetStartedSectionProps) => (
  <>
    <Content className="pf-v6-u-mb-lg">
      <Title headingLevel="h2">{title}</Title>
    </Content>
    <Flex>
      <FlexItem flex={{ default: 'flex_1' }}>
        <CreateClusterCard
          createClusterBtnTitle={createClusterBtnTitle}
          linkComponentURL={linkComponentURL!}
          bodyContent={bodyContent}
          title={title}
        />
      </FlexItem>
      <FlexItem flex={{ default: 'flex_1' }} alignSelf={{ default: 'alignSelfStretch' }}>
        {learnMore}
      </FlexItem>
    </Flex>
  </>
);
