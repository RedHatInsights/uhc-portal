import React from 'react';

import { Content } from '@patternfly/react-core';

import PopoverHint from '~/components/common/PopoverHint';

export const WildcardPolicyPopover = () => (
  <PopoverHint
    title="Wildcard Policy"
    maxWidth="30rem"
    hint={
      <Content>
        <Content component="p">If enabled, a route can have subdomains on its route.</Content>
      </Content>
    }
  />
);
