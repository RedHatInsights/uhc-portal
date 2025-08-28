import React from 'react';

import { Bullseye, Spinner } from '@patternfly/react-core';

const ExternalRedirect = ({ url }: { url: string }) => {
  React.useEffect(
    () => {
      window.location.replace(url);
    },
    // Only run on initial mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  return (
    <Bullseye>
      <div className="pf-v6-u-text-align-center">
        <Spinner size="lg" aria-label="Loading..." />
      </div>
    </Bullseye>
  );
};

export default ExternalRedirect;
