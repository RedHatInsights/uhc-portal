import React from 'react';
import isEmpty from 'lodash/isEmpty';
import size from 'lodash/size';
import { useDispatch } from 'react-redux';

import {
  Card,
  CardBody,
  CardHeader,
  CardTitle,
  EmptyState,
  PageSection,
  PaginationVariant,
  Spinner,
  Title,
} from '@patternfly/react-core';
import SearchIcon from '@patternfly/react-icons/dist/esm/icons/search-icon';

import { useNavigate } from '~/common/routing';
import {
  refetchClusterLogsQueries,
  useFetchClusterLogs,
} from '~/queries/ClusterLogsQueries/useFetchClusterLogs';
import { viewActions } from '~/redux/actions/viewOptionsActions';
import { useGlobalState } from '~/redux/hooks';
import { ClusterLog } from '~/types/service_logs.v1';
import { ViewSorting } from '~/types/types';

import helpers from '../../../../../common/helpers';
import {
  buildFilterURLParams,
  getQueryParam,
  viewPropsChanged,
} from '../../../../../common/queryHelpers';
import { viewConstants } from '../../../../../redux/constants';
import ErrorBox from '../../../../common/ErrorBox';
import LiveDateFormat from '../../../../common/LiveDateFormat/LiveDateFormat';

import {
  dateFormat,
  dateParse,
  getTimestampFrom,
  onDateChangeFromFilter,
} from './toolbar/ClusterLogsDatePicker';
import { ClusterLogsErrorType } from './cluserLogsHelper';
import { LOG_TYPES, SEVERITY_TYPES } from './clusterLogConstants';
import ClusterLogsPagination from './ClusterLogsPagination';
import LogTable from './LogTable';
import ClusterLogsToolbar from './toolbar';

type ClusterLogsProps = {
  refreshEvent: {
    type: string;
    reset: () => void;
  };
  clusterID?: string;
  externalClusterID?: string;
  region?: string | undefined;
  createdAt?: string;
  isVisible?: boolean;
  findGcpOrgPolicyWarning?: (logs?: ClusterLog[]) => void;
};

const ClusterLogs = ({
  externalClusterID,
  clusterID,
  region,
  createdAt,
  refreshEvent,
  isVisible,
  findGcpOrgPolicyWarning,
}: ClusterLogsProps) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const viewType = viewConstants.CLUSTER_LOGS_VIEW;
  const viewOptions = useGlobalState((state) => state.viewOptions[viewType]);

  const [hasChanged, setHasChanged] = React.useState(false);
  const [previousViewOptions, setPreviousViewOptions] = React.useState(viewOptions);
  const [ignoreErrors, setIgnoreErrors] = React.useState(false);
  const [isPendingNoData, setIsPendingNoData] = React.useState(false);

  const [page, setPage] = React.useState(1);
  const [perPage, setPerPage] = React.useState(20);

  const {
    data: logsData,
    isError,
    error: clusterLogsError,
    dataUpdatedAt,
    isPending,
  } = useFetchClusterLogs(externalClusterID, clusterID, viewOptions, region, page, perPage);

  const logs = logsData?.items;
  const error = clusterLogsError as ClusterLogsErrorType;
  const fetchedClusterLogsAt = new Date(dataUpdatedAt);

  const logsTotal = logsData?.total || 0;
  const itemsStart = page && perPage && logsTotal > 0 ? (page - 1) * perPage + 1 : 0;
  const itemsEnd = page && perPage ? Math.min(page * perPage, logsTotal) : 0;

  const onSetPage = (
    _event: React.MouseEvent | React.KeyboardEvent | MouseEvent,
    newPage: number,
  ) => {
    setPage(newPage);
  };

  const onPerPageSelect = (
    _event: React.MouseEvent | React.KeyboardEvent | MouseEvent,
    newPerPage: number,
    newPage: number,
  ) => {
    setPerPage(newPerPage);
    setPage(newPage);
  };

  React.useEffect(() => {
    const severityTypes = getQueryParam('severityTypes') || '';
    const logTypes = getQueryParam('logTypes') || '';
    if (!isEmpty(severityTypes) || !isEmpty(logTypes)) {
      setHasChanged(true);
      dispatch(
        viewActions.onListFlagsSet(
          'conditionalFilterFlags',
          {
            severityTypes: !isEmpty(severityTypes)
              ? severityTypes.split(',').filter((type) => SEVERITY_TYPES.includes(type))
              : [],
            logTypes: !isEmpty(logTypes)
              ? logTypes.split(',').filter((type) => LOG_TYPES.includes(type))
              : [],
          },
          viewType,
        ),
      );
    }

    let filter;

    const loggedBy = getQueryParam('loggedBy') || '';
    const description = getQueryParam('description') || '';
    const timestampFrom = getQueryParam('timestampFrom') || '';
    const timestampTo = getQueryParam('timestampTo') || '';
    if (
      !isEmpty(loggedBy) ||
      !isEmpty(description) ||
      !isEmpty(timestampFrom) ||
      !isEmpty(timestampTo)
    ) {
      filter = { loggedBy, description, timestampFrom, timestampTo };
    }

    if (createdAt && !isEmpty(timestampFrom)) {
      // Apply a timestamp filter by default
      const minDate = dateParse(createdAt);
      const { symbol, date } = onDateChangeFromFilter(dateFormat(getTimestampFrom(minDate)));
      filter = {
        ...(filter ?? {}),
        timestampFrom: `${symbol} '${date}'`,
      };
    }

    if (filter) {
      setHasChanged(true);
      dispatch(viewActions.onListFilterSet(filter, viewType));
    }
  }, [createdAt, dispatch, viewType]);

  React.useEffect(() => {
    if (
      viewPropsChanged(viewOptions, previousViewOptions) &&
      (!isPending || (!hasChanged && (externalClusterID || clusterID)))
    ) {
      refetchClusterLogsQueries();
      setPreviousViewOptions(viewOptions);
    }
  }, [
    dispatch,
    isPending,
    hasChanged,
    externalClusterID,
    clusterID,
    viewOptions,
    previousViewOptions,
  ]);

  React.useEffect(() => {
    // These errors are present during cluster install
    // Instead of showing an error, display "No cluster log entries found"
    if (error) {
      if (error?.errorCode === 403 || error?.errorCode === 404) setIgnoreErrors(true);
    }
  }, [error]);

  React.useEffect(() => {
    const hasNoFilters = isEmpty(viewOptions.filter) && helpers.nestedIsEmpty(viewOptions.flags);
    setIsPendingNoData(!size(logs) && isPending && hasNoFilters);
  }, [logs, isPending, viewOptions.filter, viewOptions.flags]);

  React.useEffect(() => {
    if (isVisible === true) {
      const filters: {
        [flag: string]: string[];
      } = Object.entries(viewOptions.filter)
        .filter(
          (e) => ['description', 'loggedBy', 'timestampFrom', 'timestampTo'].includes(e[0]) && e[1],
        )
        .reduce((acc, curr) => ({ ...acc, [`${curr[0]}`]: [curr[1]] }), {});
      navigate(
        {
          hash: '#clusterHistory',
          search: buildFilterURLParams({
            ...filters,
            ...(viewOptions.flags.conditionalFilterFlags || {}),
          }),
        },
        { replace: true },
      );
    }
  }, [isVisible, viewOptions.flags.conditionalFilterFlags, viewOptions.filter, navigate]);

  React.useEffect(() => {
    if (findGcpOrgPolicyWarning) {
      findGcpOrgPolicyWarning(logs);
    }
  }, [logs, findGcpOrgPolicyWarning]);

  return (
    <Card className="ocm-c-overview-cluster-history__card">
      <CardHeader
        actions={{
          actions: (
            <>
              Updated &nbsp;
              {fetchedClusterLogsAt && !isPending ? (
                <LiveDateFormat timestamp={fetchedClusterLogsAt.getTime()} />
              ) : (
                <Spinner size="sm" aria-label="Loading..." />
              )}
            </>
          ),
          hasNoOffset: false,
        }}
        className="ocm-c-overview-cluster-history__card--header"
      >
        <CardTitle className="ocm-c-overview-cluster-history__card--header">
          <Title headingLevel="h2" className="card-title" data-testid="cluster_history_title">
            Cluster history
          </Title>
        </CardTitle>
      </CardHeader>
      <CardBody className="ocm-c-overview-cluster-history__card--body">
        {isError && !ignoreErrors && (
          <ErrorBox
            message="Error retrieving cluster logs"
            response={{
              errorMessage: error.errorMessage,
              operationID: error.operationID,
            }}
          />
        )}

        <ClusterLogsToolbar
          view={viewType}
          externalClusterID={externalClusterID}
          isPendingNoData={isPendingNoData}
          clusterID={clusterID}
          createdAt={createdAt}
          logs={logs?.length}
          itemCount={logsData?.total || 0}
          page={page}
          perPage={perPage}
          itemsStart={itemsStart}
          itemsEnd={itemsEnd}
          onSetPage={onSetPage}
          onPerPageSelect={onPerPageSelect}
          region={region}
        />
        {isError && !size(logs) && ignoreErrors ? (
          <PageSection hasBodyWrapper={false}>
            <EmptyState
              headingLevel="h4"
              icon={SearchIcon}
              titleText="No cluster log entries found"
            />
          </PageSection>
        ) : (
          <>
            <LogTable
              pending={isPending}
              logs={logs}
              setSorting={(sorting: ViewSorting) =>
                dispatch(viewActions.onListSortBy(sorting, viewType))
              }
              refreshEvent={refreshEvent}
            />

            <ClusterLogsPagination
              itemCount={logsData?.total || 0}
              isDisabled={isPendingNoData}
              page={page}
              perPage={perPage}
              itemsStart={itemsStart}
              itemsEnd={itemsEnd}
              variant={PaginationVariant.bottom}
              onSetPage={onSetPage}
              onPerPageSelect={onPerPageSelect}
            />
          </>
        )}
      </CardBody>
    </Card>
  );
};

export default ClusterLogs;
