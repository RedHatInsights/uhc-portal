import React from 'react';
import { FormikErrors } from 'formik';

import { Form, Tab, TabContent } from '@patternfly/react-core';

import { canUseSpotInstances } from '~/components/clusters/ClusterDetailsMultiRegion/components/MachinePools/machinePoolsHelper';
import { ClusterFromSubscription } from '~/types/types';

import { EditMachinePoolValues } from '../hooks/useMachinePoolFormik';
import SpotInstancesSection from '../sections/SpotInstancesSection';

import { hasErrors, tabTitle } from './subTabHelpers';

const fieldsInTab = ['useSpotInstances', 'spotInstanceType', 'maxPrice'];

type Props = {
  tabKey: number | string;
  cluster: ClusterFromSubscription;
  isEdit: boolean;
  initialTabContentShown?: boolean;
};

export const useCostSavingsSubTab = ({
  tabKey,
  cluster,
  isEdit,
  initialTabContentShown,
}: Props): [
  (errors: FormikErrors<EditMachinePoolValues>) => React.JSX.Element | null,
  () => React.JSX.Element | null,
] => {
  const contentRef1 = React.createRef<HTMLElement>();
  const showCostSavingsTab = canUseSpotInstances(cluster);

  const tab = (errors: FormikErrors<EditMachinePoolValues>) => {
    const tabErrors = hasErrors(errors, fieldsInTab);

    return showCostSavingsTab ? (
      <Tab
        eventKey={tabKey}
        title={tabTitle('Cost savings', tabErrors)}
        tabContentRef={contentRef1}
      />
    ) : null;
  };

  const content = () =>
    showCostSavingsTab ? (
      <TabContent
        eventKey={tabKey}
        id="costSavingsSubTabContent"
        ref={contentRef1}
        hidden={!initialTabContentShown}
        className="pf-v6-u-pt-md"
      >
        <Form>
          <SpotInstancesSection isEdit={isEdit} />
        </Form>
      </TabContent>
    ) : null;

  return [tab, content];
};
