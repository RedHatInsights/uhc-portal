import React from 'react';

import { Content, ContentVariants } from '@patternfly/react-core';

import supportLinks from '~/common/supportLinks.mjs';
import ExternalLink from '~/components/common/ExternalLink';
import PopoverHint from '~/components/common/PopoverHint';

import { LABEL_ICON_CLASS } from '../constants';

const SupportLevelLabel = () => (
  <>
    <span>Service level agreement (SLA)</span>
    <PopoverHint
      id="subscripiton-settings-support-level-hint"
      headerContent="Service level agreement (SLA)"
      hint={
        <Content>
          <Content component={ContentVariants.p}>
            How your subscription is supported, including the hours of support coverage and support
            ticket response times.
          </Content>
          <Content component={ContentVariants.p}>
            <ExternalLink href={supportLinks.SUPPORT_HOME}>
              Production Support Terms of Service
            </ExternalLink>
          </Content>
        </Content>
      }
      iconClassName={LABEL_ICON_CLASS}
      hasAutoWidth
      maxWidth="30.0rem"
    />
  </>
);
export default SupportLevelLabel;
