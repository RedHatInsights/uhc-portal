import React from 'react';
import classNames from 'classnames';

import { Bullseye, Card, CardBody, CardHeader, Gallery, Tooltip } from '@patternfly/react-core';

import { noQuotaTooltip } from '~/common/helpers';
import {
  AWS_DEFAULT_REGION,
  CHANNEL_GROUP_DEFAULT,
  CloudProviderType,
  GCP_DEFAULT_REGION,
} from '~/components/clusters/wizards/common/constants';
import { useFormState } from '~/components/clusters/wizards/hooks';
import { useGetBillingQuotas } from '~/components/clusters/wizards/osd/BillingModel/useGetBillingQuotas';
import { FieldId } from '~/components/clusters/wizards/osd/constants';
import AWSLogo from '~/styles/images/AWSLogo';
import GCPLogo from '~/styles/images/GCPLogo';
import { SubscriptionCommonFieldsCluster_billing_model as SubscriptionCommonFieldsClusterBillingModel } from '~/types/accounts_mgmt.v1';

import './cloudProviderTileField.scss';

export const CloudProviderTileField = () => {
  const {
    values: {
      [FieldId.CloudProvider]: cloudProvider,
      [FieldId.Product]: product,
      [FieldId.BillingModel]: billingModel,
      [FieldId.Byoc]: isBYOC,
    },
    setFieldValue,
  } = useFormState();
  const quotas = useGetBillingQuotas({
    product,
    billingModel,
    isBYOC,
  });
  const hasGcpResources = quotas.gcpResources;
  const shouldShowAwsTile = !(
    billingModel === SubscriptionCommonFieldsClusterBillingModel.marketplace_gcp
  );
  const hasAwsResources = shouldShowAwsTile ? quotas.awsResources : false;
  const notAvailableTooltip =
    billingModel === shouldShowAwsTile
      ? noQuotaTooltip
      : 'OpenShift Dedicated purchased through the Google Cloud marketplace can only be provisioned on Google Cloud.';

  const handleChange = (value: string) => {
    // Silently reset some user choices that are now meaningless.
    setFieldValue(
      FieldId.Region,
      value === CloudProviderType.Aws ? AWS_DEFAULT_REGION : GCP_DEFAULT_REGION,
    );

    // Allow MachineTypeSelection to pick a new default.
    setFieldValue(FieldId.MachineType, '');
    setFieldValue(FieldId.AcknowledgePrereq, false);
    setFieldValue(FieldId.FipsCryptography, false);
    setFieldValue(FieldId.CloudProvider, value);
    setFieldValue(FieldId.ChannelGroup, CHANNEL_GROUP_DEFAULT);
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === ' ' || event.key === 'Enter') {
      event.preventDefault();
      handleChange(event.currentTarget.id);
    }
  };

  const gcpTile = (
    <Card
      id={CloudProviderType.Gcp}
      className={classNames('ocm-tile-create-cluster', !hasGcpResources && 'tile-disabled')}
      isDisabled={!hasGcpResources}
      data-testid="gcp-provider-card"
      isLarge
      isSelected={cloudProvider === CloudProviderType.Gcp}
      isSelectable
      onKeyDown={handleKeyDown}
    >
      <CardHeader
        selectableActions={{
          selectableActionAriaLabelledby: CloudProviderType.Gcp,
          name: 'gcp-tile',
          variant: 'single',
          onChange: () => hasGcpResources && handleChange(CloudProviderType.Gcp),
          isHidden: true,
        }}
      >
        <Bullseye>
          <GCPLogo />
        </Bullseye>
      </CardHeader>
      <CardBody>
        <Bullseye>Run on Google Cloud</Bullseye>
      </CardBody>
    </Card>
  );

  const awsTile = (
    <Card
      id={CloudProviderType.Aws}
      className={classNames('ocm-tile-create-cluster', !hasAwsResources && 'tile-disabled')}
      isDisabled={!hasAwsResources}
      data-testid="aws-provider-card"
      isLarge
      isSelected={cloudProvider === CloudProviderType.Aws}
      isSelectable
      onKeyDown={handleKeyDown}
    >
      <CardHeader
        selectableActions={{
          selectableActionAriaLabelledby: CloudProviderType.Aws,
          name: 'aws-tile',
          variant: 'single',
          onChange: () => hasAwsResources && handleChange(CloudProviderType.Aws),
          isHidden: true,
        }}
      >
        <Bullseye>
          <AWSLogo />
        </Bullseye>
      </CardHeader>
      <CardBody>Run on Amazon Web Services</CardBody>
    </Card>
  );

  return (
    <Gallery
      hasGutter
      aria-label="Providers options"
      className="ocm-fix-selectable-card-border"
      minWidths={{
        default: '293px',
      }}
      maxWidths={{
        default: '293px',
      }}
    >
      {hasGcpResources ? gcpTile : <Tooltip content={noQuotaTooltip}>{gcpTile}</Tooltip>}
      {shouldShowAwsTile &&
        (hasAwsResources ? awsTile : <Tooltip content={notAvailableTooltip}>{awsTile}</Tooltip>)}
    </Gallery>
  );
};
