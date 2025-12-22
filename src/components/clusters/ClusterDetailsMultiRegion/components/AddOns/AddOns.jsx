import React from 'react';
import PropTypes from 'prop-types';
import { useDispatch } from 'react-redux';

import {
  Button,
  EmptyState,
  EmptyStateActions,
  EmptyStateBody,
  EmptyStateFooter,
  Spinner,
} from '@patternfly/react-core';
import { CubesIcon } from '@patternfly/react-icons/dist/esm/icons/cubes-icon';
import { PlusCircleIcon } from '@patternfly/react-icons/dist/esm/icons/plus-circle-icon';

import { getOCMResourceType } from '~/common/analytics';
import { normalizedProducts } from '~/common/subscriptionTypes';
import { useAddClusterAddOn } from '~/queries/ClusterDetailsQueries/AddOnsTab/useAddClusterAddOn';
import { useDeleteClusterAddOn } from '~/queries/ClusterDetailsQueries/AddOnsTab/useDeleteClusterAddOn';
import {
  refetchAddOns,
  useFetchAddOns,
} from '~/queries/ClusterDetailsQueries/AddOnsTab/useFetchAddOns';
import {
  refetchClusterAddOns,
  useFetchClusterAddOns,
} from '~/queries/ClusterDetailsQueries/AddOnsTab/useFetchClusterAddOns';
import { useUpdateClusterAddOn } from '~/queries/ClusterDetailsQueries/AddOnsTab/useUpdateClusterAddOn';
import { useFetchOrganizationQuota } from '~/queries/ClusterDetailsQueries/useFetchOrganizationQuota';
import { useGlobalState } from '~/redux/hooks';

import { getOrganizationAndQuota } from '../../../../../redux/actions/userActions';
import ErrorBox from '../../../../common/ErrorBox';
import { ClusterTabsId } from '../common/ClusterTabIds';

import AddOnsDrawer from './AddOnsDrawer';
import { availableAddOns } from './AddOnsHelper';

const AddOns = ({ clusterID, region, cluster, isHypershift }) => {
  const dispatch = useDispatch();
  const organization = useGlobalState((state) => state.userProfile.organization);

  // Calculate analytics resource type for tracking
  const planType = cluster?.subscription?.plan?.id ?? normalizedProducts.UNKNOWN;
  const analyticsResourceType = getOCMResourceType(planType);
  const {
    data: addOnsData,
    isError: isFetchAddOnsError,
    error: addOnsError,
  } = useFetchAddOns(clusterID, region, isHypershift);
  const {
    data: clusterAddOnsData,
    isLoading: isFetchClusterAddOnsLoading,
    isError: isFetchClusterAddOnsError,
    error: clusterAddOnsError,
  } = useFetchClusterAddOns(clusterID, region, isHypershift);
  const {
    isPending: isAddClusterAddOnPending,
    isError: isAddClusterAddOnError,
    error: addClusterAddOnError,
    isSuccess: isAddClusterAddOnSuccess,
    mutate: addClusterAddOn,
    reset: resetAddClusterAddon,
  } = useAddClusterAddOn(region);
  const {
    isPending: isUpdateClusterAddOnPending,
    isError: isUpdateClusterAddOnError,
    error: updateClusterAddOnError,
    isSuccess: isUpdateClusterAddOnSuccess,
    mutate: updateClusterAddOn,
  } = useUpdateClusterAddOn(region);
  const {
    isPending: isDeleteClusterAddOnPending,
    isError: isDeleteClusterAddOnError,
    error: deleteClusterAddOnError,
    isSuccess: isDeleteClusterAddOnSuccess,
    mutate: deleteClusterAddOn,
  } = useDeleteClusterAddOn(region);
  const { data: quotaData } = useFetchOrganizationQuota(organization.details?.id);

  React.useEffect(() => {
    if (!isFetchClusterAddOnsLoading && !isHypershift) {
      refetchAddOns();
      refetchClusterAddOns();
    }
    dispatch(getOrganizationAndQuota());
    // Mimics componentDidMount and componentDidUnmount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (isHypershift) {
    return (
      <EmptyState headingLevel="h5" icon={CubesIcon} titleText="Coming soon">
        <EmptyStateBody>
          Add-ons will be available soon for hosted control plane clusters.
        </EmptyStateBody>
        <EmptyStateFooter>
          <EmptyStateActions>
            <Button
              variant="link"
              onClick={() => {
                document.location.hash = ClusterTabsId.OVERVIEW;
              }}
            >
              Go back to overview
            </Button>
          </EmptyStateActions>
        </EmptyStateFooter>
      </EmptyState>
    );
  }

  if ((!clusterAddOnsData || clusterAddOnsData.items.length === 0) && isFetchClusterAddOnsLoading) {
    return (
      <EmptyState>
        <EmptyStateBody>
          <div className="pf-v6-u-text-align-center">
            <Spinner size="lg" aria-label="Loading..." />
          </div>
        </EmptyStateBody>
      </EmptyState>
    );
  }

  const addOnsList = availableAddOns(
    addOnsData,
    cluster,
    clusterAddOnsData,
    organization,
    quotaData?.organizationQuota,
  );
  const hasAddOns = addOnsList.length > 0;

  if (!hasAddOns) {
    return (
      <EmptyState
        headingLevel="h5"
        icon={PlusCircleIcon}
        titleText="No add-ons available for this cluster"
      >
        {isFetchAddOnsError && <ErrorBox message="Error getting add-ons" response={addOnsError} />}

        <EmptyStateBody>There are no add-ons available for this cluster.</EmptyStateBody>
      </EmptyState>
    );
  }

  if (isFetchClusterAddOnsError) {
    return (
      <EmptyState>
        <ErrorBox message="Error getting cluster add-ons" response={clusterAddOnsError} />
      </EmptyState>
    );
  }

  return (
    <>
      {isAddClusterAddOnError && (
        <ErrorBox
          message="Error adding add-ons"
          response={addClusterAddOnError}
          showCloseBtn
          onCloseAlert={resetAddClusterAddon}
          analyticsType="error-adding-add-on"
          analyticsResourceType={analyticsResourceType}
        />
      )}
      <AddOnsDrawer
        addOnsList={addOnsList}
        clusterAddOns={clusterAddOnsData}
        cluster={cluster}
        organization={organization}
        quota={quotaData?.organizationQuota}
        addClusterAddOn={addClusterAddOn}
        isAddClusterAddOnError={isAddClusterAddOnError}
        addClusterAddOnError={addClusterAddOnError}
        isAddClusterAddOnPending={isAddClusterAddOnPending}
        updateClusterAddOn={updateClusterAddOn}
        isUpdateClusterAddOnError={isUpdateClusterAddOnError}
        updateClusterAddOnError={updateClusterAddOnError}
        isUpdateClusterAddOnPending={isUpdateClusterAddOnPending}
        deleteClusterAddOn={deleteClusterAddOn}
        isDeleteClusterAddOnPending={isDeleteClusterAddOnPending}
        isDeleteClusterAddOnError={isDeleteClusterAddOnError}
        deleteClusterAddOnError={deleteClusterAddOnError}
        isDeleteClusterAddOnSuccess={isDeleteClusterAddOnSuccess}
        isUpdateClusterAddOnSuccess={isUpdateClusterAddOnSuccess}
        isAddClusterAddOnSuccess={isAddClusterAddOnSuccess}
      />
    </>
  );
};

AddOns.propTypes = {
  clusterID: PropTypes.string.isRequired,
  cluster: PropTypes.object.isRequired,
  region: PropTypes.string,
  isHypershift: PropTypes.bool.isRequired,
};

export default AddOns;
