import React from 'react';

import { Level } from '@patternfly/react-core';

type Props = {
  children: React.ReactNode;
  compact?: boolean;
};

const ReleaseChannelDescription = ({ children, compact }: Props) => (
  <dd
    className="pf-v6-c-description-list__description ocm-l-ocp-releases__channel-detail"
    style={{ marginBottom: compact ? 0 : undefined }}
  >
    <Level className="ocm-l-ocp-releases__channel-detail-level">{children}</Level>
  </dd>
);

export default ReleaseChannelDescription;
