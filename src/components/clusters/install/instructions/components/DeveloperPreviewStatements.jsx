import React from 'react';

import { Content } from '@patternfly/react-core';

import links from '../../../../../common/installLinks.mjs';
import ExternalLink from '../../../../common/ExternalLink';

const DeveloperPreviewStatements = () => (
  <>
    <Content component="p">
      Because these are{' '}
      <ExternalLink href={links.INSTALL_PRE_RELEASE_SUPPORT_KCS} noIcon>
        developer preview
      </ExternalLink>{' '}
      builds:
    </Content>
    <Content component="ul">
      <Content component="li">Production use is not permitted.</Content>
      <Content component="li">
        Installation and use is not eligible for Red Hat production support.
      </Content>
      <Content component="li">
        Upgrades to, from, or between developer preview versions are not supported.
      </Content>
    </Content>
  </>
);

export default DeveloperPreviewStatements;
