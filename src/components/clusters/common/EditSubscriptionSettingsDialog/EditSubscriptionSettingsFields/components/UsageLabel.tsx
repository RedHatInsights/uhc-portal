import React from 'react';

import { Content, ContentVariants } from '@patternfly/react-core';

import PopoverHint from '~/components/common/PopoverHint';

import { LABEL_ICON_CLASS } from '../constants';

const UsageLabel = () => (
  <>
    <span>Cluster usage</span>
    <PopoverHint
      id="subscripiton-settings-usage-hint"
      headerContent="Cluster usage"
      hint={
        <Content>
          <Content component={ContentVariants.p}>How you are using this cluster.</Content>
        </Content>
      }
      iconClassName={LABEL_ICON_CLASS}
    />
  </>
);

export default UsageLabel;
