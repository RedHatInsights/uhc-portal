import React from 'react';

import {
  Alert,
  Button,
  Flex,
  FlexItem,
  FormAlert,
  FormGroup,
  Popover,
  Title,
  ToggleGroup,
  ToggleGroupItem,
  ToggleGroupItemProps,
} from '@patternfly/react-core';
import { HelpIcon } from '@patternfly/react-icons/dist/esm/icons/help-icon';
import styles from '@patternfly/react-styles/css/components/Form/form';

import links from '~/common/installLinks.mjs';
import { Prerequisites } from '~/components/clusters/wizards/common/Prerequisites/Prerequisites';
import { useFormState } from '~/components/clusters/wizards/hooks';
import { PrepareGCPHint } from '~/components/clusters/wizards/osd/ClusterSettings/CloudProvider/GcpByocFields/PrepareGCPHint';
import { ServiceAccount } from '~/components/clusters/wizards/osd/ClusterSettings/CloudProvider/GcpByocFields/ServiceAccountAuth/ServiceAccount';
import { ServiceAccountPrerequisites } from '~/components/clusters/wizards/osd/ClusterSettings/CloudProvider/GcpByocFields/ServiceAccountAuth/ServiceAccountPrerequisites';
import {
  WorkloadIdentityFederation,
  WorkloadIdentityFederationProps,
} from '~/components/clusters/wizards/osd/ClusterSettings/CloudProvider/GcpByocFields/WorkloadIdentityFederation/WorkloadIdentityFederation';
import { WorkloadIdentityFederationPrerequisites } from '~/components/clusters/wizards/osd/ClusterSettings/CloudProvider/GcpByocFields/WorkloadIdentityFederation/WorkloadIdentityFederationPrerequisites';
import { GCPAuthType } from '~/components/clusters/wizards/osd/ClusterSettings/CloudProvider/types';
import { FieldId } from '~/components/clusters/wizards/osd/constants';
import { useIsOSDFromGoogleCloud } from '~/components/clusters/wizards/osd/useIsOSDFromGoogleCloud';
import {
  GCP_WIF_DEFAULT,
  OSD_FOR_GOOGLE_CLOUD,
  OSD_GCP_WIF,
} from '~/queries/featureGates/featureConstants';
import { useFeatureGate } from '~/queries/featureGates/useFetchFeatureGate';
import { SubscriptionCommonFieldsCluster_billing_model as SubscriptionCommonFieldsClusterBillingModel } from '~/types/accounts_mgmt.v1';

import { ServiceAccountNotRecommendedAlert } from '../ServiceAccountNotRecommendedAlert';

export interface GcpByocFieldsProps extends WorkloadIdentityFederationProps {}

export const GcpByocFields = (props: GcpByocFieldsProps) => {
  const { getWifConfigsService } = props;
  const {
    values: { [FieldId.BillingModel]: billingModel },
  } = useFormState();

  const isWifEnabled = useFeatureGate(OSD_GCP_WIF);
  const isWifDefaultEnabled = useFeatureGate(GCP_WIF_DEFAULT);
  const isOsdGcpFeatureFlagEnabled = useFeatureGate(OSD_FOR_GOOGLE_CLOUD);
  const isOSDFromGoogleCloud = useIsOSDFromGoogleCloud();

  const {
    setFieldValue,
    values: { [FieldId.GcpAuthType]: authTypeFormValue },
  } = useFormState();

  const authType = isWifEnabled ? authTypeFormValue : GCPAuthType.ServiceAccounts;

  let gcpTitle = 'Have you prepared your Google account?';
  let gcpText = `To prepare your account, accept the Google Cloud Terms and Agreements. If you've already accepted the terms, you can continue to complete OSD prerequisites.`;
  let linkHref = links.GCP_CONSOLE_OSD_HOME;
  let linkText = 'Review Google terms and agreements';
  if (isOsdGcpFeatureFlagEnabled && authType === GCPAuthType.WorkloadIdentityFederation) {
    gcpTitle = 'Did you complete your prerequisites?';
    gcpText = `To create a Red Hat OpenShift Dedicated (OSD) cluster via the web interface, you must complete the prerequisites steps on the OSD Get Started page in Google Cloud.`;
    linkHref = links.GCP_CONSOLE_OSD_HOME; // TODO: add the correct link
    linkText = 'Google Cloud OSD Get Started page';
  }

  const handleAuthChange: ToggleGroupItemProps['onChange'] = (event) => {
    const { id } = event.currentTarget;

    const selection =
      id === GCPAuthType.WorkloadIdentityFederation
        ? GCPAuthType.WorkloadIdentityFederation
        : GCPAuthType.ServiceAccounts;

    setFieldValue(FieldId.GcpAuthType, selection);
    // when auth type changes, prerequisites change too, so resetting the acknowledgment state
    setFieldValue(FieldId.AcknowledgePrereq, false);
  };

  const authButtons = (
    <ToggleGroup aria-label="Authentication type">
      {isWifDefaultEnabled || isOSDFromGoogleCloud ? (
        <>
          <ToggleGroupItem
            text="Workload Identity Federation"
            key={0}
            buttonId={GCPAuthType.WorkloadIdentityFederation}
            isSelected={authType === GCPAuthType.WorkloadIdentityFederation}
            onChange={handleAuthChange}
          />
          <ToggleGroupItem
            text="Service Account"
            key={1}
            buttonId={GCPAuthType.ServiceAccounts}
            isSelected={authType === GCPAuthType.ServiceAccounts}
            onChange={handleAuthChange}
          />
        </>
      ) : (
        <>
          <ToggleGroupItem
            text="Service Account"
            key={0}
            buttonId={GCPAuthType.ServiceAccounts}
            isSelected={authType === GCPAuthType.ServiceAccounts}
            onChange={handleAuthChange}
          />
          <ToggleGroupItem
            text="Workload Identity Federation"
            key={1}
            buttonId={GCPAuthType.WorkloadIdentityFederation}
            isSelected={authType === GCPAuthType.WorkloadIdentityFederation}
            onChange={handleAuthChange}
          />
        </>
      )}
    </ToggleGroup>
  );
  const shouldShowPrepareGCPHint =
    (billingModel === SubscriptionCommonFieldsClusterBillingModel.marketplace_gcp &&
      !isOSDFromGoogleCloud) ||
    (isOSDFromGoogleCloud && authType === GCPAuthType.ServiceAccounts);
  return (
    <>
      {billingModel !== SubscriptionCommonFieldsClusterBillingModel.marketplace_gcp && (
        <FormAlert>
          <Alert variant="info" isInline isPlain title="Customer cloud subscription">
            Provision your cluster in a Google Cloud account owned by you or your company to
            leverage your existing relationship and pay Google Cloud directly for public cloud
            costs.
          </Alert>
        </FormAlert>
      )}

      <Flex direction={{ default: 'column' }} spaceItems={{ default: 'spaceItemsLg' }}>
        {isWifEnabled && (
          <FlexItem>
            <Title headingLevel="h3" className="pf-v6-u-mb-sm">
              Google Cloud account details
            </Title>
            <FormGroup
              label="Authentication type"
              labelHelp={
                <Popover
                  bodyContent={
                    <div>
                      <div>
                        Workload Identity Federation (WIF) uses short-lived credentials which are
                        more secure. Use of WIF requires an OSD cluster running OpenShift{' '}
                        <span className="pf-v6-u-font-family-monospace">4.17</span> or later.
                      </div>
                      <br />
                      <div>Service Account uses long-lived credentials, which are less secure.</div>
                    </div>
                  }
                >
                  <Button
                    variant="plain"
                    aria-label="More info for authentication types"
                    onClick={(e: { preventDefault: () => any }) => e.preventDefault()}
                    icon={<HelpIcon />}
                    className={styles.formGroupLabelHelp}
                  />
                </Popover>
              }
            >
              {authButtons}
            </FormGroup>
          </FlexItem>
        )}
        <FlexItem>
          {isWifEnabled ? (
            <Title headingLevel="h4" className="pf-v6-u-mb-sm">
              {authType === GCPAuthType.WorkloadIdentityFederation
                ? 'Workload Identity Federation'
                : 'Service Account'}
            </Title>
          ) : (
            <Title headingLevel="h3" className="pf-v6-u-mb-sm">
              Google Cloud Service account
            </Title>
          )}
          {authType === GCPAuthType.ServiceAccounts && <ServiceAccountNotRecommendedAlert />}
          <Prerequisites acknowledgementRequired initiallyExpanded>
            {shouldShowPrepareGCPHint && (
              <PrepareGCPHint
                title={gcpTitle}
                text={gcpText}
                linkHref={linkHref}
                linkText={linkText}
              />
            )}
            {authType === GCPAuthType.WorkloadIdentityFederation ? (
              <WorkloadIdentityFederationPrerequisites
                hideResourceRequirements={isOSDFromGoogleCloud}
              />
            ) : (
              <ServiceAccountPrerequisites />
            )}
          </Prerequisites>
        </FlexItem>
        <FlexItem>
          {authType === GCPAuthType.WorkloadIdentityFederation ? (
            <WorkloadIdentityFederation {...{ getWifConfigsService }} />
          ) : (
            <ServiceAccount />
          )}
        </FlexItem>
      </Flex>
    </>
  );
};
