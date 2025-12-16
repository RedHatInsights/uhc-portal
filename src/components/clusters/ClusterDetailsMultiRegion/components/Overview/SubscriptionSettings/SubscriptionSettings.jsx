import React from 'react';
import get from 'lodash/get';
import PropTypes from 'prop-types';
import { useDispatch } from 'react-redux';

import {
  Alert,
  Button,
  Card,
  CardBody,
  CardTitle,
  DescriptionList,
  DescriptionListDescription,
  DescriptionListGroup,
  DescriptionListTerm,
  Grid,
  GridItem,
  Skeleton,
  Title,
} from '@patternfly/react-core';
import { ExclamationCircleIcon } from '@patternfly/react-icons/dist/esm/icons/exclamation-circle-icon';
import { ExclamationTriangleIcon } from '@patternfly/react-icons/dist/esm/icons/exclamation-triangle-icon';

import installLinks from '~/common/installLinks.mjs';
import { normalizedProducts, subscriptionSettings } from '~/common/subscriptionTypes';
import ExternalLink from '~/components/common/ExternalLink';
import { modalActions } from '~/components/common/Modal/ModalActions';
import modals from '~/components/common/Modal/modals';
import {
  SubscriptionCommonFieldsCluster_billing_model as SubscriptionCommonFieldsClusterBillingModel,
  SubscriptionCommonFieldsService_level as SubscriptionCommonFieldsServiceLevel,
  SubscriptionCommonFieldsStatus,
  SubscriptionCommonFieldsSupport_level as SubscriptionCommonFieldsSupportLevel,
  SubscriptionCommonFieldsSystem_units as SubscriptionCommonFieldsSystemUnits,
} from '~/types/accounts_mgmt.v1';

function SubscriptionSettings({
  subscription,
  canEdit = false,
  canSubscribeOCP = false,
  isLoading,
}) {
  const dispatch = useDispatch();
  const product = get(subscription, 'plan.type');
  if (product !== normalizedProducts.OCP) {
    return null;
  }

  const handleEditSettings = () => {
    dispatch(modalActions.openModal(modals.EDIT_SUBSCRIPTION_SETTINGS, { subscription }));
  };

  const status = get(subscription, 'status');
  const isEditViewable =
    canEdit &&
    status !== SubscriptionCommonFieldsStatus.Archived &&
    status !== SubscriptionCommonFieldsStatus.Deprovisioned;

  // SUPPORT_LEVEL
  const supportLevel = get(subscription, subscriptionSettings.SUPPORT_LEVEL, 'Not set');
  let supportLevelStr = supportLevel;
  let titleIcon = null;
  if (supportLevel === SubscriptionCommonFieldsSupportLevel.Eval) {
    supportLevelStr = 'Self-Support 60-day evaluation';
    if (isEditViewable) {
      titleIcon = <ExclamationTriangleIcon className="subscription-settings warning-title-icon" />;
    }
  } else if (supportLevel === SubscriptionCommonFieldsSupportLevel.None) {
    supportLevelStr = 'Evaluation expired';
    if (isEditViewable) {
      titleIcon = <ExclamationCircleIcon className="subscription-settings danger-title-icon" />;
    }
  }

  // the rest
  const billingModel = get(subscription, subscriptionSettings.CLUSTER_BILLING_MODEL);
  let billingModelStr = 'Not set';
  if (billingModel === SubscriptionCommonFieldsClusterBillingModel.standard) {
    billingModelStr = 'Annual: Fixed capacity subscription from Red Hat';
  } else if (billingModel === SubscriptionCommonFieldsClusterBillingModel.marketplace) {
    billingModelStr = 'On-Demand (Hourly)';
  }
  const usageStr = get(subscription, subscriptionSettings.USAGE, 'Not set');
  const serviceLevel = get(subscription, subscriptionSettings.SERVICE_LEVEL);
  let serviceLevelStr = 'Not set';
  if (serviceLevel === SubscriptionCommonFieldsServiceLevel.L1_L3) {
    serviceLevelStr = 'Red Hat support (L1-L3)';
  } else if (serviceLevel === SubscriptionCommonFieldsServiceLevel.L3_only) {
    serviceLevelStr = 'Partner support (L3)';
  }
  const cpuTotal = get(subscription, subscriptionSettings.CPU_TOTAL, undefined);
  const cpuTotalStr = `${cpuTotal} core${cpuTotal === 1 ? '' : 's'}`;
  const socketTotal = get(subscription, subscriptionSettings.SOCKET_TOTAL, undefined);
  const socketTotalStr = `${socketTotal} socket${socketTotal === 1 ? '' : 's'}`;
  let systemUnits = get(subscription, subscriptionSettings.SYSTEM_UNITS, undefined);
  if (systemUnits === undefined) {
    if (cpuTotal !== undefined) {
      systemUnits = SubscriptionCommonFieldsSystemUnits.Cores_vCPU;
    } else if (socketTotal !== undefined) {
      systemUnits = SubscriptionCommonFieldsSystemUnits.Sockets;
    } else {
      systemUnits = 'Not set';
    }
  }
  let systemUnitsStr = 'Not set';
  if (systemUnits === SubscriptionCommonFieldsSystemUnits.Sockets && socketTotal !== undefined) {
    systemUnitsStr = 'Sockets';
  } else if (
    systemUnits === SubscriptionCommonFieldsSystemUnits.Cores_vCPU &&
    cpuTotal !== undefined
  ) {
    systemUnitsStr = 'Cores or vCPUs';
  }
  const displayObligation = cpuTotal !== undefined || socketTotal !== undefined;
  const obligationLabel =
    systemUnits === SubscriptionCommonFieldsSystemUnits.Sockets
      ? 'Number of compute sockets'
      : 'Number of compute cores';
  const obligationStr =
    systemUnits === SubscriptionCommonFieldsSystemUnits.Sockets ? socketTotalStr : cpuTotalStr;

  return (
    <Card className="ocm-c-overview-subscription-settings__card">
      <CardTitle className="ocm-c-overview-subscription-settings__card--header">
        <Title headingLevel="h2" className="card-title">
          Subscription settings
          {titleIcon}
        </Title>
      </CardTitle>
      {!canSubscribeOCP && (
        <CardBody>
          <Alert
            id="subscription-settings-contact-sales-alert"
            variant="info"
            isInline
            title="Your organization doesn't have an active subscription. Purchase an OpenShift subscription by contacting sales."
          >
            <ExternalLink href={installLinks.RH_CONTACT}>Contact sales</ExternalLink>
          </Alert>
        </CardBody>
      )}
      <CardBody className="ocm-c-overview-subscription-settings__card--body">
        {isLoading ? (
          <Skeleton screenreaderText="Loading..." />
        ) : (
          <Grid>
            <GridItem md={6}>
              <DescriptionList>
                <DescriptionListGroup>
                  <DescriptionListTerm>Subscription type</DescriptionListTerm>
                  <DescriptionListDescription data-testid="subscription-type">
                    {billingModelStr}
                  </DescriptionListDescription>
                </DescriptionListGroup>
                <DescriptionListGroup>
                  <DescriptionListTerm>Service level agreement (SLA)</DescriptionListTerm>
                  <DescriptionListDescription data-testid="service-level-agreement">
                    {supportLevelStr}
                  </DescriptionListDescription>
                </DescriptionListGroup>
                <DescriptionListGroup>
                  <DescriptionListTerm>Support type</DescriptionListTerm>
                  <DescriptionListDescription data-testid="support-type">
                    {serviceLevelStr}
                  </DescriptionListDescription>
                  {isEditViewable && (
                    <DescriptionListDescription class="pf-v6-u-mt-lg">
                      <Button
                        variant="link"
                        isDisabled={!canSubscribeOCP}
                        isInline
                        onClick={handleEditSettings}
                      >
                        Edit subscription settings
                      </Button>
                    </DescriptionListDescription>
                  )}
                </DescriptionListGroup>
              </DescriptionList>
            </GridItem>
            <GridItem md={6}>
              <DescriptionList>
                <DescriptionListGroup>
                  <DescriptionListTerm>Cluster usage</DescriptionListTerm>
                  <DescriptionListDescription data-testid="cluster-usage">
                    {usageStr}
                  </DescriptionListDescription>
                </DescriptionListGroup>
                <DescriptionListGroup>
                  <DescriptionListTerm>Subscription units</DescriptionListTerm>
                  <DescriptionListDescription data-testid="subscription-units">
                    {systemUnitsStr}
                  </DescriptionListDescription>
                </DescriptionListGroup>
                {displayObligation && (
                  <DescriptionListGroup>
                    <DescriptionListTerm>{obligationLabel}</DescriptionListTerm>
                    <DescriptionListDescription data-testid="cores-or-sockets">
                      {obligationStr}
                    </DescriptionListDescription>
                  </DescriptionListGroup>
                )}
              </DescriptionList>
            </GridItem>
          </Grid>
        )}
      </CardBody>
    </Card>
  );
}

SubscriptionSettings.propTypes = {
  subscription: PropTypes.object,
  canEdit: PropTypes.bool,
  canSubscribeOCP: PropTypes.bool,
  isLoading: PropTypes.bool,
};

export default SubscriptionSettings;
