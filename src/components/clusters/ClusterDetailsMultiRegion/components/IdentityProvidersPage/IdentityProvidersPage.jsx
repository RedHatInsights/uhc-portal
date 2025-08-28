/* eslint-disable react/no-unstable-nested-components */
import React from 'react';
import { Formik } from 'formik';
import { isEqual } from 'lodash';
import get from 'lodash/get';
import PropTypes from 'prop-types';
import { useDispatch } from 'react-redux';
import { useParams } from 'react-router-dom';

import PageHeader from '@patternfly/react-component-groups/dist/dynamic/PageHeader';
import {
  Button,
  Card,
  CardBody,
  CardFooter,
  Grid,
  GridItem,
  PageSection,
  Spinner,
  Split,
  SplitItem,
} from '@patternfly/react-core';

import { Link, Navigate } from '~/common/routing';
import { AppPage } from '~/components/App/AppPage';
import { isHypershiftCluster } from '~/components/clusters/common/clusterStates';
import { usePostIDPForm } from '~/queries/ClusterDetailsQueries/IDPPage/usePostIDPForm';
import { useFetchClusterDetails } from '~/queries/ClusterDetailsQueries/useFetchClusterDetails';
import {
  refetchClusterIdentityProviders,
  useFetchClusterIdentityProviders,
} from '~/queries/ClusterDetailsQueries/useFetchClusterIdentityProviders';
import { ENHANCED_HTPASSWRD } from '~/queries/featureGates/featureConstants';
import { useFeatureGate } from '~/queries/featureGates/useFetchFeatureGate';

import getClusterName from '../../../../../common/getClusterName';
import { isValid } from '../../../../../common/helpers';
import { setGlobalError } from '../../../../../redux/actions/globalErrorActions';
import { SubscriptionCommonFieldsStatus } from '../../../../../types/accounts_mgmt.v1';
import Breadcrumbs from '../../../../common/Breadcrumbs';
import Unavailable from '../../../../common/Unavailable';

import HtpasswdDetails from './components/HtpasswdDetails/HtpasswdDetails';
import { isSingleUserHtpasswd } from './components/HtpasswdDetails/htpasswdUtilities';
import {
  IdentityProvidersPageFormInitialValues,
  IdentityProvidersPageValidationSchema,
} from './components/IdentityProvidersPageFormikHelpers';
import IDPForm from './components/IDPForm';
import {
  getCreateIDPRequestData,
  getInitialValuesForEditing,
  IDPformValues,
  IDPObjectNames,
  IDPTypeNames,
  singularFormIDP,
} from './IdentityProvidersHelper';

const PAGE_TITLE = 'Red Hat OpenShift Cluster Manager';

const IdentityProvidersPage = (props) => {
  const { isEditForm } = props;
  const params = useParams();
  const subscriptionID = params.id;

  const canViewHtpasswd = useFeatureGate(ENHANCED_HTPASSWRD);

  const {
    cluster,
    isLoading: isClusterDetailsLoading,
    isError: isClusterDetailsError,
    error: clusterDetailsError,
  } = useFetchClusterDetails(subscriptionID);

  const isManaged = cluster?.managed;
  const clusterID = cluster?.id;
  const subscriptionStatus = cluster?.subscription.status;
  const region = cluster?.subscription?.rh_region_id;

  const {
    clusterIdentityProviders: clusterIDPs,
    isLoading: isClusterIDPsLoading,
    isSuccess: isClusterIDPsSuccess,
  } = useFetchClusterIdentityProviders(cluster?.id, region);

  const {
    isPending: isPostIDPFormPending,
    isError: isPostIDPFormError,
    error: postIDPFormError,
    mutate: postIDPFormMutate,
    isSuccess: isPostIDPFormSuccess,
  } = usePostIDPForm(clusterID, region);

  const IDPList = clusterIDPs?.items || [];

  const hasIDPUpdateAccess = cluster?.idpActions?.update;

  const dispatch = useDispatch();
  let idpEdited = {};
  let editedType = '';
  let selectedIDP = '';
  if (isEditForm) {
    if (isClusterIDPsSuccess) {
      idpEdited = clusterIDPs.items.find((idp) => idp.name === params.idpName) || {};
      editedType = get(IDPObjectNames, idpEdited.type, '');
      selectedIDP = idpEdited.type;
    }
  } else if (!isEditForm && params.idpTypeName) {
    selectedIDP = get(IDPformValues, params.idpTypeName.toUpperCase(), false);
  }

  React.useEffect(() => {
    if (cluster?.subscription.id === subscriptionID) {
      const clusterName = getClusterName(cluster);
      document.title = `${clusterName} | Red Hat OpenShift Cluster Manager`;
    }

    if (!isClusterDetailsLoading && cluster?.id) {
      if (
        isValid(clusterID) &&
        subscriptionStatus !== SubscriptionCommonFieldsStatus.Deprovisioned &&
        isManaged
      ) {
        refetchClusterIdentityProviders();
      }
    }
  }, [cluster, isClusterDetailsLoading, isManaged, subscriptionStatus, subscriptionID, clusterID]);

  if (isPostIDPFormSuccess) {
    return <Navigate replace to={`/details/s/${cluster?.subscription.id}#accessControl`} />;
  }

  const requestedSubscriptionID = params.id;
  const clusterSubscriptionID = cluster?.subscription.id;

  const clusterPending =
    clusterSubscriptionID !== requestedSubscriptionID && !isClusterDetailsError;

  if ((clusterPending || isClusterIDPsLoading) && !isClusterDetailsError) {
    return (
      <AppPage title={PAGE_TITLE}>
        <div id="clusterdetails-content">
          <div className="cluster-loading-container">
            <div className="pf-v6-u-text-align-center">
              <Spinner size="lg" aria-label="Loading..." />
            </div>
          </div>
        </div>
      </AppPage>
    );
  }

  const htpasswd = IDPList.find(
    (idp) => idp.name === params.idpName && idp.type === IDPformValues.HTPASSWD,
  );

  const errorState = () => (
    <AppPage title={PAGE_TITLE}>
      <Unavailable message="Error retrieving IDP page" response={cluster} />
      {clusterPending && <Spinner size="lg" aria-label="Loading..." />}
    </AppPage>
  );

  if (isClusterDetailsError && (!cluster || clusterSubscriptionID !== requestedSubscriptionID)) {
    if (clusterDetailsError.errorCode === 404 || clusterDetailsError.errorCode === 403) {
      dispatch(
        setGlobalError(
          <>
            Cluster with subscription ID <b>{requestedSubscriptionID}</b> was not found, it might
            have been deleted or you don&apos;t have permission to see it.
          </>,
          'identityProvidersPage',
          clusterDetailsError.errorMessage,
        ),
      );
      return <Navigate replace to="/cluster-list" />;
    }
    return errorState();
  }

  if (!isManaged) {
    dispatch(
      setGlobalError(
        <>
          Cluster with subscription ID <b>{requestedSubscriptionID}</b> is not a managed cluster.
        </>,
        'identityProvidersPage',
        "Go to the cluster's console to see and edit identity providers.",
      ),
    );
    return <Navigate replace to="/cluster-list" />;
  }

  if (
    (!isEditForm && !selectedIDP && !params.idpTypeName) ||
    (isEditForm && isClusterIDPsSuccess && !selectedIDP)
  ) {
    return <Navigate replace to={`/details/s/${cluster?.subscription.id}#accessControl`} />;
  }

  if (!isClusterDetailsLoading && !hasIDPUpdateAccess && htpasswd && canViewHtpasswd) {
    return <Navigate replace to={`/details/s/${cluster?.subscription.id}#accessControl`} />;
  }

  const idpTypeName = IDPTypeNames[selectedIDP];
  const title = isEditForm
    ? `Edit identity provider: ${idpEdited.name}`
    : `Add identity provider: ${idpTypeName}`;
  const clusterName = getClusterName(cluster);
  const secondaryTitle = isEditForm
    ? title
    : `Add ${singularFormIDP[selectedIDP]} identity provider`;

  const isFormReadyForSubmit = (formik) => {
    if (Object.keys(formik.errors).length > 0 || formik.isSubmitting) {
      return true;
    }
    return false;
  };

  return (
    <AppPage title={PAGE_TITLE}>
      <PageHeader
        title={title}
        breadcrumbs={
          <Breadcrumbs
            path={[
              { label: 'Cluster List' },
              { label: clusterName, path: `/details/s/${cluster.subscription.id}` },
              {
                label: 'Access control',
                path: `/details/s/${cluster.subscription.id}#accessControl`,
              },
              { label: title },
            ]}
          />
        }
      />
      <PageSection hasBodyWrapper={false}>
        {htpasswd && canViewHtpasswd ? (
          <HtpasswdDetails
            idpName={htpasswd.name}
            idpId={htpasswd.id}
            clusterId={cluster.id}
            region={region}
            idpActions={cluster.idpActions}
            isSingleUserHtpasswd={isSingleUserHtpasswd(htpasswd.htpasswd)}
          />
        ) : (
          <Formik
            enableReinitialize
            initialValues={
              isEditForm
                ? getInitialValuesForEditing(idpEdited, editedType)
                : {
                    ...IdentityProvidersPageFormInitialValues(selectedIDP),
                  }
            }
            validationSchema={IdentityProvidersPageValidationSchema(selectedIDP)}
            onSubmit={async (values) => {
              const submitRequest = getCreateIDPRequestData(values);
              postIDPFormMutate(submitRequest, {
                onSuccess: () => refetchClusterIdentityProviders(clusterID),
              });
            }}
          >
            {(formik) => {
              const isModified = isEqual(formik.values, formik.initialValues);
              return (
                <Card>
                  <CardBody>
                    <Grid>
                      <GridItem md={8}>
                        {isClusterIDPsSuccess ? (
                          <IDPForm
                            selectedIDP={selectedIDP}
                            idpTypeName={idpTypeName}
                            formTitle={secondaryTitle}
                            clusterUrls={{
                              console: get(cluster, 'console.url'),
                              api: get(cluster, 'api.url'),
                            }}
                            isPostIDPFormError={isPostIDPFormError}
                            postIDPFormError={postIDPFormError}
                            isPostIDPFormPending={isPostIDPFormPending}
                            IDPList={IDPList}
                            idpEdited={idpEdited}
                            idpName={idpTypeName}
                            isHypershift={isHypershiftCluster(cluster)}
                            HTPasswdErrors={formik.errors?.users}
                            isClusterIDPsLoading={isClusterIDPsLoading}
                            isEditForm={isEditForm}
                          />
                        ) : (
                          <Spinner size="lg" aria-label="Loading..." />
                        )}
                      </GridItem>
                    </Grid>
                  </CardBody>
                  <CardFooter>
                    <Split hasGutter>
                      <SplitItem>
                        <Button
                          variant="primary"
                          type="submit"
                          isDisabled={
                            isPostIDPFormPending || isModified || isFormReadyForSubmit(formik)
                          }
                          isLoading={isPostIDPFormPending}
                          onClick={formik.submitForm}
                        >
                          {isEditForm ? 'Save' : 'Add'}
                        </Button>
                      </SplitItem>
                      <SplitItem>
                        <Button
                          variant="secondary"
                          component={(props) => (
                            <Link
                              {...props}
                              to={`/details/s/${cluster.subscription.id}#accessControl`}
                            />
                          )}
                        >
                          Cancel
                        </Button>
                      </SplitItem>
                    </Split>
                  </CardFooter>
                </Card>
              );
            }}
          </Formik>
        )}
      </PageSection>
    </AppPage>
  );
};

IdentityProvidersPage.propTypes = {
  isEditForm: PropTypes.bool,
};

IdentityProvidersPage.defaultProps = {
  isEditForm: false,
};

export default IdentityProvidersPage;
