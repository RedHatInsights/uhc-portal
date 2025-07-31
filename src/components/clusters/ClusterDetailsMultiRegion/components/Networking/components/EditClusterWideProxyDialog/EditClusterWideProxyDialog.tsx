import React, { useCallback } from 'react';
import { Formik } from 'formik';
import { useDispatch } from 'react-redux';

import { arrayToString } from '~/common/helpers';
import { modalActions } from '~/components/common/Modal/ModalActions';
import modals from '~/components/common/Modal/modals';
import shouldShowModal from '~/components/common/Modal/ModalSelectors';
import { useEditCluster } from '~/queries/ClusterDetailsQueries/useEditCluster';
import { invalidateClusterDetailsQueries } from '~/queries/ClusterDetailsQueries/useFetchClusterDetails';
import { useGlobalState } from '~/redux/hooks';
import { ClusterFromSubscription } from '~/types/types';

import EditClusterWideProxyForm from './EditClusterWideProxyForm';

type EditClusterWideProxyDialogProps = {
  cluster: ClusterFromSubscription;
  region?: string;
};

const OnlyReturnValueIfChanged = (newValue: string | undefined, oldValue: string | undefined) =>
  newValue !== oldValue ? newValue : undefined;

const EditClusterWideProxyDialog = ({ cluster, region }: EditClusterWideProxyDialogProps) => {
  const dispatch = useDispatch();
  const isOpen = useGlobalState((state) => shouldShowModal(state, modals.EDIT_CLUSTER_WIDE_PROXY));

  const {
    isPending: isClusterEditPending,
    isError: isClusterEditError,
    error: clusterEditError,
    mutate: mutateClusterEdit,
    reset: resetEditClusterResponse,
  } = useEditCluster(region);

  const spiltStringToArray = (str?: string) => str?.trim().split(',');

  const initialValues = {
    clusterID: cluster.id,
    http_proxy_url: cluster.proxy?.http_proxy,
    https_proxy_url: cluster.proxy?.https_proxy,
    no_proxy_domains: spiltStringToArray(cluster.proxy?.no_proxy ?? ''),
    additional_trust_bundle: cluster.additional_trust_bundle,
  };

  const handleClose = useCallback(() => {
    dispatch(modalActions.closeModal());
    resetEditClusterResponse();
    invalidateClusterDetailsQueries();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return isOpen ? (
    <Formik
      initialValues={initialValues}
      onSubmit={async (values) => {
        const clusterProxyBody = {
          proxy: {
            http_proxy: OnlyReturnValueIfChanged(
              values.http_proxy_url,
              initialValues.http_proxy_url,
            ),
            https_proxy: OnlyReturnValueIfChanged(
              values.https_proxy_url,
              initialValues.https_proxy_url,
            ),
            no_proxy: OnlyReturnValueIfChanged(
              arrayToString(values.no_proxy_domains),
              arrayToString(initialValues.no_proxy_domains),
            ),
          },
          additional_trust_bundle: OnlyReturnValueIfChanged(
            values.additional_trust_bundle,
            initialValues.additional_trust_bundle,
          ),
        };

        mutateClusterEdit(
          {
            clusterID: cluster?.id ?? '',
            cluster: clusterProxyBody,
          },
          {
            onSuccess: () => handleClose(),
          },
        );
      }}
    >
      {({ submitForm }) => (
        <EditClusterWideProxyForm
          submitForm={submitForm}
          isClusterEditPending={isClusterEditPending}
          isClusterEditError={isClusterEditError}
          clusterEditError={{
            errorDetails: clusterEditError?.errorDetails,
            errorMessage: clusterEditError?.errorMessage || clusterEditError?.message,
            operationID: clusterEditError?.operationID,
          }}
          handleClose={handleClose}
        />
      )}
    </Formik>
  ) : null;
};

export default EditClusterWideProxyDialog;
