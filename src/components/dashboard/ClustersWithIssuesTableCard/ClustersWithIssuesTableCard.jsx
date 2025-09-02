import React from 'react';
import PropTypes from 'prop-types';

import {
  Card,
  CardBody,
  CardTitle,
  EmptyState,
  EmptyStateBody,
  Skeleton,
} from '@patternfly/react-core';
import { CheckCircleIcon } from '@patternfly/react-icons/dist/esm/icons/check-circle-icon';
import {
  ActionsColumn,
  Table,
  TableVariant,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
} from '@patternfly/react-table';

import { Link } from '~/common/routing';
import { usePreviousProps } from '~/hooks/usePreviousProps';

import getClusterName from '../../../common/getClusterName';
import { createOverviewQueryObject, viewPropsChanged } from '../../../common/queryHelpers';
import { viewConstants } from '../../../redux/constants';
import ViewPaginationRow from '../../clusters/common/ViewPaginationRow/viewPaginationRow';
import { getIssuesCount } from '../overviewHelpers';

import { actionResolver } from './ClustersWithIssuesActionResolver';

const ClustersWithIssuesTableCard = (props) => {
  const prevProps = usePreviousProps(props);

  React.useEffect(() => {
    const { getUnhealthyClusters, viewOptions } = props;
    if (prevProps && viewPropsChanged(viewOptions, prevProps.viewOptions)) {
      getUnhealthyClusters(createOverviewQueryObject(viewOptions));
    }
  }, [props, prevProps]);

  const { unhealthyClusters, viewOptions } = props;
  if (unhealthyClusters.fulfilled && unhealthyClusters.subscriptions.length === 0) {
    return (
      <Card className="ocm-overview-clusters__card">
        <CardTitle>Clusters with issues</CardTitle>
        <CardBody>
          <EmptyState status="success" icon={CheckCircleIcon}>
            <EmptyStateBody>No issues detected</EmptyStateBody>
          </EmptyState>
        </CardBody>
      </Card>
    );
  }

  const clusterWithIssuesRowrenderer = (subscription) => {
    const resolver = unhealthyClusters.pending ? undefined : () => actionResolver(subscription);

    return (
      <Tr key={subscription.id}>
        <Td>
          <Link to={`/details/s/${subscription.id}`}>{getClusterName({ subscription })}</Link>
        </Td>
        <Td textCenter>
          <span>{getIssuesCount(subscription)}</span>
        </Td>
        <Td isActionCell>{resolver ? <ActionsColumn items={resolver()} /> : null}</Td>
      </Tr>
    );
  };

  const showSkeleton =
    unhealthyClusters.pending &&
    unhealthyClusters.subscriptions &&
    unhealthyClusters.subscriptions.length > 0;

  const tableColumns = [
    { title: 'Name' },
    { title: 'Issues detected', textCenter: true },
    { title: '', screenReaderText: 'Actions' },
  ];

  const columnCellsRenderer = () => (
    <Thead>
      <Tr>
        {tableColumns.map((header) => (
          <Th screenReaderText={header.screenReaderText} textCenter={header.textCenter}>
            {header.title}
          </Th>
        ))}
      </Tr>
    </Thead>
  );

  const skeletonRowsRenderer = () =>
    Array.from({ length: viewOptions.pageSize }, (_, index) => (
      <Tr key={`skeleton-${index}`}>
        <Td colSpan={tableColumns.length}>
          <Skeleton screenreaderText="Loading..." />
        </Td>
      </Tr>
    ));

  return (
    <Card className="ocm-overview-clusters__card">
      <CardTitle>Clusters with issues</CardTitle>
      <CardBody>
        <Table
          className="clusters-with-issues"
          aria-label="Clusters with issues"
          variant={TableVariant.compact}
        >
          {columnCellsRenderer()}
          <Tbody>
            {showSkeleton
              ? skeletonRowsRenderer()
              : unhealthyClusters.subscriptions.map((subscription) =>
                  clusterWithIssuesRowrenderer(subscription),
                )}
          </Tbody>
        </Table>
        <ViewPaginationRow
          viewType={viewConstants.OVERVIEW_VIEW}
          currentPage={viewOptions.currentPage}
          pageSize={viewOptions.pageSize}
          totalCount={viewOptions.totalCount}
          totalPages={viewOptions.totalPages}
          variant="bottom"
        />
      </CardBody>
    </Card>
  );
};

ClustersWithIssuesTableCard.propTypes = {
  unhealthyClusters: PropTypes.shape({
    subscriptions: PropTypes.array,
    pending: PropTypes.bool,
    fulfilled: PropTypes.bool,
  }).isRequired,
  viewOptions: PropTypes.shape({
    currentPage: PropTypes.number,
    pageSize: PropTypes.number,
    totalCount: PropTypes.number,
    totalPages: PropTypes.number,
  }).isRequired,
  getUnhealthyClusters: PropTypes.func.isRequired,
};

export default ClustersWithIssuesTableCard;
