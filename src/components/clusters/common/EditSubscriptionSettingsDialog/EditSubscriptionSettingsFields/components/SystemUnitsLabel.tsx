import React from 'react';

import { Content, ContentVariants } from '@patternfly/react-core';

import PopoverHint from '~/components/common/PopoverHint';

import { LABEL_ICON_CLASS } from '../constants';

const SystemUnitsLabel = () => (
  <>
    <span>Subscription units</span>
    <PopoverHint
      id="subscripiton-settings-system-units-hint"
      headerContent="Subscription units"
      hint={
        <Content>
          <Content component={ContentVariants.p}>
            How usage is measured for your subscription.
          </Content>
        </Content>
      }
      iconClassName={LABEL_ICON_CLASS}
    />
  </>
);

export default SystemUnitsLabel;
