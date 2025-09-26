import React from 'react';
import { FormikErrors } from 'formik';

import { Form, FormGroup, Stack, StackItem, Tab, TabContent } from '@patternfly/react-core';

import { isHypershiftCluster } from '~/components/clusters/common/clusterStates';
import { MP_ADDITIONAL_MAINTENANCE_VALUES } from '~/queries/featureGates/featureConstants';
import { useFeatureGate } from '~/queries/featureGates/useFetchFeatureGate';
import { ClusterFromSubscription } from '~/types/types';

import { MAX_SURGE_HINT, MAX_UNAVAILABLE_HINT, NODE_DRAIN_TIMEOUT_HINT } from '../constants';
import AutoRepairField from '../fields/AutoRepairField';
import { MaintenanceField } from '../fields/MaintenanceField';
import { EditMachinePoolValues } from '../hooks/useMachinePoolFormik';

import { hasErrors, tabTitle } from './subTabHelpers';

const fieldsInTab = ['auto_repair', 'maxSurge', 'maxUnavailable', 'nodeDrainTimeout'];

type Props = {
  cluster: ClusterFromSubscription;
  tabKey: number | string;
  initialTabContentShown?: boolean;
};
export const useMaintenanceSubTab = ({
  cluster,
  tabKey,
  initialTabContentShown,
}: Props): [
  (errors: FormikErrors<EditMachinePoolValues>) => React.JSX.Element | null,
  () => React.JSX.Element | null,
] => {
  const contentRef1 = React.createRef<HTMLElement>();
  const isHypershift = isHypershiftCluster(cluster);
  const isAdditionalMaintenanceValuesEnabled = useFeatureGate(MP_ADDITIONAL_MAINTENANCE_VALUES);

  const tab = (errors: FormikErrors<EditMachinePoolValues>) => {
    const tabErrors = hasErrors(errors, fieldsInTab);
    return isHypershift ? (
      <Tab
        eventKey={tabKey}
        title={tabTitle('Maintenance', tabErrors)}
        tabContentRef={contentRef1}
      />
    ) : null;
  };

  const content = () =>
    isHypershift ? (
      <TabContent
        eventKey={tabKey}
        id="maintenanceSubTabContent"
        ref={contentRef1}
        hidden={!initialTabContentShown}
        className="pf-v6-u-pt-md"
      >
        <Form>
          <AutoRepairField cluster={cluster} />
          {isHypershift && isAdditionalMaintenanceValuesEnabled && (
            <FormGroup label="Upgrade management">
              <Stack hasGutter>
                <StackItem>
                  <div className="uhc-labels-section__description">
                    Fine-tune your deployment: Max Surge speeds up updates by adding extra new pods,
                    while Max Unavailable ensures a minimum number of your current pods remain
                    active
                  </div>
                </StackItem>
                <StackItem>
                  <MaintenanceField
                    fieldId="maxSurge"
                    fieldName="Max surge"
                    hint={MAX_SURGE_HINT}
                  />
                </StackItem>
                <StackItem>
                  <MaintenanceField
                    fieldId="maxUnavailable"
                    fieldName="Max unavailable"
                    hint={MAX_UNAVAILABLE_HINT}
                  />
                </StackItem>
                <StackItem>
                  <MaintenanceField
                    fieldId="nodeDrainTimeout"
                    fieldName="Node drain timeout"
                    hint={NODE_DRAIN_TIMEOUT_HINT}
                  />
                </StackItem>
              </Stack>
            </FormGroup>
          )}
        </Form>
      </TabContent>
    ) : null;

  return [tab, content];
};
