import React from 'react';
import { useDispatch } from 'react-redux';
import { Location } from 'react-router-dom';

import { Form } from '@patternfly/react-core';

import { NavigateFunction, ocmBaseName } from '~/common/routing';
import Modal from '~/components/common/Modal/Modal';
import { closeModal } from '~/components/common/Modal/ModalActions';
import { useHibernateCluster } from '~/queries/ClusterActionsQueries/useHibernateCluster';
import { useGetSchedules } from '~/queries/ClusterDetailsQueries/ClusterSettingsTab/useGetSchedules';
import { useGlobalState } from '~/redux/hooks';

import ErrorBox from '../../../common/ErrorBox';
import modals from '../../../common/Modal/modals';
import { isHypershiftCluster } from '../clusterStates';

import HibernateClusterContent from './HibernateClusterContent';
import HibernateClusterModalTitle from './HibernateClusterModalTitle';
import HibernateClusterUpgradeInProgress from './HibernateClusterUpgradeInProgress';
import HibernateClusterUpgradeScheduled from './HibernateClusterUpgradeScheduled';

type HibernateClusterModalProps = { onClose: () => void };

const HibernateClusterModal = ({ onClose }: HibernateClusterModalProps) => {
  const dispatch = useDispatch();

  const modalData: any = useGlobalState((state) => state.modal.data);

  const clusterID = modalData.clusterID || '';
  const region = modalData.rh_region_id;
  const clusterName = modalData.clusterName || '';
  const subscriptionID = modalData.subscriptionID || '';
  const shouldDisplayClusterName = !!modalData.shouldDisplayClusterName;

  const isHypershift = isHypershiftCluster(modalData);

  const {
    mutate: hibernateCluster,
    isSuccess: hibernateClusterSuccess,
    error: hibernateClusterError,
    isError: hibernateClusterIsError,
    isPending: hibernateClusterIsPending,
    reset: resetResponse,
  } = useHibernateCluster();

  const closeHibernateModal = React.useCallback(() => {
    resetResponse();
    dispatch(closeModal());
  }, [dispatch, resetResponse]);

  const cancelHibernateCluster = () => {
    closeHibernateModal();
  };

  React.useEffect(() => {
    if (hibernateClusterSuccess) {
      resetResponse();
      onClose();
      closeHibernateModal();
    }
  }, [closeHibernateModal, hibernateClusterSuccess, onClose, resetResponse]);

  const errorMessage = hibernateClusterIsError ? (
    <ErrorBox message="Error hibernating cluster" response={hibernateClusterError || {}} />
  ) : null;

  const { data: clusterUpgrades, isLoading: clusterUpgradesLoading } = useGetSchedules(
    clusterID,
    isHypershift,
    region,
  );

  const upgradesInState = (state: string) =>
    // @ts-ignore - appears that types for useGetSchedules may need to be adjusted
    clusterUpgrades?.items?.filter((schedule) => schedule.state?.value === state);

  const scheduledUpgrades = upgradesInState('scheduled');
  const upgradesInProgress = upgradesInState('started');

  let hibernateFormContent;
  let secondaryText = 'Close';
  let isHibernateEnabled;

  if (upgradesInProgress && upgradesInProgress.length > 0) {
    isHibernateEnabled = false;
    secondaryText = 'See version update details';
    hibernateFormContent = <HibernateClusterUpgradeInProgress clusterName={clusterName} />;
  } else if (scheduledUpgrades && scheduledUpgrades.length > 0) {
    isHibernateEnabled = false;
    secondaryText = 'Change cluster upgrade policy';
    hibernateFormContent = (
      <HibernateClusterUpgradeScheduled
        clusterName={clusterName}
        nextRun={scheduledUpgrades[0].next_run || ''}
      />
    );
  } else {
    isHibernateEnabled = true;
    hibernateFormContent = (
      <HibernateClusterContent clusterName={clusterName} isHibernating={false} />
    );
  }

  const onPrimaryClick = () => {
    if (isHibernateEnabled) {
      hibernateCluster({ clusterID, region });
    } else {
      cancelHibernateCluster();
    }
  };

  const onSecondaryClick = ({
    location,
    navigate,
  }: {
    location: Location;
    navigate: NavigateFunction;
  }) => {
    cancelHibernateCluster();
    if (!isHibernateEnabled) {
      if (location.pathname.startsWith(`${ocmBaseName}/details/s/`)) {
        navigate({
          hash: '#updateSettings',
        });
      } else {
        navigate({
          pathname: `/details/s/${subscriptionID}`,
          hash: '#updateSettings',
        });
      }
    }
  };

  return (
    <Modal
      aria-label="hibernate-cluster-modal"
      title={<HibernateClusterModalTitle title="Hibernate cluster" />}
      titleIconVariant="info"
      secondaryTitle={shouldDisplayClusterName ? clusterName : undefined}
      primaryText={isHibernateEnabled ? 'Hibernate cluster' : 'Close'}
      onPrimaryClick={onPrimaryClick}
      secondaryText={secondaryText}
      onSecondaryClick={onSecondaryClick}
      onClose={cancelHibernateCluster}
      isPending={hibernateClusterIsPending || clusterUpgradesLoading}
    >
      <Form onSubmit={onPrimaryClick}>
        {errorMessage}
        {hibernateFormContent}
      </Form>
    </Modal>
  );
};

HibernateClusterModal.modalName = modals.HIBERNATE_CLUSTER;

export default HibernateClusterModal;
