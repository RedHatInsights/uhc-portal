import React, { ReactElement, useState } from 'react';

import {
  Flex,
  FlexItem,
  ToggleGroup,
  ToggleGroupItem,
  ToggleGroupItemProps,
} from '@patternfly/react-core';

type ToggleGroupTabsProps = {
  tabs: { title: string; body: ReactElement; 'data-testid'?: string; id: string }[];
};

const ToggleGroupTabs = ({ tabs }: ToggleGroupTabsProps) => {
  const [activeTab, setActiveTab] = useState(tabs[0]);
  const [isSelected, setIsSelected] = useState<string>(tabs[0].id);

  const handleToggleChange: ToggleGroupItemProps['onChange'] = (event) => {
    const { id } = event.currentTarget;
    const tab = tabs.find((element) => element.id === id);

    setIsSelected(id);
    if (tab) {
      setActiveTab(tab);
    }
  };

  return (
    <Flex>
      <FlexItem>
        <ToggleGroup>
          {tabs.map((tab) => (
            <ToggleGroupItem
              text={tab.title}
              buttonId={tab.id}
              isSelected={isSelected === tab.id}
              onChange={handleToggleChange}
              data-testid={tab['data-testid']}
            />
          ))}
        </ToggleGroup>
      </FlexItem>
      <FlexItem className="ocm-instruction-block">{activeTab.body}</FlexItem>
    </Flex>
  );
};

export default ToggleGroupTabs;
