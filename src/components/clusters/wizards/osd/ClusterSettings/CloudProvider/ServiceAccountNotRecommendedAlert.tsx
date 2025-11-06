import React from 'react';

import { Alert } from '@patternfly/react-core';

export const ServiceAccountNotRecommendedAlert = () => (
  <Alert
    variant="info"
    title="Red Hat recommends using WIF as the authentication type because it provides enhanced security through the use of short-lived credentials, whereas Service Account authentication uses long-lived credentials which are less secure."
    isInline
  />
);
