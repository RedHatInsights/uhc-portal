import React from 'react';
import { FormikErrors } from 'formik';

import { Form, Tab, TabContent } from '@patternfly/react-core';

import { isHypershiftCluster } from '~/components/clusters/common/clusterStates';
import { CloudProviderType, IMDSType } from '~/components/clusters/wizards/common';
import { ShieldedVM } from '~/components/clusters/wizards/common/ShieldedVM';
import { FieldId } from '~/components/clusters/wizards/rosa/constants';
import ImdsSection from '~/components/clusters/wizards/rosa/MachinePoolScreen/components/ImdsSection';
import {
  GCP_SECURE_BOOT,
  IMDS_SELECTION,
  MAX_NODES_TOTAL_249,
} from '~/queries/featureGates/featureConstants';
import { useFeatureGate } from '~/queries/featureGates/useFetchFeatureGate';
import { MachineTypesResponse } from '~/queries/types';
import { MachinePool } from '~/types/clusters_mgmt.v1';
import { ClusterFromSubscription } from '~/types/types';

import CapacityReservationField from '../fields/CapacityReservationField';
import DiskSizeField from '../fields/DiskSizeField';
import { EditMachinePoolValues } from '../hooks/useMachinePoolFormik';
import EditDetailsSection from '../sections/EditDetailsSection';
import EditNodeCountSection from '../sections/EditNodeCountSection';

import { hasErrors, tabTitle } from './subTabHelpers';

const fieldsInTab = [
  'machine-pool',
  'name',
  'privateSubnetId',
  'instanceType',
  'autoscaling',
  'autoscaleMin',
  'autoscaleMax',
  'replicas',
  FieldId.IMDS,
  'diskSize',
  'secure_boot',
  'capacityReservationPreference',
  'capacityReservationId',
];

type Props = {
  cluster: ClusterFromSubscription;
  machinePools: MachinePool[];
  isEdit: boolean;
  region?: string;
  currentMachinePool?: MachinePool;
  setCurrentMPId: (id: string) => void;
  machineTypesResponse: MachineTypesResponse;
  machineTypesLoading: boolean;
  tabKey: number | string;
  initialTabContentShown?: boolean;
};

export const useOverviewSubTab = ({
  cluster,
  machinePools,
  isEdit,
  region,
  currentMachinePool,
  setCurrentMPId,
  machineTypesResponse,
  machineTypesLoading,
  tabKey,
  initialTabContentShown,
}: Props): [
  (errors: FormikErrors<EditMachinePoolValues>) => React.JSX.Element,
  ({
    setFieldValue,
    imdsValue,
  }: {
    setFieldValue: (field: string, value: any) => void;
    imdsValue: IMDSType;
  }) => React.JSX.Element,
] => {
  const isHypershift = isHypershiftCluster(cluster);
  const isGCP = cluster?.cloud_provider?.id === CloudProviderType.Gcp;

  const allow249NodesOSDCCSROSA = useFeatureGate(MAX_NODES_TOTAL_249);
  const isSecureBootEnabled = useFeatureGate(GCP_SECURE_BOOT);
  const imdsSectionFeature = useFeatureGate(IMDS_SELECTION);

  const contentRef1 = React.createRef<HTMLElement>();

  const tab = (errors: FormikErrors<EditMachinePoolValues>) => {
    const tabErrors = hasErrors(errors, fieldsInTab);

    return (
      <Tab eventKey={tabKey} title={tabTitle('Overview', tabErrors)} tabContentRef={contentRef1} />
    );
  };

  const content = ({
    setFieldValue,
    imdsValue,
  }: {
    setFieldValue: (field: string, value: any) => void;
    imdsValue: IMDSType;
  }) => (
    <TabContent
      eventKey={tabKey}
      id="overviewSubTabContent"
      ref={contentRef1}
      hidden={!initialTabContentShown}
      className="pf-v6-u-pt-md"
    >
      <Form>
        <EditDetailsSection
          cluster={cluster}
          machinePools={machinePools || []}
          isEdit={isEdit}
          region={region}
          currentMPId={currentMachinePool?.id}
          setCurrentMPId={setCurrentMPId}
          machineTypesResponse={machineTypesResponse}
          machineTypesLoading={machineTypesLoading}
        />
        <EditNodeCountSection
          cluster={cluster}
          machinePool={currentMachinePool}
          machinePools={machinePools || []}
          machineTypes={machineTypesResponse}
          allow249NodesOSDCCSROSA={allow249NodesOSDCCSROSA}
        />
        {imdsSectionFeature && !isEdit && isHypershift ? (
          <ImdsSection
            imds={imdsValue}
            isDisabled={false}
            onChangeImds={(value) => setFieldValue(FieldId.IMDS, value)}
          />
        ) : null}
        <DiskSizeField cluster={cluster} isEdit={isEdit} />
        <CapacityReservationField cluster={cluster} isEdit={isEdit} />
        {isGCP && isSecureBootEnabled ? <ShieldedVM isEditModal={!!isEdit} /> : null}
      </Form>
    </TabContent>
  );

  return [tab, content];
};
