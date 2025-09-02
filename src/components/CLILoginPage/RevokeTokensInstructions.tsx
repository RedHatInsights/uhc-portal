import React from 'react';

import { Content, List, ListItem } from '@patternfly/react-core';

import ExternalLink from '../common/ExternalLink';

import './RevokeTokensInstructions.scss';

type Props = {
  reason?: string;
};

const RevokeTokensInstructions = ({ reason }: Props) => (
  <Content className="ocm-c-revoke-tokens">
    {reason && (
      <p className="pf-v6-u-mt-sm">
        <strong>{reason}</strong>
      </p>
    )}

    <Content component="p">To manage and revoke previous tokens:</Content>

    <List component="ol">
      <ListItem>
        Navigate to the{' '}
        <ExternalLink href="https://sso.redhat.com/auth/realms/redhat-external/account/#/applications">
          <b>SSO application management</b>
        </ExternalLink>{' '}
        page.
      </ListItem>
      <ListItem>
        Locate the <b>cloud-services</b> client ID, expand the row if necessary.
      </ListItem>
      <ListItem>
        Select <b>Remove access</b>.
      </ListItem>
    </List>

    <Content component="p">
      All refresh tokens will stop working immediately after you Remove access, but existing access
      tokens (which are cached by <code>ocm</code> and <code>rosa</code> commands) may take up to 15
      minutes to expire.
    </Content>

    <Content component="p">Refresh this page afterwards to generate a new token.</Content>
  </Content>
);

export default RevokeTokensInstructions;
