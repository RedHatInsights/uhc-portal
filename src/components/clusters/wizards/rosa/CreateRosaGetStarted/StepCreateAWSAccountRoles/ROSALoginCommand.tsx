import React from 'react';

import { Alert, Skeleton } from '@patternfly/react-core';
import useChrome from '@redhat-cloud-services/frontend-components/useChrome';

import { trackEvents } from '~/common/analytics';
import TokenBox from '~/components/CLILoginPage/TokenBox';
import InstructionCommand from '~/components/common/InstructionCommand';
import { isRestrictedEnv } from '~/restrictedEnv';
import { Error } from '~/types/accounts_mgmt.v1';

type ROSALoginCommandProps = {
  restrictTokens: boolean | undefined;
  error: Error | undefined;
  isLoading: boolean;
  token: string;
  defaultToOfflineTokens: boolean;
};

const ROSALoginCommand = ({
  restrictTokens,
  error,
  isLoading,
  token,
  defaultToOfflineTokens,
}: ROSALoginCommandProps) => {
  const chrome = useChrome();
  const restrictedEnv = isRestrictedEnv();

  const getEnv = () => {
    const env = chrome.getEnvironment();
    if (env === 'int') {
      return ' --env=integration';
    }
    return '';
  };

  const loginCommand = `rosa login${
    restrictedEnv ? ' --govcloud' : ''
  }${getEnv()} --token="${token}"`;

  const ROSALoginWithToken = (
    <TokenBox
      token={token}
      command={loginCommand}
      textAriaLabel="Copyable ROSA login command"
      trackEvent={trackEvents.ROSALogin}
      data-testid="token-box"
    />
  );

  if (restrictedEnv) {
    return ROSALoginWithToken;
  }

  if (isLoading) {
    return <Skeleton fontSize="3xl" data-testid="loading" />;
  }

  if (error && !defaultToOfflineTokens) {
    return (
      <Alert variant="danger" isInline title="Error retrieving user account">
        <p>{error.reason}</p>
        <p>{`Operation ID: ${error.operation_id || 'N/A'}`}</p>
      </Alert>
    );
  }

  return (
    <InstructionCommand className="ocm-c-api-token-limit-width" outerClassName="pf-v6-u-mt-md">
      rosa login --use-auth-code
    </InstructionCommand>
  );
};

export default ROSALoginCommand;
