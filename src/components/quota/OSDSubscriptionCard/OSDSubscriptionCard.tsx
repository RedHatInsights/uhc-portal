import React from 'react';
import get from 'lodash/get';
import startCase from 'lodash/startCase';

import { Card, CardBody, CardTitle, Stack, StackItem } from '@patternfly/react-core';
import { ExclamationTriangleIcon } from '@patternfly/react-icons/dist/esm/icons/exclamation-triangle-icon';
import { OutlinedCircleIcon } from '@patternfly/react-icons/dist/esm/icons/outlined-circle-icon';
import { ResourcesAlmostEmptyIcon } from '@patternfly/react-icons/dist/esm/icons/resources-almost-empty-icon';
import { ResourcesAlmostFullIcon } from '@patternfly/react-icons/dist/esm/icons/resources-almost-full-icon';
import { ResourcesFullIcon } from '@patternfly/react-icons/dist/esm/icons/resources-full-icon';

import { Link } from '~/common/routing';
import type { GlobalState } from '~/redux/state';
import {
  QuotaCost,
  RelatedResource,
  RelatedResourceBilling_model as RelatedResourceBillingModel,
} from '~/types/accounts_mgmt.v1';

import ExternalLink from '../../common/ExternalLink';
import SubscriptionNotFulfilled from '../SubscriptionNotFulfilled';

import OSDSubscriptionTable from './OSDSubscriptionTable';

type Props = {
  organizationID: string;
  fetchQuotaCost: (organizationID: string) => void;
  quotaCost: GlobalState['subscriptions']['quotaCost'];
  marketplace?: boolean;
};

const getCapacityIcon = (used: number, max: number) => {
  let icon = <ResourcesAlmostEmptyIcon />;
  if (used > max) {
    icon = <ExclamationTriangleIcon className="warn-icon" />;
  } else if (used === max) {
    icon = <ResourcesFullIcon />;
  } else if (used >= max / 2) {
    icon = <ResourcesAlmostFullIcon />;
  } else if (used === 0) {
    icon = <OutlinedCircleIcon />;
  }
  return icon;
};

const getZoneType = (zoneType: string) => {
  if (zoneType === 'multi') {
    return 'multi-zone';
  }
  if (zoneType === 'single') {
    return 'single zone';
  }
  return 'N/A';
};

const getPlanType = (byoc: string) => {
  if (byoc === 'rhinfra') {
    return 'Standard';
  }
  if (byoc === 'byoc') {
    return 'CCS';
  }
  if (byoc === 'any') {
    return 'Any';
  }
  return 'N/A';
};

const OSDSubscriptionCard = ({ quotaCost, marketplace, organizationID, fetchQuotaCost }: Props) => {
  // quota resource limits displays on demand marketplace quota
  const refresh = React.useCallback(() => {
    fetchQuotaCost(organizationID);
  }, [organizationID, fetchQuotaCost]);

  React.useEffect(() => {
    refresh();
    // run once on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  let content: React.ReactNode;
  const rows: React.ReactNode[][] = [];

  let subscriptionLink = <Link to="/subscriptions/usage/openshift">OpenShift Usage</Link>;
  let subscriptionSubtitle = 'Annual Subscriptions';
  let subscriptionsDescription =
    'The summary of all annual subscriptions for OpenShift Dedicated and select add-ons purchased by your organization or granted by Red Hat. For subscription information on OpenShift Container Platform or Red Hat OpenShift Service on AWS (ROSA), see';

  if (marketplace) {
    // add link
    subscriptionLink = (
      <ExternalLink href="/openshift/subscriptions/openshift-dedicated" noIcon>
        Dedicated (On-Demand)
      </ExternalLink>
    );
    subscriptionSubtitle = 'OpenShift Dedicated';

    subscriptionsDescription =
      'Active subscriptions allow your organization to use up to a certain number of OpenShift Dedicated clusters. Overall OSD subscription capacity and usage can be viewed in';
  }

  if (quotaCost.fulfilled) {
    quotaCost.items?.forEach((quotaItem: QuotaCost) => {
      // filter out quota you neither have nor consume
      if (quotaItem.consumed === 0 && quotaItem.allowed === 0) {
        return;
      }

      // filter out zero cost related resources
      const relatedResources = get(quotaItem, 'related_resources', []).filter(
        (resource: RelatedResource) => resource.cost !== 0,
      );
      if (relatedResources.length === 0) {
        return;
      }

      // For summit
      // filter out non-marketplace quota when on the marketplace subscriptions page
      // and explicitly allow addon-open-data-hub on the marketplace quota page
      const billingModel = get(relatedResources[0], 'billing_model');
      let resourceName = get(relatedResources[0], 'resource_name');
      if (marketplace && billingModel !== RelatedResourceBillingModel.marketplace) {
        if (resourceName !== 'addon-open-data-hub') {
          return;
        }
      }
      if (
        !marketplace &&
        (billingModel === RelatedResourceBillingModel.marketplace ||
          resourceName === 'addon-open-data-hub')
      ) {
        return;
      }

      // CCS compute.node resource name should show as vCPU
      if (
        get(relatedResources[0], 'resource_type') === 'compute.node' &&
        get(relatedResources[0], 'byoc') === 'byoc'
      ) {
        resourceName = 'vCPU';
      }

      rows.push([
        get(relatedResources[0], 'resource_type'),
        resourceName,
        getZoneType(get(relatedResources[0], 'availability_zone_type')),
        getPlanType(get(relatedResources[0], 'byoc')),
        startCase(get(relatedResources[0], 'product')),
        `${quotaItem.consumed} of ${quotaItem.allowed}`,
        getCapacityIcon(quotaItem.consumed, quotaItem.allowed),
      ]);
    });
  }

  // all rows may be filtered out if a user doesn't have any quota
  if (rows.length > 0) {
    content = (
      <>
        <StackItem className="content-header">Quota</StackItem>
        <StackItem className="table-container">
          <OSDSubscriptionTable rows={rows} />
        </StackItem>
      </>
    );
  } else {
    content = (
      <SubscriptionNotFulfilled
        data={{
          error: quotaCost.error,
          pending: quotaCost.pending,
          type: 'osd',
          empty: true,
        }}
        refresh={refresh}
        marketplace={marketplace}
      />
    );
  }

  return (
    <Card>
      <CardTitle>{subscriptionSubtitle}</CardTitle>
      <CardBody>
        <Stack hasGutter>
          <StackItem>
            {subscriptionsDescription} {subscriptionLink}
          </StackItem>
          {content}
        </Stack>
      </CardBody>
    </Card>
  );
};

export default OSDSubscriptionCard;
