import React from 'react';
import { FormikErrors } from 'formik';

import { Form, Tab, TabContent } from '@patternfly/react-core';

import {
  AWS_TAGS_NEW_MP,
  ENABLE_AWS_TAGS_VIEW_IN_EDIT_MODAL,
} from '~/queries/featureGates/featureConstants';
import { useFeatureGate } from '~/queries/featureGates/useFetchFeatureGate';
import { MachineTypesResponse } from '~/queries/types';
import { MachinePool } from '~/types/clusters_mgmt.v1';
import { ClusterFromSubscription } from '~/types/types';

import { EditMachinePoolValues } from '../hooks/useMachinePoolFormik';
import EditLabelsSection from '../sections/EditLabelsSection';
import EditTaintsSection from '../sections/EditTaintsSection';

import { hasErrors, tabTitle } from './subTabHelpers';

const fieldsInTab = ['labels', 'taints'];

type Props = {
  cluster: ClusterFromSubscription;
  machinePools: MachinePool[];
  currentMachinePoolId?: string;
  machineTypes: MachineTypesResponse;
  tabKey: number | string;
  initialTabContentShown?: boolean;
  isROSAHCP: boolean;
  isNewMachinePool: boolean;
};

export const useLabelsTagsTaintsSubTab = ({
  cluster,
  machinePools,
  currentMachinePoolId,
  machineTypes,
  tabKey,
  initialTabContentShown,
  isROSAHCP,
  isNewMachinePool,
}: Props): [
  (errors: FormikErrors<EditMachinePoolValues>) => React.JSX.Element,
  () => React.JSX.Element,
] => {
  const showAWSTagsFeatureGate = useFeatureGate(AWS_TAGS_NEW_MP);
  const contentRef1 = React.createRef<HTMLElement>();
  const tab = (errors: FormikErrors<EditMachinePoolValues>) => {
    const tabErrors = hasErrors(errors, fieldsInTab);

    const showAWSTagsLabel =
      showAWSTagsFeatureGate &&
      isROSAHCP &&
      (isNewMachinePool || ENABLE_AWS_TAGS_VIEW_IN_EDIT_MODAL);

    return (
      <Tab
        eventKey={tabKey}
        title={tabTitle(`Labels${showAWSTagsLabel ? ', AWS Tags,' : ''} and Taints`, tabErrors)}
        tabContentRef={contentRef1}
      />
    );
  };

  const content = () => (
    <TabContent
      eventKey={tabKey}
      id="labelsTagsTaintsSubTabContent"
      ref={contentRef1}
      hidden={!initialTabContentShown}
      className="pf-v6-u-pt-md"
    >
      <Form>
        <EditLabelsSection isROSAHCP={isROSAHCP} isNewMachinePool={isNewMachinePool} />
        <EditTaintsSection
          cluster={cluster}
          machinePools={machinePools || []}
          machinePoolId={currentMachinePoolId}
          machineTypes={machineTypes}
        />
      </Form>
    </TabContent>
  );

  return [tab, content];
};
