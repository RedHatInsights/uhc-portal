import React from 'react';

import { Tooltip } from '@patternfly/react-core';

type TooltipsProps = {
  isShown?: boolean;
  startPosition?: number;
  additionalGroupSelectors?: string;
};

const Tooltips = ({ isShown, startPosition = 0, additionalGroupSelectors = '' }: TooltipsProps) => {
  const radioGroupSelector = `${additionalGroupSelectors} .pf-v6-c-form__group-control`;

  return isShown ? (
    <>
      {[0, 1, 2, 3].map((index) => (
        <Tooltip
          key={index}
          content={
            <div>Red Hat Marketplace subscription settings are pre-set and cannot be altered.</div>
          }
          position="right"
          triggerRef={() => {
            const groupElements = document.querySelectorAll(radioGroupSelector);
            const groupPosition = startPosition + index;
            if (groupPosition >= 0 && groupPosition < groupElements.length) {
              return groupElements[groupPosition] as HTMLElement;
            }
            // eslint-disable-next-line no-console
            console.error(
              `Edit Subscription tooltip: error selecting ${radioGroupSelector} (${groupPosition})`,
            );
            return null as any as HTMLElement;
          }}
        />
      ))}
    </>
  ) : null;
};

export default Tooltips;
