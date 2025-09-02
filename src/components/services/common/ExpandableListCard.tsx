import React from 'react';

import {
  Content,
  ContentVariants,
  ExpandableSection,
  List,
  ListItem,
} from '@patternfly/react-core';

import { ExpandalbeContents } from '../servicePageData/expandableContentsData';

interface ExpandableListCardProps {
  items: ExpandalbeContents[];
}

export const ExpandableListCard = ({ items }: ExpandableListCardProps) => (
  <List isPlain>
    {items.map(({ title, contents }) => (
      <ListItem className="rosa-expandable-list-item" key={title}>
        <ExpandableSection
          className="rosa-expandable-section"
          toggleContent={<Content component={ContentVariants.h3}>{title}</Content>}
          displaySize="lg"
        >
          {contents}
        </ExpandableSection>
      </ListItem>
    ))}
  </List>
);
