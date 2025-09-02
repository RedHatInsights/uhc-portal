/* eslint-disable arrow-body-style */
import React, { ReactNode } from 'react';

import { Card, List, ListItem, Split, SplitItem } from '@patternfly/react-core';

export type TextLabelLinkItem = {
  listItemText: string;
  listItemLabel: ReactNode;
  listItemLink: ReactNode;
  dataTestId?: string;
};

export type ListTextLabelLinkCardProps = {
  cardClassName: string;
  textLabelLinkItems: TextLabelLinkItem[];
};

export function ListTextLabelLinkCard(props: ListTextLabelLinkCardProps) {
  const { cardClassName, textLabelLinkItems } = props;

  return (
    <Card className={cardClassName} data-testid="recommended-content">
      <List isPlain isBordered>
        {textLabelLinkItems.length &&
          textLabelLinkItems.map(
            ({ listItemText, listItemLabel, listItemLink, dataTestId }, index) => {
              let splitClassName = 'pf-v6-u-pt-md pf-v6-u-pr-md pf-v6-u-pb-md pf-v6-u-pl-md';
              if (index === textLabelLinkItems.length - 1) {
                splitClassName += ' pf-v6-u-pb-lg';
              }
              if (index === 0) {
                splitClassName += ' pf-v6-u-pt-lg';
              }

              return (
                <ListItem key={listItemText}>
                  <Split className={splitClassName} hasGutter data-testid={dataTestId}>
                    <SplitItem style={{ width: '60%' }}>
                      <Split>
                        <SplitItem>{listItemText}</SplitItem>
                        <SplitItem isFilled />
                      </Split>
                    </SplitItem>
                    <SplitItem style={{ width: '40%' }}>
                      <Split>
                        <SplitItem data-testtag="label">{listItemLabel}</SplitItem>
                        <SplitItem isFilled />
                        <SplitItem>{listItemLink}</SplitItem>
                      </Split>
                    </SplitItem>
                  </Split>
                </ListItem>
              );
            },
          )}
      </List>
    </Card>
  );
}
