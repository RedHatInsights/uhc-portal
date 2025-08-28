import React, { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';

import {
  Button,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  ModalVariant,
} from '@patternfly/react-core';

import { modalActions } from '~/components/common/Modal/ModalActions';
import shouldShowModal from '~/components/common/Modal/ModalSelectors';
import { useEditSchedule } from '~/queries/ClusterDetailsQueries/ClusterSettingsTab/useEditSchedule';
import { refetchSchedules } from '~/queries/ClusterDetailsQueries/ClusterSettingsTab/useGetSchedules';
import { usePostClusterGateAgreementAcknowledgeModal } from '~/queries/ClusterDetailsQueries/ClusterSettingsTab/usePostClusterGateAgreement';
import { formatErrorData } from '~/queries/helpers';
import { refreshClusterDetails } from '~/queries/refreshEntireCache';
import { useGlobalState } from '~/redux/hooks';
import { UpgradePolicy, VersionGate } from '~/types/clusters_mgmt.v1';

import ErrorBox from '../../../../../common/ErrorBox';
import { setAutomaticUpgradePolicy } from '../../clusterUpgradeActions';
import UpgradeAcknowledgeStep from '../UpgradeAcknowledgeStep';

interface UpgradeAcknowledgeModalProps {
  clusterId?: string;
  schedules?: UpgradePolicy[];
  region?: string;
}

interface ModalData {
  fromVersion: string;
  toVersion: string;
  unmetAcknowledgements: VersionGate[];
  isHypershift: boolean;
  isSTSEnabled: boolean;
}

const UpgradeAcknowledgeModal = ({
  clusterId,
  schedules,
  region,
}: UpgradeAcknowledgeModalProps) => {
  const dispatch = useDispatch();
  const [pending, setPending] = useState<boolean>(false);
  const [confirmed, setConfirmed] = useState<boolean>(false);
  const [errors, setErrors] = useState<any[]>([]);
  const [unmetAcknowledgements, setUnmetAcknowledgements] = useState<VersionGate[]>([]);
  const [fromVersion, setFromVersion] = useState<string>('');
  const [toVersion, setToVersion] = useState<string>('');
  const [isHypershift, setIsHypershift] = useState<boolean>(false);
  const [isSTSEnabled, setIsSTSEnabled] = useState<boolean>(false);
  const isOpen = useGlobalState((state) => shouldShowModal(state, 'ack-upgrade'));
  const modalData = useGlobalState((state) => state.modal.data as ModalData);

  const { mutateAsync: editScheduleMutate } = useEditSchedule(
    clusterId || '',
    isHypershift,
    region,
  );
  const { mutateAsync: postClusterGateAgreementMutate } =
    usePostClusterGateAgreementAcknowledgeModal(clusterId || '', region);

  const automaticUpgradePolicyId = schedules?.find(
    (policy) => policy.schedule_type === 'automatic',
  )?.id;

  useEffect(() => {
    if (isOpen) {
      setFromVersion(modalData.fromVersion);
      setToVersion(modalData.toVersion);
      setUnmetAcknowledgements(modalData.unmetAcknowledgements);
      setIsHypershift(modalData.isHypershift);
      setIsSTSEnabled(modalData.isSTSEnabled);
      setErrors([]);
    }
  }, [isOpen, modalData]);

  const onCancel = () => {
    dispatch(modalActions.closeModal());
  };

  const postClusterAcknowledge = async () => {
    setPending(true);
    setErrors([]);

    const foundErrors: any[] = [];
    if (automaticUpgradePolicyId && !isSTSEnabled) {
      try {
        const response = await editScheduleMutate({
          policyID: automaticUpgradePolicyId,
          schedule: { enable_minor_version_upgrades: true },
        });

        dispatch(setAutomaticUpgradePolicy(response.data));
      } catch (error) {
        foundErrors.push(formatErrorData(false, true, error as Error));
      }
    }

    if (foundErrors.length === 0) {
      const ids = unmetAcknowledgements
        .map((ack) => ack.id)
        .filter((id): id is string => id !== undefined);

      const response = await postClusterGateAgreementMutate(ids);

      response.forEach((promise) => {
        if (promise.status === 'rejected') {
          foundErrors.push(formatErrorData(false, true, (promise as any).reason));
          if (confirmed) {
            setConfirmed(false);
          }
        }
        if (promise.status === 'fulfilled') {
          refetchSchedules();
          refreshClusterDetails();
        }
      });
    }

    setPending(false);

    if (foundErrors.length === 0) {
      dispatch(modalActions.closeModal());
    } else {
      setErrors(foundErrors);
    }
  };

  if (!isOpen) return null;
  return (
    <Modal
      id="acknowledge-upgrade-modal"
      onClose={() => onCancel()}
      isOpen
      variant={ModalVariant.medium}
      aria-labelledby="acknowledge-upgrade-modal"
      aria-describedby="modal-box-acknowledge-upgrade"
      className="ocm-upgrade-ack-modal"
    >
      <ModalHeader title="Administrator acknowledgement" labelId="acknowledge-upgrade-modal" />
      <ModalBody>
        {errors.length === 0 ? (
          <UpgradeAcknowledgeStep
            fromVersion={fromVersion}
            toVersion={toVersion}
            unmetAcknowledgements={unmetAcknowledgements}
            confirmed={(isConfirmed) => setConfirmed(isConfirmed)}
          />
        ) : (
          errors.map((error, index) => (
            <ErrorBox
              /* eslint-disable-next-line react/no-array-index-key */
              key={`err-${index}`}
              message="Failed to save administrator acknowledgement."
              response={error?.error}
            />
          ))
        )}
      </ModalBody>
      <ModalFooter>
        <Button
          variant="primary"
          onClick={() => postClusterAcknowledge()}
          isDisabled={!confirmed}
          isLoading={pending}
        >
          Approve and continue
        </Button>
        <Button variant="link" onClick={() => onCancel()} isDisabled={pending}>
          Cancel
        </Button>
      </ModalFooter>
    </Modal>
  );
};

export default UpgradeAcknowledgeModal;
