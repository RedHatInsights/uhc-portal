import React from 'react';

import {
  Bullseye,
  Button,
  ButtonVariant,
  EmptyState as PFEmptyState,
  EmptyStateActions,
  EmptyStateBody,
  EmptyStateFooter,
  EmptyStateVariant,
} from '@patternfly/react-core';
import { SearchIcon } from '@patternfly/react-icons/dist/esm/icons/search-icon';

const EmptyState = ({
  showClearFilterButton,
  resetFilters,
}: {
  showClearFilterButton?: boolean;
  resetFilters?: (value: string) => void;
}) => (
  <Bullseye>
    <PFEmptyState
      headingLevel="h2"
      icon={SearchIcon}
      titleText="No results found"
      variant={EmptyStateVariant.sm}
    >
      {showClearFilterButton ? (
        <>
          <EmptyStateBody>Clear all filters and try again.</EmptyStateBody>

          {resetFilters ? (
            <EmptyStateFooter>
              <EmptyStateActions>
                <Button variant={ButtonVariant.link} onClick={() => resetFilters('')}>
                  Clear all filters
                </Button>
              </EmptyStateActions>
            </EmptyStateFooter>
          ) : null}
        </>
      ) : null}
    </PFEmptyState>
  </Bullseye>
);

export default EmptyState;
