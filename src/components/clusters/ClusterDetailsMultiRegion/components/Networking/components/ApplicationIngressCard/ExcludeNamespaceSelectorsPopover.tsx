import React from 'react';

import { Content } from '@patternfly/react-core';

import PopoverHint from '~/components/common/PopoverHint';

export const ExcludeNamespaceSelectorsHelpText =
  'Namespaces matching any of these label selectors will be excluded from the default ingress controller.';

export const ExcludeNamespaceSelectorsPopover = () => (
  <PopoverHint
    title="Exclude namespace selectors"
    hint={
      <Content>
        <Content component="p">
          Add one or more label selectors. For each row, enter a label key and a comma-separated
          list of values without spaces around commas (for example: <code>finance,HR,legal</code>).
          Namespaces whose labels match any of these selectors will be excluded from the default
          ingress controller.
        </Content>
      </Content>
    }
  />
);
