import React from 'react';
import PropTypes from 'prop-types';

import { Card, CardBody, Content, Stack, StackItem, Title } from '@patternfly/react-core';

import PullSecretSection from './components/PullSecretSection';
import TelemetryDisclaimer from './components/TelemetryDisclaimer';
import TokenErrorAlert from './components/TokenErrorAlert';

function InstructionsPullSecret({ token }) {
  return (
    <Card>
      <CardBody>
        <div className="pf-v6-c-content ocm-page">
          <Title headingLevel="h3" size="2xl">
            Pull secret
          </Title>
          <Stack hasGutter>
            <StackItem key="pull-secret">
              {token.error && <TokenErrorAlert token={token} />}
              <Content>
                <PullSecretSection token={token} />
              </Content>
            </StackItem>
            <StackItem>
              <TelemetryDisclaimer />
            </StackItem>
          </Stack>
        </div>
      </CardBody>
    </Card>
  );
}

InstructionsPullSecret.propTypes = {
  token: PropTypes.object.isRequired,
};

export default InstructionsPullSecret;
