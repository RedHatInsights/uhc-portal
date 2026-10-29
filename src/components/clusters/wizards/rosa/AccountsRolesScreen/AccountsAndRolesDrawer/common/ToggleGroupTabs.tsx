import React, { ReactElement, useState } from 'react';

import {
  Stack,
  StackItem,
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
    <Stack hasGutter>
      <StackItem>
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
      </StackItem>
      <StackItem className="ocm-instruction-block">{activeTab.body}</StackItem>
    </Stack>
  );
};

export default ToggleGroupTabs;
