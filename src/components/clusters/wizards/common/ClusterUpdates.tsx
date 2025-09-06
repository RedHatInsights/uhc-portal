import * as React from 'react';
import { Field } from 'formik';

import {
  Content,
  ContentVariants,
  Flex,
  Form,
  Grid,
  GridItem,
  Title,
} from '@patternfly/react-core';

import links from '~/common/installLinks.mjs';
import supportLinks from '~/common/supportLinks.mjs';
import PodDistruptionBudgetGraceSelect from '~/components/clusters/common/Upgrades/PodDistruptionBudgetGraceSelect';
import UpgradeScheduleSelection from '~/components/clusters/common/Upgrades/UpgradeScheduleSelection';
import {
  FieldId,
  initialValues,
  UpgradePolicyType,
} from '~/components/clusters/wizards/common/constants';
import { RadioGroupField } from '~/components/clusters/wizards/form/RadioGroupField';
import { useFormState } from '~/components/clusters/wizards/hooks';
import ExternalLink from '~/components/common/ExternalLink';

export const ClusterUpdates = () => {
  const {
    values: { [FieldId.UpgradePolicy]: upgradePolicy },
    setFieldValue,
    getFieldProps,
  } = useFormState();

  const upgradePolicyOptions = [
    {
      value: UpgradePolicyType.Manual,
      label: 'Individual updates',
      description: (
        <>
          Schedule each update individually. Take into consideration end of life dates from the{' '}
          <ExternalLink href={links.OSD_LIFE_CYCLE}>lifecycle policy</ExternalLink> when planning
          updates.
        </>
      ),
    },
    {
      value: UpgradePolicyType.Automatic,
      label: 'Recurring updates',
      description: (
        <>
          The cluster will be automatically updated based on your preferred day and start time when
          new patch updates (<ExternalLink href={links.OSD_Z_STREAM}>z-stream</ExternalLink>) are
          available. When a new minor version is available, you&apos;ll be notified and must
          manually allow the cluster to update to the next minor version.
        </>
      ),
    },
  ];

  const onUpgradePolicyChange = (_event: React.FormEvent<HTMLDivElement>, value: string) => {
    if (value === UpgradePolicyType.Manual) {
      setFieldValue(
        FieldId.AutomaticUpgradeSchedule,
        initialValues[FieldId.AutomaticUpgradeSchedule],
      );
    }
  };

  return (
    <Form>
      <GridItem>
        <Title headingLevel="h3">Cluster update strategy</Title>

        <Content component={ContentVariants.p} className="pf-v6-u-mt-sm">
          In the event of{' '}
          <ExternalLink href={supportLinks.SECURITY_CLASSIFICATION_CRITICAL}>
            Critical security concerns
          </ExternalLink>{' '}
          (CVEs) that significantly impact the security or stability of the cluster, updates may be
          automatically scheduled by Red Hat SRE to the latest z-stream version not impacted by the
          CVE within 2 business days after customer notifications.
        </Content>
      </GridItem>

      <Grid hasGutter md={6}>
        <Flex direction={{ default: 'column' }} spaceItems={{ default: 'spaceItemsLg' }}>
          <GridItem>
            <RadioGroupField
              name={FieldId.UpgradePolicy}
              options={upgradePolicyOptions}
              onChange={onUpgradePolicyChange}
            />

            {upgradePolicy === UpgradePolicyType.Automatic && (
              <Field
                component={UpgradeScheduleSelection}
                name={FieldId.AutomaticUpgradeSchedule}
                input={{
                  ...getFieldProps(FieldId.AutomaticUpgradeSchedule),
                  onChange: (value: string) =>
                    setFieldValue(FieldId.AutomaticUpgradeSchedule, value),
                }}
                className="pf-v6-u-mt-md"
              />
            )}
          </GridItem>
        </Flex>
      </Grid>

      <GridItem>
        <Title headingLevel="h4" className="ocm-c-upgrade-node-draining-title">
          Node draining
        </Title>
        <Content component={ContentVariants.p}>
          Note: You cannot change the node drain grace period after you start the upgrade process.
        </Content>
        <Content component={ContentVariants.p}>
          You may set a grace period for how long pod disruption budget-protected workloads will be
          respected during updates. After this grace period, any workloads protected by pod
          disruption budgets that have not been successfully drained from a node will be forcibly
          evicted.
        </Content>

        <Field
          name={FieldId.NodeDrainGracePeriod}
          component={PodDistruptionBudgetGraceSelect}
          input={{
            ...getFieldProps(FieldId.NodeDrainGracePeriod),
            onChange: (value: string) => setFieldValue(FieldId.NodeDrainGracePeriod, value),
          }}
        />
      </GridItem>
    </Form>
  );
};
