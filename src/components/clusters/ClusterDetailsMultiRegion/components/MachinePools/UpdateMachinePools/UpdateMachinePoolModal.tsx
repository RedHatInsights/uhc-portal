import React from 'react';
import { useDispatch, useSelector } from 'react-redux';

import {
  Alert,
  AlertVariant,
  Button,
  ButtonVariant,
  Timestamp,
  TimestampFormat,
} from '@patternfly/react-core';
import { OutlinedArrowAltCircleUpIcon } from '@patternfly/react-icons/dist/esm/icons/outlined-arrow-alt-circle-up-icon';

import Modal from '~/components/common/Modal/Modal';
import { modalActions } from '~/components/common/Modal/ModalActions';
import modalIds from '~/components/common/Modal/modals';
import shouldShowModal from '~/components/common/Modal/ModalSelectors';
import PopoverHint from '~/components/common/PopoverHint';
import { refetchMachineOrNodePoolsQuery } from '~/queries/ClusterDetailsQueries/MachinePoolTab/useFetchMachineOrNodePools';
import { useGlobalState } from '~/redux/hooks';
import { GlobalState } from '~/redux/stateTypes';

import { NodePoolWithUpgradePolicies } from '../machinePoolCustomTypes';

import {
  canMachinePoolBeUpgradedSelector,
  displayControlPlaneVersion,
  isMachinePoolScheduleError,
  isMachinePoolUpgrading,
  updateAllMachinePools as updatePool,
  useIsControlPlaneValidForMachinePool,
} from './updateMachinePoolsHelpers';

const updateModalId = modalIds.UPDATE_MACHINE_POOL_VERSION;

export const UpdatePoolButton = ({
  machinePool,
  isMachinePoolError,
  isHypershift,
  controlPlaneVersion,
  controlPlaneRawVersion,
}: {
  machinePool: NodePoolWithUpgradePolicies;
  isMachinePoolError: boolean;
  isHypershift: boolean;
  controlPlaneVersion: string;
  controlPlaneRawVersion: string;
}) => {
  const dispatch = useDispatch();

  const updateSchedules = useGlobalState((state) => state.clusterUpgrades.schedules);

  const canBeUpdated = canMachinePoolBeUpgradedSelector(
    updateSchedules,
    controlPlaneVersion,
    machinePool,
    isMachinePoolError,
    isHypershift,
    controlPlaneRawVersion,
  );
  const isAvailableVersion = useIsControlPlaneValidForMachinePool(
    machinePool,
    controlPlaneRawVersion,
  );
  const machinePoolUpdating = isMachinePoolUpgrading(machinePool);

  if (canBeUpdated && !isMachinePoolError) {
    return (
      <Button
        icon={<OutlinedArrowAltCircleUpIcon />}
        variant={ButtonVariant.link}
        isInline
        onClick={() => dispatch(modalActions.openModal(updateModalId, { machinePool }))}
      >
        Update
      </Button>
    );
  }

  if (isMachinePoolScheduleError(machinePool)) {
    return (
      <PopoverHint
        iconClassName="pf-v6-u-ml-sm"
        isError
        hint={machinePool.upgradePolicies?.errorMessage}
      />
    );
  }

  if (!isAvailableVersion) {
    return (
      <PopoverHint
        iconClassName="pf-v6-u-ml-sm"
        hint={`This machine pool cannot be updated because there isn't a migration path to version ${controlPlaneVersion}`}
      />
    );
  }

  if (machinePoolUpdating) {
    const scheduledMessage = 'This machine pool is scheduled to be updated';

    const schedule = machinePool.upgradePolicies?.items?.[0];

    if (schedule?.next_run && schedule?.version) {
      const currentDate = new Date(schedule.next_run);
      return (
        <PopoverHint
          iconClassName="pf-v6-u-ml-sm"
          hint={
            <>
              {scheduledMessage} at{' '}
              <Timestamp
                date={currentDate}
                shouldDisplayUTC
                dateFormat={TimestampFormat.medium}
                timeFormat={TimestampFormat.medium}
                locale="en-GB"
              />{' '}
              to version {schedule.version}
            </>
          }
        />
      );
    }

    return <PopoverHint iconClassName="pf-v6-u-ml-sm" hint={scheduledMessage} />;
  }
  return null;
};

export const UpdateMachinePoolModal = ({
  isHypershift,
  clusterId,
  refreshMachinePools,
  controlPlaneVersion,
  controlPlaneRawVersion,
  region,
}: {
  isHypershift: boolean;
  clusterId: string;
  refreshMachinePools?: () => void;
  controlPlaneVersion?: string;
  controlPlaneRawVersion?: string;
  region?: string;
}) => {
  const [pending, setPending] = React.useState(false);
  const [error, setError] = React.useState('');

  const isModalOpen = useSelector((state: GlobalState) => shouldShowModal(state, updateModalId));
  // @ts-ignore - useSelector is return as "any"
  const modalData: { machinePool: NodePoolWithUpgradePolicies } = useSelector(
    (state: GlobalState) => state.modal.data,
  );

  const { machinePool } = modalData;

  const dispatch = useDispatch();
  const cleanUp = () => {
    dispatch(modalActions.closeModal());
    setError('');
    setPending(false);
  };
  React.useEffect(
    () =>
      function cleanup() {
        cleanUp();
      },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  if (!isModalOpen) {
    return null;
  }

  const updateNodePool = async () => {
    setPending(true);
    const errors = await updatePool([machinePool], clusterId, controlPlaneRawVersion || '', region);

    setPending(false);
    setError(errors[0] || '');

    if (isHypershift && refreshMachinePools) {
      refreshMachinePools();
    } else {
      refetchMachineOrNodePoolsQuery(clusterId, isHypershift, controlPlaneVersion, region);
    }

    if (!errors[0]) {
      dispatch(modalActions.closeModal());
    }
  };

  return (
    <Modal
      modalSize="small"
      title="Update machine pool"
      onClose={() => cleanUp()}
      primaryText="Update machine pool"
      secondaryText="Cancel"
      onPrimaryClick={updateNodePool}
      onSecondaryClick={() => cleanUp()}
      isPrimaryDisabled={!!error}
      isPending={pending}
    >
      {!pending && !!error ? (
        <Alert
          title={`Machine pool ${machinePool?.id} could not be updated`}
          variant={AlertVariant.danger}
          isExpandable
          isInline
          role="alert"
          className="pf-v6-u-mt-md"
        >
          <p>{error}</p>
        </Alert>
      ) : (
        <p>
          Update machine pool {machinePool?.id} to version{' '}
          {displayControlPlaneVersion(controlPlaneVersion)}?
        </p>
      )}
    </Modal>
  );
};
