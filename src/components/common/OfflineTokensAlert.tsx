import React from 'react';

import { Alert } from '@patternfly/react-core';

import { Link } from '~/common/routing';
import supportLinks from '~/common/supportLinks.mjs';
import ExternalLink from '~/components/common/ExternalLink';

type OfflineTokensAlertProps = {
  isRosa: boolean;
  setShouldShowTokens: (el: boolean) => void;
};

const OfflineTokensAlert = ({ isRosa, setShouldShowTokens }: OfflineTokensAlertProps) => (
  <Alert
    className="pf-v6-u-mt-md"
    variant="warning"
    isInline
    title="Logging in with offline tokens is being deprecated"
  >
    Logging in using tokens is being deprecated. You can now log in using your{' '}
    <Link to={isRosa ? '/token/rosa' : '/token'} onClick={() => setShouldShowTokens(false)}>
      Red Hat SSO credentials
    </Link>
    {'. '}
    <br />
    <ExternalLink href={supportLinks.OFFLINE_TOKENS_KB} noIcon>
      Learn more about how to log in using your Red Hat SSO credentials and why we&apos;re
      deprecating tokens.
    </ExternalLink>
  </Alert>
);

export default OfflineTokensAlert;
