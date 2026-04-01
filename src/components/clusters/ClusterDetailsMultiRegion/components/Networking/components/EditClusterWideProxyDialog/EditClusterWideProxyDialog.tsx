import React, { useCallback } from 'react';
import { Formik } from 'formik';
import PropTypes from 'prop-types';
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
  region: string;
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
        // OCMUI-4183: Only include fields that have actually changed
        // to avoid sending undefined values that can invalidate existing configuration
        const clusterProxyBody: {
          proxy?: {
            http_proxy?: string;
            https_proxy?: string;
            no_proxy?: string;
          };
          additional_trust_bundle?: string;
        } = {};

        // Check which proxy fields changed
        const httpProxyChanged = OnlyReturnValueIfChanged(
          values.http_proxy_url,
          initialValues.http_proxy_url,
        );
        const httpsProxyChanged = OnlyReturnValueIfChanged(
          values.https_proxy_url,
          initialValues.https_proxy_url,
        );
        const noProxyChanged = OnlyReturnValueIfChanged(
          arrayToString(values.no_proxy_domains),
          arrayToString(initialValues.no_proxy_domains),
        );

        // Only include proxy object if any proxy field changed
        if (
          httpProxyChanged !== undefined ||
          httpsProxyChanged !== undefined ||
          noProxyChanged !== undefined
        ) {
          clusterProxyBody.proxy = {};
          if (httpProxyChanged !== undefined) {
            clusterProxyBody.proxy.http_proxy = httpProxyChanged;
          }
          if (httpsProxyChanged !== undefined) {
            clusterProxyBody.proxy.https_proxy = httpsProxyChanged;
          }
          if (noProxyChanged !== undefined) {
            clusterProxyBody.proxy.no_proxy = noProxyChanged;
          }
        }

        // Only include additional_trust_bundle if it changed
        const trustBundleChanged = OnlyReturnValueIfChanged(
          values.additional_trust_bundle,
          initialValues.additional_trust_bundle,
        );
        if (trustBundleChanged !== undefined) {
          clusterProxyBody.additional_trust_bundle = trustBundleChanged;
        }

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

EditClusterWideProxyDialog.propTypes = {
  cluster: PropTypes.object,
  region: PropTypes.string,
};

export default EditClusterWideProxyDialog;
