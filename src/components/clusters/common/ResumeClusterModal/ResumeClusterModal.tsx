import React from 'react';
import { useDispatch } from 'react-redux';

import { Form } from '@patternfly/react-core';

import Modal from '~/components/common/Modal/Modal';
import { closeModal } from '~/components/common/Modal/ModalActions';
import { useResumeCluster } from '~/queries/ClusterActionsQueries/useResumeCluster';
import { useGlobalState } from '~/redux/hooks';

import ErrorBox from '../../../common/ErrorBox';
import modals from '../../../common/Modal/modals';
import HibernateClusterContent from '../HibernateClusterModal/HibernateClusterContent';
import HibernateClusterModalTitle from '../HibernateClusterModal/HibernateClusterModalTitle';

type ResumeClusterModalProps = { onClose: () => void };

const ResumeClusterModal = ({ onClose }: ResumeClusterModalProps) => {
  const dispatch = useDispatch();

  const modalData: any = useGlobalState((state) => state.modal.data);
  const clusterID = modalData.clusterID || '';
  const clusterName = modalData.clusterName || '';
  const shouldDisplayClusterName = !!modalData.shouldDisplayClusterName;
  const region = modalData.rh_region_id;

  const {
    mutate: resumeCluster,
    isSuccess: resumeClusterSuccess,
    error: resumeClusterError,
    isError: resumeClusterIsError,
    isPending: resumeClusterIsPending,
    reset: resetResponse,
  } = useResumeCluster();

  const closeResumeModal = React.useCallback(() => {
    dispatch(closeModal());
  }, [dispatch]);

  React.useEffect(() => {
    if (resumeClusterSuccess) {
      resetResponse();
      onClose();
      closeResumeModal();
    }
  }, [closeResumeModal, onClose, resetResponse, resumeClusterSuccess]);

  return (
    <Modal
      data-testid="resume-cluster-modal"
      title={<HibernateClusterModalTitle title="Resume from hibernation" />}
      secondaryTitle={shouldDisplayClusterName ? clusterName : undefined}
      onClose={closeResumeModal}
      primaryText="Resume cluster"
      secondaryText="Close"
      onPrimaryClick={() => resumeCluster({ clusterID, region })}
      isPending={resumeClusterIsPending}
      onSecondaryClick={closeResumeModal}
      aria-label="Resume from hibernation"
      titleIconVariant="info"
    >
      <Form onSubmit={() => resumeCluster({ clusterID, region })}>
        {resumeClusterIsError ? (
          <ErrorBox message="Error hibernating cluster" response={resumeClusterError || {}} />
        ) : null}
        <HibernateClusterContent clusterName={clusterName} isHibernating />
      </Form>
    </Modal>
  );
};

ResumeClusterModal.modalName = modals.RESUME_CLUSTER;

export default ResumeClusterModal;
