import React from 'react';

import { EmptyState, EmptyStateBody } from '@patternfly/react-core';
import { SearchIcon } from '@patternfly/react-icons/dist/esm/icons/search-icon';

import links from '../../../common/installLinks.mjs';
import ExternalLink from '../../common/ExternalLink';

const AdvisorEmptyState = () => (
  <EmptyState
    headingLevel="h4"
    icon={SearchIcon}
    titleText="No Advisor recommendations"
    isFullHeight
    className="ocm-insights--advisor-empty-state"
  >
    <EmptyStateBody>
      This feature uses the Remote Health functionality of OpenShift Container Platform. For further
      details about Insights, see the{' '}
      <ExternalLink href={links.REMOTE_HEALTH_INSIGHTS}>OpenShift documentation</ExternalLink>.
    </EmptyStateBody>
  </EmptyState>
);

export default AdvisorEmptyState;
