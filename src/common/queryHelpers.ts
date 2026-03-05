import isEmpty from 'lodash/isEmpty';
import isEqual from 'lodash/isEqual';

import { GetClusterHistoryParams } from '~/services/serviceLogService';

import { ViewOptions } from '../types/types';

import { allowedProducts, productFilterOptions } from './subscriptionTypes';

type QueryObject = { [key: string]: string | number | boolean };

const viewPropsChanged = (nextViewOptions: ViewOptions, currentViewOptions: ViewOptions): boolean =>
  nextViewOptions.currentPage !== currentViewOptions.currentPage ||
  nextViewOptions.pageSize !== currentViewOptions.pageSize ||
  !isEqual(nextViewOptions.sorting, currentViewOptions.sorting) ||
  !isEqual(nextViewOptions.filter, currentViewOptions.filter) ||
  !isEqual(nextViewOptions.flags, currentViewOptions.flags);

// The backend accepts queries in https://github.com/yaacov/tree-search-language syntax,
// which is effectively a subset of SQL.
// This requires the UI to construct the syntax correctly (e.g. escape singlequotes).
// It also means that the query we send to the backend is quite complicated.

const sqlString = (s: string) => {
  // escape ' characters by doubling
  const escaped = s.replace(/'/g, "''");
  return `'${escaped}'`;
};

const getOrder = (sortField: string, isAscending: boolean) => {
  const direction = isAscending ? 'asc' : 'desc';
  // i.e. turns 'username,created_by' into 'username asc, created_by asc'
  return sortField
    .split(',')
    .map((f) => `${f.trim()} ${direction}`)
    .join(', ');
};

const createViewQueryObject = (viewOptions?: ViewOptions, username?: string): QueryObject => {
  const queryObject: QueryObject = {};

  if (viewOptions) {
    queryObject.page = viewOptions.currentPage;
    queryObject.page_size = viewOptions.pageSize;
    queryObject.has_filters = !!viewOptions.filter;

    const { sortField, isAscending } = viewOptions.sorting;
    if (sortField !== null) {
      const direction = isAscending ? 'asc' : 'desc';
      if (sortField === 'name') {
        queryObject.order = `display_name ${direction}`;
      } else {
        queryObject.order = getOrder(sortField, isAscending);
      }
    }

    const clauses: string[] = []; // will be joined with AND

    // base filter: filter out clusters without IDs
    clauses.push("cluster_id!=''");

    // Filter out subscription plans that do not represent clusters.
    clauses.push(`plan.id IN (${allowedProducts.map(sqlString).join(', ')})`);

    // handle archived flag
    if (viewOptions.flags.showArchived) {
      clauses.push("status IN ('Deprovisioned', 'Archived')");
    } else {
      clauses.push("status NOT IN ('Deprovisioned', 'Archived')");
    }

    // handle my-clusters-only flag
    if (viewOptions.flags.showMyClustersOnly) {
      clauses.push(`creator.username='${username}'`);
    }

    if (typeof viewOptions.filter === 'string') {
      if (viewOptions.filter.length === 0) {
        clauses.push(
          `display_name is not null OR external_cluster_id is not null OR cluster_id is not null`,
        );
      } else {
        // If we got a search string from the user, format it as a LIKE query.
        const likePattern = sqlString(`%${viewOptions.filter}%`);
        clauses.push(
          `display_name ILIKE ${likePattern} OR external_cluster_id ILIKE ${likePattern} OR cluster_id ILIKE ${likePattern}`,
        );
      }
    }

    if (!isEmpty(viewOptions.flags.subscriptionFilter)) {
      // We got flags for filtering according to specific subscription properties
      // subscriptionFilter is an object in the form of { key: ["possible", "values"] }.
      // Currently the only supported key is `plan_id`.
      const items = viewOptions.flags.subscriptionFilter.plan_id;
      if (!isEmpty(items)) {
        // The values we got are internal normalizedProducts values,
        // but we have to query backend with pre-normalization values.
        const backendValues = items.flatMap(
          (v: unknown) => productFilterOptions.find((opt) => opt.key === v)?.plansToQuery,
        );

        const quotedItems = backendValues.map(sqlString);
        clauses.push(`plan_id IN (${quotedItems.join(',')})`);
      }
    }
    queryObject.filter = clauses
      .map((c) => `(${c})`)
      .join(' AND ')
      .trim();
  }

  return queryObject;
};

const createServiceLogQueryObject = (
  viewOptions?: ViewOptions,
  format?: GetClusterHistoryParams['format'],
  page?: number,
  pageSize?: number,
): GetClusterHistoryParams => {
  const queryObject: GetClusterHistoryParams = {
    page: 1,
    page_size: -1,
    format,
  };

  if (viewOptions) {
    if (page) {
      queryObject.page = page;
    } else {
      queryObject.page = viewOptions.currentPage;
    }

    if (pageSize) {
      queryObject.page_size = pageSize;
    } else {
      queryObject.page_size = viewOptions.pageSize;
    }

    const { sortField, isAscending } = viewOptions.sorting;
    if (sortField !== null) {
      queryObject.order = getOrder(sortField, isAscending);
    }

    const clauses: string[] = []; // will be joined with AND

    // If we got a search string from the user, format it as an ILIKE query.
    if (viewOptions.filter && typeof viewOptions.filter !== 'string') {
      const { description, loggedBy, timestampFrom, timestampTo } = viewOptions.filter;
      if (description) {
        const likePattern = sqlString(`%${description}%`);
        clauses.push(`(description ILIKE ${likePattern} OR summary ILIKE ${likePattern})`);
      }
      if (loggedBy) {
        const likePattern = sqlString(`%${loggedBy}%`);
        clauses.push(
          `(username ILIKE ${likePattern} OR (username = '' AND created_by ILIKE ${likePattern}))`,
        );
      }
      if (timestampFrom) {
        clauses.push(`timestamp ${timestampFrom}`);
      }
      if (timestampTo) {
        clauses.push(`timestamp ${timestampTo}`);
      }
    }

    if (viewOptions.flags) {
      const { severityTypes = [], logTypes = [] } = viewOptions.flags.conditionalFilterFlags;
      if (severityTypes.length > 0) {
        const quotedItems = severityTypes.map(sqlString);
        clauses.push(`severity IN (${quotedItems.join(',')})`);
      }
      if (logTypes.length > 0) {
        const quotedItems = logTypes.map(sqlString);
        clauses.push(`log_type IN (${quotedItems.join(',')})`);
      }
    }

    if (clauses.length > 0) {
      queryObject.filter = clauses
        .map((c) => `(${c})`)
        .join(' AND ')
        .trim();
    }
  }

  return queryObject;
};

const createOverviewQueryObject = (
  viewOptions?: ViewOptions,
  queryObj?: QueryObject,
): QueryObject => {
  const queryObject: QueryObject = {
    order: 'display_name asc',
    ...queryObj,
  };

  if (viewOptions) {
    queryObject.page = viewOptions.currentPage;
    queryObject.page_size = viewOptions.pageSize;
  }

  return queryObject;
};

const buildUrlParams = (params: QueryObject): string =>
  Object.keys(params)
    .map((key) => `${key}=${encodeURIComponent(params[key])}`)
    .join('&');

/**
 * Create URL params for the cluster list filter.
 * The resulting filters are not escaped, comma separated, and empty arrays are omitted.
 *
 * For example:
 * ```
 * buildFilterURLParams({ a: ['a', 'b'], c: [], d: ['e'] }) = 'a=a,b&d=e'
 * ```
 * @param {Object} params
 */
const buildFilterURLParams = (params: { [key: string]: (string | number | boolean)[] }): string =>
  encodeURI(
    Object.keys(params)
      .map((key) => !isEmpty(params[key]) && `${key}=${params[key].join(',')}`)
      .filter(Boolean)
      .join('&'),
  );

const getQueryParam = (param: string): string | undefined => {
  const searchParams = new URLSearchParams(window.location.search);
  return searchParams.get(param) ?? undefined;
};

const deleteQueryParam = (param: string): void => {
  const url = new URL(window.location.href);
  url.searchParams.delete(param);
  window.history.replaceState({}, '', url.toString());
};

export {
  buildFilterURLParams,
  buildUrlParams,
  createViewQueryObject,
  createServiceLogQueryObject,
  createOverviewQueryObject,
  viewPropsChanged,
  sqlString,
  getQueryParam,
  deleteQueryParam,
};
