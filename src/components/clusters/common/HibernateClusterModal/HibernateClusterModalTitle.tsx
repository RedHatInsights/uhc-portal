import React from 'react';

import { Flex, FlexItem, Icon, Title } from '@patternfly/react-core';
import { InfoCircleIcon } from '@patternfly/react-icons/dist/esm/icons/info-circle-icon';

import TechnologyPreview from '~/components/common/TechnologyPreview';

const HibernateClusterModalTitle = ({ title }: { title: string }) => (
  <Flex alignItems={{ default: 'alignItemsCenter' }}>
    <FlexItem>
      <Icon size="md">
        <InfoCircleIcon className="info" />
      </Icon>
    </FlexItem>
    <FlexItem>
      <Title headingLevel="h2">{title}</Title>
    </FlexItem>
    <FlexItem>
      <TechnologyPreview className="pf-v6-u-ml-0" />
    </FlexItem>
  </Flex>
);

export default HibernateClusterModalTitle;
