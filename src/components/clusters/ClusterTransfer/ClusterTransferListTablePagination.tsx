import React from 'react';

import ViewPaginationRow from '~/components/clusters/common/ViewPaginationRow/viewPaginationRow';
import { ViewOptions } from '~/types/types';

type ClusterTransferListTablePaginationProps = {
  viewType: string;
  viewOptions: ViewOptions;
  isDisabled?: boolean;
  variant: 'bottom' | 'top';
};
const ClusterTransferListTablePagination = ({
  viewType,
  viewOptions,
  isDisabled,
  variant,
}: ClusterTransferListTablePaginationProps) => (
  <ViewPaginationRow
    viewType={viewType}
    currentPage={viewOptions.currentPage}
    pageSize={viewOptions.pageSize}
    totalCount={viewOptions.totalCount}
    totalPages={viewOptions.totalPages}
    variant={variant}
    isDisabled={isDisabled || viewOptions.totalCount === 0}
  />
);

export default ClusterTransferListTablePagination;
