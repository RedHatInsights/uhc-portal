import React from 'react';

import { Alert } from '@patternfly/react-core';

import { ENV_OVERRIDE_LOCALSTORAGE_KEY } from '~/common/localStorageConstants';
import { Link } from '~/common/routing';
import { APP_API_ENV } from '~/config';

type Props = {
  env: string;
};

const EnvOverrideMessage = ({ env }: Props) => {
  const goBackToNormal = () => {
    localStorage.removeItem(ENV_OVERRIDE_LOCALSTORAGE_KEY);
  };

  return (
    <Alert
      variant="warning"
      isInline
      id="env-override-message"
      title={
        <>
          Using the <em>{env}</em> environment API
        </>
      }
      className="pf-v6-u-flex-basis-0 pf-v6-u-flex-grow-1"
    >
      <Link to="/" reloadDocument onClick={goBackToNormal}>
        Go back to <strong>{APP_API_ENV}</strong>
      </Link>
    </Alert>
  );
};

export default EnvOverrideMessage;
