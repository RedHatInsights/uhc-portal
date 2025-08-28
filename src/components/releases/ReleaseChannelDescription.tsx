import React from 'react';

import { Level } from '@patternfly/react-core';

type Props = { children: React.ReactNode };

const ReleaseChannelDescription = ({ children }: Props) => (
  <dd className="pf-v6-c-description-list__description ocm-l-ocp-releases__channel-detail">
    <Level className="ocm-l-ocp-releases__channel-detail-level">{children}</Level>
  </dd>
);

export default ReleaseChannelDescription;
