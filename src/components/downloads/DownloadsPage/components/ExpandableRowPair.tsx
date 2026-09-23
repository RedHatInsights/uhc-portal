import React from 'react';

import { ExpandableRowContent, OnCollapse, Tbody, Td, Tr } from '@patternfly/react-table';

import { expandKeys } from '../../downloadsStructure';

type ExpandableRowPairProps = {
  expanded: { [index: string]: boolean };
  setExpanded: (param: { [index: string]: boolean }) => void;
  expandKey: (typeof expandKeys)[string];
  cells: React.ReactElement[];
  description: React.ReactNode;
  toolRefs: { [index: string]: React.RefObject<any> };
};

/** An expandable pair of table rows. */
const ExpandableRowPair = ({
  expanded,
  setExpanded,
  expandKey,
  cells,
  description,
  toolRefs,
}: ExpandableRowPairProps) => {
  const isExpanded = !!expanded[expandKey];
  const onToggle: OnCollapse = (event, rowIndex, newOpen) => {
    setExpanded({ ...expanded, [expandKey]: newOpen });
  };

  return (
    <Tbody
      isExpanded={isExpanded}
      ref={toolRefs?.[expandKey]}
      data-testid={`expandable-row-${expandKey}`}
    >
      <Tr>
        <Td expand={{ isExpanded, onToggle, rowIndex: 0 }} />
        {cells}
      </Tr>
      <Tr isExpanded={isExpanded} data-testid={`expanded-row-${expandKey}`}>
        <Td colSpan={1 + cells.length}>
          <ExpandableRowContent>{description}</ExpandableRowContent>
        </Td>
      </Tr>
    </Tbody>
  );
};

export default ExpandableRowPair;
