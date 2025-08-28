import React from 'react';

import {
  Alert,
  Button,
  Flex,
  FlexItem,
  Form,
  FormAlert,
  FormGroup,
  Hint,
  HintBody,
  HintFooter,
  HintTitle,
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
import { ServiceAccount } from '~/components/clusters/wizards/osd/ClusterSettings/CloudProvider/GcpByocFields/ServiceAccountAuth/ServiceAccount';
import { ServiceAccountPrerequisites } from '~/components/clusters/wizards/osd/ClusterSettings/CloudProvider/GcpByocFields/ServiceAccountAuth/ServiceAccountPrerequisites';
import {
  WorkloadIdentityFederation,
  WorkloadIdentityFederationProps,
} from '~/components/clusters/wizards/osd/ClusterSettings/CloudProvider/GcpByocFields/WorkloadIdentityFederation/WorkloadIdentityFederation';
import { WorkloadIdentityFederationPrerequisites } from '~/components/clusters/wizards/osd/ClusterSettings/CloudProvider/GcpByocFields/WorkloadIdentityFederation/WorkloadIdentityFederationPrerequisites';
import { GCPAuthType } from '~/components/clusters/wizards/osd/ClusterSettings/CloudProvider/types';
import { FieldId } from '~/components/clusters/wizards/osd/constants';
import ExternalLink from '~/components/common/ExternalLink';
import { GCP_WIF_DEFAULT, OSD_GCP_WIF } from '~/queries/featureGates/featureConstants';
import { useFeatureGate } from '~/queries/featureGates/useFetchFeatureGate';
import { SubscriptionCommonFieldsCluster_billing_model as SubscriptionCommonFieldsClusterBillingModel } from '~/types/accounts_mgmt.v1';

export interface GcpByocFieldsProps extends WorkloadIdentityFederationProps {}

export const GcpByocFields = (props: GcpByocFieldsProps) => {
  const { getWifConfigsService } = props;
  const {
    values: { [FieldId.BillingModel]: billingModel },
  } = useFormState();

  const isWifEnabled = useFeatureGate(OSD_GCP_WIF);
  const isWifDefaultEnabled = useFeatureGate(GCP_WIF_DEFAULT);

  const gcpTitle = 'Have you prepared your Google account?';
  const gcpText = `To prepare your account, accept the Google Cloud Terms and Agreements. If you've already accepted the terms, you can continue to complete OSD prerequisites.`;

  const {
    setFieldValue,
    values: { [FieldId.GcpAuthType]: authTypeFormValue },
  } = useFormState();

  const authType = isWifEnabled ? authTypeFormValue : GCPAuthType.ServiceAccounts;

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
      {isWifDefaultEnabled ? (
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

  return (
    <Form isWidthLimited onSubmit={(e) => e.preventDefault()}>
      {billingModel !== SubscriptionCommonFieldsClusterBillingModel.marketplace_gcp && (
        <FormAlert>
          <Alert variant="info" isInline isPlain title="Customer cloud subscription">
            Provision your cluster in a Google Cloud Platform account owned by you or your company
            to leverage your existing relationship and pay Google Cloud Platform directly for public
            cloud costs.
          </Alert>
        </FormAlert>
      )}

      <Flex direction={{ default: 'column' }} spaceItems={{ default: 'spaceItemsLg' }}>
        {isWifEnabled && (
          <FlexItem>
            <Title headingLevel="h3" className="pf-v6-u-mb-sm">
              GCP account details
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
              GCP Service account
            </Title>
          )}

          <Prerequisites acknowledgementRequired initiallyExpanded>
            {billingModel === SubscriptionCommonFieldsClusterBillingModel.marketplace_gcp && (
              <Hint className="pf-v6-u-mb-md pf-v6-u-mt-sm">
                <HintTitle>
                  <strong>{gcpTitle}</strong>
                </HintTitle>
                <HintBody>{gcpText}</HintBody>
                <HintFooter>
                  <ExternalLink href={links.GCP_CONSOLE_OSD_HOME}>
                    Review Google terms and agreements.
                  </ExternalLink>
                </HintFooter>
              </Hint>
            )}
            {authType === GCPAuthType.WorkloadIdentityFederation ? (
              <WorkloadIdentityFederationPrerequisites />
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
    </Form>
  );
};
