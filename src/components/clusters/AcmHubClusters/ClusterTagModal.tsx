import React, { useEffect, useMemo } from 'react';

import {
  Button,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  Toolbar,
  ToolbarContent,
  ToolbarItem,
} from '@patternfly/react-core';
import { useAddNotification } from '@redhat-cloud-services/frontend-components-notifications';

import { ACM_HUB_PROPERTY_KEY, ACM_HUB_PROPERTY_VALUE } from '~/common/acmHubConstants';
import { ONLY_MY_CLUSTERS_TOGGLE_CLUSTERS_LIST } from '~/common/localStorageConstants';
import ErrorBox from '~/components/common/ErrorBox';
import { useTagAcmHub } from '~/queries/AcmHubQueries/useTagAcmHub';

import { useFetchClusters } from '../../../queries/ClusterListQueries/useFetchClusters';
import { CLUSTERS_VIEW } from '../../../redux/constants/viewConstants';
import { isRestrictedEnv } from '../../../restrictedEnv';
import ClusterListFilterDropdown from '../ClusterListMultiRegion/components/ClusterListFilterDropdown';
import ClusterListTable from '../ClusterListMultiRegion/components/ClusterListTable';
import { PaginationRow } from '../ClusterListMultiRegion/components/PaginationRow';
import ViewOnlyMyClustersToggle from '../ClusterListMultiRegion/components/ViewOnlyMyClustersToggle';
import ClusterListFilter from '../common/ClusterListFilter';

type ClusterTagModalProps = {
  closeModal: () => void;
};

export const ClusterTagModal = ({ closeModal }: ClusterTagModalProps) => {
  const addNotification = useAddNotification();
  const { mutateAsync: tagAcmHubAsync } = useTagAcmHub();

  const { isLoading, data, refetch, isFetched, isClustersDataPending } = useFetchClusters(
    false,
    true,
  );

  const [selectedClusters, setSelectedClusters] = React.useState<any[]>([]);
  const [currentPage, setCurrentPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(10);
  const [taggingErrors, setTaggingErrors] = React.useState<
    Array<{ cluster: string; error: string }>
  >([]);
  const [isProcessing, setIsProcessing] = React.useState(false);

  const allClusters = useMemo(() => data?.items || [], [data?.items]);
  const clustersTotal = allClusters.length;

  // Paginate clusters locally
  const paginatedClusters = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return allClusters.slice(startIndex, endIndex);
  }, [allClusters, currentPage, pageSize]);

  const itemsStart = clustersTotal > 0 ? (currentPage - 1) * pageSize + 1 : 0;
  const itemsEnd = Math.min(currentPage * pageSize, clustersTotal);

  const onPageChange = React.useCallback((_event: any, page: number) => {
    setCurrentPage(page);
  }, []);

  const onPerPageChange = React.useCallback((_event: any, newPerPage: number, newPage: number) => {
    setPageSize(newPerPage);
    setCurrentPage(newPage);
  }, []);

  // Reset to page 1 if current page exceeds total pages
  useEffect(() => {
    const totalPages = Math.ceil(clustersTotal / pageSize);
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(totalPages);
    }
  }, [clustersTotal, pageSize, currentPage]);

  const isPendingNoData = !data?.items?.length && (isLoading || !isFetched);

  const handleTagClusters = async () => {
    if (selectedClusters.length === 0) return;

    setIsProcessing(true);
    setTaggingErrors([]);

    const tagPromises = selectedClusters.map(async (cluster) => {
      const properties = cluster.managed ? cluster.properties : cluster.cluster_id_properties;

      const isCurrentlyTagged = properties?.[ACM_HUB_PROPERTY_KEY] === ACM_HUB_PROPERTY_VALUE;

      // Only tag if not already tagged
      if (!isCurrentlyTagged) {
        try {
          await tagAcmHubAsync({
            clusterID: cluster.id,
            region: cluster?.subscription?.rh_region_id,
            tag: true,
          });
          return { success: true, cluster };
        } catch (error: any) {
          return { success: false, cluster, error };
        }
      }

      // Already tagged, count as success
      return { success: true, cluster };
    });

    const results = await Promise.all(tagPromises);

    const errors = results
      .filter((result) => !result.success)
      .map((result) => ({
        cluster: result.cluster.display_name || result.cluster.id,
        error: (result as any).error?.message || 'Unknown error',
      }));

    const successCount = results.filter((result) => result.success).length;

    setIsProcessing(false);

    if (errors.length > 0) {
      setTaggingErrors(errors);
    }

    if (successCount > 0) {
      addNotification({
        variant: 'success',
        title: `Successfully tagged ${successCount} cluster${successCount > 1 ? 's' : ''} as ACM Hub`,
        dismissable: true,
      });

      // Refresh the cluster list
      refetch();

      // If all succeeded, close the modal
      if (errors.length === 0) {
        closeModal();
      }
    }
  };

  return (
    <Modal isOpen onClose={closeModal} variant="large">
      <ModalHeader title="Tag hub clusters" />
      <ModalBody>
        {taggingErrors.length > 0 ? (
          <ErrorBox
            message="Some clusters could not be tagged"
            response={{
              errorDetails: taggingErrors.map((err) => `${err.cluster}: ${err.error}`) as any,
            }}
            isExpandable
            hideOperationID
            forceAsAlert
          />
        ) : null}
        <Toolbar id="acm-hub-cluster-list-toolbar">
          <ToolbarContent>
            <ToolbarItem className="ocm-c-toolbar__item-cluster-filter-list">
              <ClusterListFilter isDisabled={isPendingNoData} view={CLUSTERS_VIEW} />
            </ToolbarItem>
            {isRestrictedEnv() ? null : (
              <ToolbarItem
                className="ocm-c-toolbar__item-cluster-list-filter-dropdown"
                data-testid="cluster-list-filter-dropdown"
              >
                {/* Cluster type */}
                <ClusterListFilterDropdown view={CLUSTERS_VIEW} isDisabled={isLoading} />
              </ToolbarItem>
            )}
            <ViewOnlyMyClustersToggle
              view={CLUSTERS_VIEW}
              bodyContent="Show only the clusters you previously created, or all clusters in your organization."
              localStorageKey={ONLY_MY_CLUSTERS_TOGGLE_CLUSTERS_LIST}
            />
            <ToolbarItem align={{ default: 'alignEnd' }} variant="pagination">
              <PaginationRow
                currentPage={currentPage}
                pageSize={pageSize}
                itemCount={clustersTotal}
                variant="top"
                isDisabled={isPendingNoData}
                itemsStart={itemsStart}
                itemsEnd={itemsEnd}
                onPerPageSelect={onPerPageChange as any}
                onPageChange={onPageChange}
              />
            </ToolbarItem>
          </ToolbarContent>
        </Toolbar>
        <ClusterListTable
          activeSortIndex="created_at"
          activeSortDirection="asc"
          openModal={() => {}}
          clusters={paginatedClusters}
          isPending={isPendingNoData}
          isClustersDataPending={isClustersDataPending}
          refreshFunc={refetch}
          showCheckboxes
          selectedClusters={selectedClusters}
          onSelectionChange={setSelectedClusters}
        />
        <PaginationRow
          currentPage={currentPage}
          pageSize={pageSize}
          itemCount={clustersTotal}
          variant="bottom"
          isDisabled={isPendingNoData}
          itemsStart={itemsStart}
          itemsEnd={itemsEnd}
          onPerPageSelect={onPerPageChange as any}
          onPageChange={onPageChange}
        />
      </ModalBody>
      <ModalFooter>
        <Button
          variant="primary"
          onClick={handleTagClusters}
          isDisabled={selectedClusters.length === 0 || isProcessing}
          isLoading={isProcessing}
        >
          {isProcessing
            ? 'Tagging...'
            : `Tag ${selectedClusters.length > 0 ? `(${selectedClusters.length})` : ''}`}
        </Button>
        <Button variant="secondary" onClick={closeModal} isDisabled={isProcessing}>
          {taggingErrors.length > 0 && !isProcessing ? 'Close' : 'Cancel'}
        </Button>
      </ModalFooter>
    </Modal>
  );
};
