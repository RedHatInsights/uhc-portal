import React from 'react';
import { Formik } from 'formik';
import get from 'lodash/get';
import { useDispatch } from 'react-redux';

import getClusterName from '~/common/getClusterName';
import { useEditCluster } from '~/queries/ClusterDetailsQueries/useEditCluster';
import { refreshQueries } from '~/queries/refreshEntireCache';
import { useGlobalState } from '~/redux/hooks';
import { Cluster } from '~/types/clusters_mgmt.v1';

import ErrorBox from '../../../common/ErrorBox';
import Modal from '../../../common/Modal/Modal';
import { closeModal } from '../../../common/Modal/ModalActions';
import modals from '../../../common/Modal/modals';

import { ScaleClusterForm } from './ScaleClusterForm';

type ScaleClusterDialogProps = {
  handleSubmit: () => void | undefined;
  pristine: boolean;
  initialValues: {
    id: string;
    nodes_compute: number | null;
    load_balancers: number;
    persistent_storage: number;
  };
};

const ScaleClusterDialog = ({ handleSubmit, initialValues, pristine }: ScaleClusterDialogProps) => {
  const dispatch = useDispatch();

  const closeScaleClusterModal = () => dispatch(closeModal());

  /* Cluster data */
  const modalData = useGlobalState((state) => state.modal.data) as any;

  const region = get(modalData, 'rh_region_id', undefined);
  const isByoc = modalData.ccs?.enabled;
  const clusterDisplayName = getClusterName(modalData);
  // @ts-ignore
  const shouldDisplayClusterName = modalData.shouldDisplayClusterName || false;

  /* Data mutation */
  const {
    isPending: editPending,
    isError: editIsError,
    error: editError,
    mutate,
  } = useEditCluster(region);

  const onSubmit = (formData: { load_balancers: string; persistent_storage: string }) => {
    const clusterRequest: {
      load_balancer_quota?: number | null;
      storage_quota?: { unit: string; value: number } | null;
    } = {};

    if (!isByoc) {
      clusterRequest.load_balancer_quota = formData.load_balancers
        ? parseInt(formData.load_balancers, 10)
        : null;
      // values in the passed are always in bytes.
      clusterRequest.storage_quota = formData.persistent_storage
        ? {
            unit: 'B',
            value: parseFloat(formData.persistent_storage),
          }
        : null;
    }

    mutate(
      {
        clusterID: modalData.id,
        cluster: clusterRequest as Cluster,
      },
      {
        onSuccess: () => {
          dispatch(closeModal());
          refreshQueries();
        },
      },
    );
  };

  const cancelEdit = () => {
    closeScaleClusterModal();
  };
  const error =
    editIsError && editError ? (
      <ErrorBox
        message="Error editing cluster"
        response={{
          errorMessage: editError?.message || editError?.errorMessage,
          operationID: editError?.operationID,
        }}
      />
    ) : null;

  const pending = editPending;

  const className = isByoc ? 'edit-cluster-modal' : 'edit-cluster-modal edit-cluster-modal-rhinfra';
  const title = 'Edit load balancers and persistent storage';
  return (
    <Formik
      initialValues={{
        id: modalData.id,
        nodes_compute: modalData.nodes ? modalData.nodes.compute : null,
        load_balancers: modalData.load_balancer_quota ? modalData.load_balancer_quota : 0,
        persistent_storage: modalData.storage_quota ? modalData.storage_quota.value : 107374182400,
      }}
      onSubmit={(values) => onSubmit(values)}
    >
      {({ submitForm, dirty }) => (
        <Modal
          className={className}
          title={title}
          secondaryTitle={shouldDisplayClusterName ? clusterDisplayName : undefined}
          onClose={cancelEdit}
          primaryText="Apply"
          // @ts-ignore
          onPrimaryClick={submitForm}
          onSecondaryClick={cancelEdit}
          isPrimaryDisabled={pending || !dirty}
          isPending={pending}
          isSmall
        >
          <>
            {error}
            <ScaleClusterForm submitForm={submitForm} pending={pending} />
          </>
        </Modal>
      )}
    </Formik>
  );
};

ScaleClusterDialog.modalName = modals.SCALE_CLUSTER;

export default ScaleClusterDialog;
