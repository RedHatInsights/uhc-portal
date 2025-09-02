import React from 'react';

import { Alert } from '@patternfly/react-core';

import links from '~/common/installLinks.mjs';
import { Link } from '~/common/routing';

import ExternalLink from '../common/ExternalLink';

type SSOAlertProps = {
  isRosa?: boolean;
  gettingStartedPage?: boolean;
  setShouldShowTokens: (v: boolean) => void;
};

export const SSOAlert = ({
  isRosa = true,
  gettingStartedPage = false,
  setShouldShowTokens,
}: SSOAlertProps) => (
  <Alert
    className="pf-v6-u-m-md"
    variant="warning"
    isInline
    title="Still need access to API tokens to authenticate?"
  >
    For enhanced security, we recommend authenticating with your SSO credentials. If needed, you can
    still{' '}
    <Link to={isRosa ? '/token/rosa' : '/token'} onClick={() => setShouldShowTokens(true)}>
      use API tokens to authenticate
    </Link>{' '}
    against Red Hat OpenShift Cluster Manager account.{' '}
    <ExternalLink href={isRosa ? links.LEARN_MORE_SSO_ROSA : links.LEARN_MORE_SSO} noIcon>
      Learn more about logging into OpenShift Cluster Manager CLI with Red Hat single sign-on.
    </ExternalLink>
  </Alert>
);
