import React from 'react';

import { Content } from '@patternfly/react-core';

import ExternalLink from '~/components/common/ExternalLink';

import links from '../../../../../common/installLinks.mjs';

const TelemetryDisclaimer = () => (
  <Content component="small">
    Red Hat collects a limited amount of telemetry data. By installing OpenShift Container Platform
    4, you accept our data collection policy.{' '}
    <ExternalLink href={links.TELEMETRY_INFORMATION} noIcon>
      Learn more
    </ExternalLink>{' '}
    about the data we collect.
  </Content>
);

export default TelemetryDisclaimer;
