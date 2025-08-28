import React from 'react';

import { Content } from '@patternfly/react-core';

import PopoverHint from '~/components/common/PopoverHint';

export const ExcludedNamespacesHelpText =
  "Optional list of namespaces to exclude routes from exposing. If no values are specified, all namespaces will be exposed. Format is a comma-separated list 'value1, value2...'.";

export const ExcludedNamespacesPopover = () => (
  <PopoverHint
    title="Excluded namespaces"
    maxWidth="30rem"
    hint={
      <Content>
        <Content component="p">
          Supply a list of excluded namespaces that will never have routes exposed by the default
          ingress controller. If no values are specified, all namespaces will be exposed. Format
          should be a comma-separated list &quot;value1, value2...&quot;.
        </Content>
      </Content>
    }
  />
);
