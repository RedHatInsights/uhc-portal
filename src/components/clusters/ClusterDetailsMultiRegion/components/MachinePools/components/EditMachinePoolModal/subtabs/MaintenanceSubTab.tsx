import React from 'react';
import { FormikErrors } from 'formik';

import { Form, Tab, TabContent } from '@patternfly/react-core';

import { isHypershiftCluster } from '~/components/clusters/common/clusterStates';
import { ClusterFromSubscription } from '~/types/types';

import AutoRepairField from '../fields/AutoRepairField';
import { EditMachinePoolValues } from '../hooks/useMachinePoolFormik';

import { hasErrors, tabTitle } from './subTabHelpers';

const fieldsInTab = ['auto_repair'];

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
        </Form>
      </TabContent>
    ) : null;

  return [tab, content];
};
