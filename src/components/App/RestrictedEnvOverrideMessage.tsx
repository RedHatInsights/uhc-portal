import React from 'react';

import { Alert } from '@patternfly/react-core';

import { RESTRICTED_ENV_OVERRIDE_LOCALSTORAGE_KEY } from '~/common/localStorageConstants';
import { Link } from '~/common/routing';

const RestrictedEnvOverrideMessage = () => {
  const goBackToNormal = () => {
    localStorage.removeItem(RESTRICTED_ENV_OVERRIDE_LOCALSTORAGE_KEY);
  };

  return (
    <Alert
      variant="warning"
      isInline
      id="env-override-message"
      title={
        <>
          Simulating a <em>restricted</em> environment
        </>
      }
      className="pf-v6-u-flex-basis-0 pf-v6-u-flex-grow-1"
    >
      <Link to="/" reloadDocument onClick={goBackToNormal}>
        Remove <strong>restricted env</strong> override
      </Link>
    </Alert>
  );
};

export default RestrictedEnvOverrideMessage;
