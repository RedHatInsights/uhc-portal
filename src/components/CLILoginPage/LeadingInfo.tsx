import React from 'react';

import { Content, Title } from '@patternfly/react-core';

const LeadingInfo = ({ isRosa, SSOLogin }: { isRosa: boolean; SSOLogin: boolean }) => (
  <>
    <Content component="p">
      {`Red Hat Single Sign-On centralizes and simplifies login for the OpenShift Cluster Manager ${isRosa ? 'ROSA' : ''} CLI, letting you sign in once and securely access the service without maintaining separate credentials.`}
    </Content>
    {!SSOLogin && (
      <>
        <Title headingLevel="h3">Your API token</Title>
        <Content component="p">
          Use this API token to authenticate against your Red Hat OpenShift Cluster Manager account.
        </Content>
      </>
    )}
  </>
);

export default LeadingInfo;
