import React, { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';

import { ModalVariant } from '@patternfly/react-core/deprecated';

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
import Modal from '../../../../../common/Modal/Modal';
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
      title="Administrator acknowledgement"
      onClose={() => onCancel()}
      primaryText="Approve and continue"
      secondaryText="Cancel"
      onPrimaryClick={() => postClusterAcknowledge()}
      onSecondaryClick={() => onCancel()}
      isPrimaryDisabled={!confirmed}
      isPending={pending}
      className="ocm-upgrade-ack-modal"
      modalSize={ModalVariant.medium}
    >
      {errors.length === 0 ? (
        <UpgradeAcknowledgeStep
          fromVersion={fromVersion}
          toVersion={toVersion}
          unmetAcknowledgements={unmetAcknowledgements}
          confirmed={(isConfirmed: boolean) => setConfirmed(isConfirmed)}
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
    </Modal>
  );
};

export default UpgradeAcknowledgeModal;
