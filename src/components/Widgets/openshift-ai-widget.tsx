import React from 'react';

import docLinks from '~/common/docLinks.mjs';

import { SimpleServiceWidget } from './simple-service-widget';

const OpenShiftAiWidget: React.FunctionComponent = () => (
  <SimpleServiceWidget
    body="Create, train, and serve artificial intelligence and machine learning (AI/ML) models."
    linkTitle="OpenShift AI"
    url={docLinks.RH_OPENSHIFT_AI_TRIAL}
    isExternal
  />
);

export default OpenShiftAiWidget;
