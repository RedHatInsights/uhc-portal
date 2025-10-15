import React from 'react';
import PropTypes from 'prop-types';

import { Alert } from '@patternfly/react-core';
import * as Sentry from '@sentry/browser';

import supportLinks from '~/common/supportLinks.mjs';
import ExternalLink from '~/components/common/ExternalLink';

import { BANNED_USER_CODE } from '../../../../../common/errors';

const TokenErrorAlert = ({ token }) => {
  React.useEffect(() => {
    const errorMessage = token.errorMessage || '';
    const code = token.internalErrorCode || '';
    if (code !== BANNED_USER_CODE) {
      Sentry.captureException(new Error(`Failed to fetch OCP token: ${errorMessage}`));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const code = token.internalErrorCode || '';
  const errorMessage = token.errorMessage || '';
  const message =
    code === BANNED_USER_CODE ? (
      errorMessage
    ) : (
      <>
        {errorMessage}
        <br />
        <br />
        Try again by refreshing the page. If the problem persists{' '}
        <ExternalLink href={supportLinks.SUPPORT_HOME}>contact our customer support</ExternalLink>.
      </>
    );

  return (
    <Alert
      variant="danger"
      isInline
      className="token-error-alert"
      title="Failed to obtain pull secret"
    >
      {message}
    </Alert>
  );
};

TokenErrorAlert.propTypes = {
  token: PropTypes.object.isRequired,
};

export default TokenErrorAlert;
