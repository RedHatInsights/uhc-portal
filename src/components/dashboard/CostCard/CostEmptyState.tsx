import React from 'react';

import {
  EmptyState,
  EmptyStateActions,
  EmptyStateBody,
  EmptyStateFooter,
  EmptyStateVariant,
} from '@patternfly/react-core';

import links from '../../../common/installLinks.mjs';
import ExternalLink from '../../common/ExternalLink';

import CostIcon from './CostIcon';

const CostEmptyState = () => (
  <EmptyState
    headingLevel="h2"
    icon={CostIcon}
    titleText="Track your OpenShift spending!"
    variant={EmptyStateVariant.lg}
    className="pf-m-redhat-font"
  >
    <EmptyStateBody>
      Add an OpenShift Container Platform cluster to see a total cost breakdown of your pods by
      cluster, node, project, or labels.
    </EmptyStateBody>
    <EmptyStateFooter>
      <EmptyStateActions>
        <ExternalLink href={links.COSTMGMT_ADDING_OCP}>
          Add an OpenShift cluster to Cost Management
        </ExternalLink>
      </EmptyStateActions>
    </EmptyStateFooter>
  </EmptyState>
);

export default CostEmptyState;
