import React from 'react';

import { Content, ContentVariants } from '@patternfly/react-core';

import PopoverHint from '~/components/common/PopoverHint';

import { LABEL_ICON_CLASS } from '../constants';

const ServiceLevelLabel = () => (
  <>
    <span>Support type</span>
    <PopoverHint
      id="subscripiton-settings-service-level-hit"
      headerContent="Support type"
      hint={
        <Content>
          <Content component={ContentVariants.p}>Who you can call for primary support.</Content>
        </Content>
      }
      iconClassName={LABEL_ICON_CLASS}
    />
  </>
);
export default ServiceLevelLabel;
