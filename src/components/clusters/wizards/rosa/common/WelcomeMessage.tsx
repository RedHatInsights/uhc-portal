import React from 'react';

import { Content, ContentVariants } from '@patternfly/react-core';

export const WelcomeMessage: React.FC = () => (
  <Content>
    <Content component={ContentVariants.h2}>
      Welcome to Red Hat OpenShift Service on AWS (ROSA)
    </Content>
    <Content component={ContentVariants.p}>
      Create a managed OpenShift cluster on an existing Amazon Web Services (AWS) account.
    </Content>
  </Content>
);
