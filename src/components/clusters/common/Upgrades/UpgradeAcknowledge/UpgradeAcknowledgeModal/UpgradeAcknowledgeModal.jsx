import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
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

import ErrorBox from '../../../../../common/ErrorBox';
import { setAutomaticUpgradePolicy } from '../../clusterUpgradeActions';
import UpgradeAcknowledgeStep from '../UpgradeAcknowledgeStep';

const UpgradeAcknowledgeModal = (props) => {
  const { clusterId, schedules, region } = props;
  const dispatch = useDispatch();
  const [pending, setPending] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [errors, setErrors] = useState([]);
  const [unmetAcknowledgements, setUnmetAcknowledgements] = useState([]);
  const [fromVersion, setFromVersion] = useState('');
  const [toVersion, setToVersion] = useState('');
  const [isHypershift, setIsHypershift] = useState(false);
  const [isSTSEnabled, setIsSTSEnabled] = useState(false);
  const isOpen = useGlobalState((state) => shouldShowModal(state, 'ack-upgrade'));
  const modalData = useGlobalState((state) => state.modal.data);

  const { mutateAsync: editScheduleMutate } = useEditSchedule(clusterId, isHypershift, region);
  const { mutateAsync: postClusterGateAgreementMutate } =
    usePostClusterGateAgreementAcknowledgeModal(clusterId, region);

  const automaticUpgradePolicyId = schedules?.items?.find(
    (policy) => policy.schedule_type === 'automatic',
  ).id;

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

    const foundErrors = [];
    if (automaticUpgradePolicyId && !isSTSEnabled) {
      try {
        const response = await editScheduleMutate({
          policyID: automaticUpgradePolicyId,
          schedule: { enable_minor_version_upgrades: true },
        });

        dispatch(setAutomaticUpgradePolicy(response.data));
      } catch (error) {
        foundErrors.push(formatErrorData(false, true, error));
      }
    }

    if (foundErrors.length === 0) {
      const ids = unmetAcknowledgements.map((ack) => ack.id);

      const response = await postClusterGateAgreementMutate(ids);

      response.forEach((promise) => {
        if (promise.status === 'rejected') {
          foundErrors.push(formatErrorData(false, true, promise.reason));
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

UpgradeAcknowledgeModal.propTypes = {
  clusterId: PropTypes.string,
  schedules: PropTypes.object,
  region: PropTypes.string,
};

UpgradeAcknowledgeModal.defaultProps = {};

export default UpgradeAcknowledgeModal;
