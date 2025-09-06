/* eslint-disable react/no-unescaped-entities */

// Form fields for upgrade settings, used in Upgrade Settings tab and in cluster creation
import React from 'react';
import { Field } from 'formik';

import { Content, ContentVariants, Divider, Grid, GridItem, Title } from '@patternfly/react-core';

import links from '~/common/installLinks.mjs';
import supportLinks from '~/common/supportLinks.mjs';
import PodDistruptionBudgetGraceSelect from '~/components/clusters/common/Upgrades/PodDistruptionBudgetGraceSelect';
import UpgradeScheduleSelection from '~/components/clusters/common/Upgrades/UpgradeScheduleSelection';
import { useFormState } from '~/components/clusters/wizards/hooks';
import { FieldId } from '~/components/clusters/wizards/rosa/constants';
import ExternalLink from '~/components/common/ExternalLink';
import RadioButtons from '~/components/common/ReduxFormComponents_deprecated/RadioButtons';

import './UpgradeSettingsFields.scss';

function UpgradeSettingsFields() {
  const {
    setFieldValue, // Set value of form field directly
    setFieldTouched, // Set whether field has been touched directly
    getFieldProps, // Access: name, value, onBlur, onChange for a <Field>, useful for mapping to a field
    // getFieldMeta, // Access: error, touched for a <Field>, useful for mapping to a field
    values: { [FieldId.UpgradePolicy]: upgradePolicy, [FieldId.Hypershift]: hypershift },
  } = useFormState();

  const isAutomatic = upgradePolicy === 'automatic';
  const isHypershift = hypershift === 'true';
  const initialScheduleValue = '0 0 * * 0';
  const isDisabled = false;
  const showDivider = false;

  const recurringUpdateMessage = (
    <>
      The cluster will be automatically updated based on your preferred day and start time when new
      patch updates (<ExternalLink href={links.ROSA_Z_STREAM}>z-stream</ExternalLink>) are
      available. When a new minor version is available, you'll be notified and must manually allow
      the cluster to update to the next minor version.
    </>
  );
  const recurringUpdateHypershift = (
    <>
      The cluster control plane will be automatically updated based on your preferred day and start
      time when new patch updates (<ExternalLink href={links.ROSA_Z_STREAM}>z-stream</ExternalLink>)
      are available. When a new minor version is available, you'll be notified and must manually
      allow the cluster to update to the next minor version. The worker nodes will need to be
      manually updated.
    </>
  );

  const automatic = {
    value: 'automatic',
    label: 'Recurring updates',
    description: isHypershift ? recurringUpdateHypershift : recurringUpdateMessage,
    extraField: isAutomatic && (
      <Grid>
        <GridItem md={6}>
          <Field
            component={UpgradeScheduleSelection}
            name={FieldId.AutomaticUpgradeSchedule}
            input={{
              ...getFieldProps(FieldId.AutomaticUpgradeSchedule),
              onChange: (value) => {
                setFieldTouched(FieldId.AutomaticUpgradeSchedule);
                setFieldValue(FieldId.AutomaticUpgradeSchedule, value);
              },
            }}
            isDisabled={isDisabled}
            isHypershift={isHypershift}
          />
        </GridItem>
      </Grid>
    ),
  };
  const manual = {
    value: 'manual',
    label: 'Individual updates',
    description: (
      <>
        Schedule each update individually. Take into consideration end of life dates from the{' '}
        <ExternalLink href={links.ROSA_LIFE_CYCLE}>lifecycle policy</ExternalLink> when planning
        updates.
      </>
    ),
  };

  const options = isHypershift ? [automatic, manual] : [manual, automatic];

  return (
    <>
      <GridItem>
        <Content component="p">
          Note: In the event of{' '}
          <ExternalLink href={supportLinks.SECURITY_CLASSIFICATION_CRITICAL}>
            Critical security concerns
          </ExternalLink>{' '}
          (CVEs) that significantly impact the security or stability of the cluster, updates may be{' '}
          automatically scheduled by Red Hat SRE to the latest z-stream version not impacted by the{' '}
          CVE within 2 business days after customer notifications.
        </Content>
      </GridItem>
      <GridItem className="ocm-c-upgrade-policy-radios">
        <Field
          component={RadioButtons}
          name={FieldId.UpgradePolicy}
          isDisabled={isDisabled}
          input={{
            ...getFieldProps(FieldId.UpgradePolicy),
            onChange: (value) => {
              setFieldTouched(FieldId.UpgradePolicy);
              setFieldValue(FieldId.UpgradePolicy, value);
              if (value === 'manual') {
                setFieldValue(FieldId.AutomaticUpgradeSchedule, initialScheduleValue);
              }
            },
          }}
          options={options}
          defaultValue="manual"
          disableDefaultValueHandling // interferes with enableReinitialize.
        />
      </GridItem>
      {showDivider && !isHypershift ? <Divider /> : null}
      {!isHypershift ? (
        <GridItem>
          <Title headingLevel="h4" className="ocm-c-upgrade-node-draining-title">
            Node draining
          </Title>
          <Content>
            <Content component={ContentVariants.p}>
              Note: You cannot change the node drain grace period after you start the upgrade
              process.
            </Content>
            <Content component={ContentVariants.p}>
              You may set a grace period for how long pod disruption budget-protected workloads will{' '}
              be respected during updates. After this grace period, any workloads protected by pod
              disruption budgets that have not been successfully drained from a node will be
              forcibly evicted.
            </Content>
          </Content>
          <Field
            name={FieldId.NodeDrainGracePeriod}
            component={PodDistruptionBudgetGraceSelect}
            isDisabled={isDisabled}
            input={{
              ...getFieldProps(FieldId.NodeDrainGracePeriod),
              onChange: (value) => {
                setFieldTouched(FieldId.NodeDrainGracePeriod);
                setFieldValue(FieldId.NodeDrainGracePeriod, value);
              },
            }}
          />
        </GridItem>
      ) : null}
    </>
  );
}

export default UpgradeSettingsFields;
