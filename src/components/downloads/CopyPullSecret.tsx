import React, { useCallback, useState } from 'react';
import isEmpty from 'lodash/isEmpty';
import CopyToClipboard from 'react-copy-to-clipboard';

import { Button, Tooltip } from '@patternfly/react-core';
import { CopyIcon } from '@patternfly/react-icons/dist/esm/icons/copy-icon';

import { tools } from '~/common/installLinks.mjs';
import withAnalytics, { WithAnalyticsProps } from '~/hoc/withAnalytics';
import { AccessTokenCfg } from '~/types/accounts_mgmt.v1';
import { ErrorState } from '~/types/types';

type CopyPullSecretProps = WithAnalyticsProps & {
  token: AccessTokenCfg | ErrorState;
  text?: string;
  variant: 'link-tooltip' | 'link-inplace';
  pendoID?: string;
  track: (event: string, properties?: Record<string, any> | string) => void;
};

const CopyPullSecret = ({
  token,
  text = 'Copy pull secret',
  variant,
  pendoID,
  track,
}: CopyPullSecretProps) => {
  const [timer, setTimer] = useState<number | null>(null);
  const [clicked, setClicked] = useState(false);

  const onCopy = useCallback(() => {
    if (timer) {
      window.clearTimeout(timer);
    }
    setClicked(true);

    setTimer(
      window.setTimeout(() => {
        setClicked(false);
        setTimer(null);
      }, 2500),
    );
  }, [timer]);

  const isDisabled = !token || !!(token as ErrorState).error || isEmpty(token);
  const tokenView = (token as ErrorState).error ? '' : `${JSON.stringify(token)}\n`;

  const linkText = variant === 'link-inplace' && clicked ? 'Copied!' : text;

  const button = (
    <CopyToClipboard text={isDisabled ? '' : tokenView} onCopy={onCopy}>
      <Button
        data-testid="copy-pull-secret-button"
        variant="link"
        type="button"
        tabIndex={0}
        isAriaDisabled={isDisabled}
        icon={<CopyIcon />}
        onClick={() => {
          track(tools.COPY_PULLREQUEST, { path: pendoID });
        }}
      >
        {linkText}
      </Button>
    </CopyToClipboard>
  );

  return variant === 'link-inplace' ? (
    button
  ) : (
    <Tooltip trigger="manual" content="Copied!" position="right" isVisible={clicked}>
      {button}
    </Tooltip>
  );
};

export default withAnalytics(CopyPullSecret);
