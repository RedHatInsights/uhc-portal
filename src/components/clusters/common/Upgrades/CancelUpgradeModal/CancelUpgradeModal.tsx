import React from 'react';
import { useDispatch } from 'react-redux';

import { Form } from '@patternfly/react-core';
import { DateFormat } from '@redhat-cloud-services/frontend-components/DateFormat';

import Modal from '~/components/common/Modal/Modal';
import { useDeleteSchedule } from '~/queries/ClusterDetailsQueries/ClusterSettingsTab/useDeleteSchedule';
import { refetchSchedules } from '~/queries/ClusterDetailsQueries/ClusterSettingsTab/useGetSchedules';
import { invalidateClusterDetailsQueries } from '~/queries/ClusterDetailsQueries/useFetchClusterDetails';
import { useGlobalState } from '~/redux/hooks/useGlobalState';
import type { UpgradePolicyWithState } from '~/types/types';

import ErrorBox from '../../../../common/ErrorBox';
import { closeModal } from '../../../../common/Modal/ModalActions';
import shouldShowModal from '../../../../common/Modal/ModalSelectors';

interface CancelUpgradeModalProps {
  isHypershift: boolean;
}

interface CancelUpgradeModalData {
  clusterID: string;
  region: string;
  schedule: UpgradePolicyWithState;
}

const CancelUpgradeModal: React.FC<CancelUpgradeModalProps> = ({ isHypershift }) => {
  const dispatch = useDispatch();
  const isOpen = useGlobalState((state) => shouldShowModal(state, 'cancel-upgrade'));
  const { clusterID, region, schedule } = useGlobalState(
    (state) => state.modal.data as CancelUpgradeModalData,
  );

  const {
    isPending: isDeleteSchedulePending,
    isError: isDeleteScheduleError,
    error: deleteScheduleError,
    mutate: deleteScheduleMutate,
    reset: resetDeleteSchedules,
    isSuccess: isDeleteSchedulesSuccess,
  } = useDeleteSchedule(clusterID, isHypershift, region);

  const close = () => {
    resetDeleteSchedules();
    dispatch(closeModal());
  };

  React.useEffect(() => {
    if (!isDeleteSchedulePending && isDeleteSchedulesSuccess) {
      close();
    }
    // Infinite loop when add close
    // eslint-disable-next-line  react-hooks/exhaustive-deps
  }, [isDeleteSchedulesSuccess, isDeleteSchedulePending]);

  const deleteScheduleFunc = () => {
    if (schedule?.id) {
      deleteScheduleMutate(schedule.id, {
        onSuccess: () => {
          invalidateClusterDetailsQueries();
          refetchSchedules();
        },
      });
    }
  };

  const error = isDeleteScheduleError ? (
    <ErrorBox message="Error cancelling update" response={deleteScheduleError} />
  ) : null;

  return (
    isOpen && (
      <Modal
        title="Cancel update"
        onClose={close}
        primaryText="Cancel this update"
        primaryVariant="danger"
        secondaryText="Close"
        onPrimaryClick={deleteScheduleFunc}
        isPending={isDeleteSchedulePending}
        onSecondaryClick={close}
      >
        <>
          {error}
          <Form onSubmit={deleteScheduleFunc}>
            <p>
              This update to version {schedule?.version} is scheduled for{' '}
              <DateFormat
                type="exact"
                date={schedule?.next_run ? Date.parse(schedule.next_run) : new Date()}
              />
              .{' '}
            </p>
          </Form>
        </>
      </Modal>
    )
  );
};

export default CancelUpgradeModal;
