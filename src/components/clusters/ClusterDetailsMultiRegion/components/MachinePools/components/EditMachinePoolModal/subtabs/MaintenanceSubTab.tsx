import React from 'react';
import { FormikErrors } from 'formik';

import { Form, Tab, TabContent } from '@patternfly/react-core';

import { isHypershiftCluster } from '~/components/clusters/common/clusterStates';
import { ClusterFromSubscription } from '~/types/types';

import AutoRepairField from '../fields/AutoRepairField';
import { EditMachinePoolValues } from '../hooks/useMachinePoolFormik';

import { hasErrors, tabTitle } from './subTabHelpers';
import { MaintenanceField } from '../fields/MaintenanceField';
import { MAX_SURGE_HINT, MAX_UNAVAILABLE_HINT, NODE_DRAIN_TIMEOUT_HINT } from '../constants';
import { useFeatureGate } from '~/queries/featureGates/useFetchFeatureGate';
import { MP_ADDITIONAL_MAINTENANCE_VALUES } from '~/queries/featureGates/featureConstants';

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
    console.log('tabErrors', tabErrors);
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
            <>
              <MaintenanceField fieldId="maxSurge" fieldName="Max surge" hint={MAX_SURGE_HINT} />
              <MaintenanceField
                fieldId="maxUnavailable"
                fieldName="Max unavailable"
                hint={MAX_UNAVAILABLE_HINT}
              />
              <MaintenanceField
                fieldId="nodeDrainTimeout"
                fieldName="Node drain timeout"
                hint={NODE_DRAIN_TIMEOUT_HINT}
              />
            </>
          )}
        </Form>
      </TabContent>
    ) : null;

  return [tab, content];
};
