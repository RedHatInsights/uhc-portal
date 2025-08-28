import React from 'react';

import { Skeleton } from '@patternfly/react-core';
import { ScalprumComponent } from '@scalprum/react-core';

const AIRootApp = () => (
  <ScalprumComponent
    scope="assistedInstallerApp"
    module="./RootApp"
    fallback={<Skeleton fontSize="sm" width="5em" />}
  />
);

export default AIRootApp;
