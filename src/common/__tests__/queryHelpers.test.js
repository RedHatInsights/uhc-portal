import * as locationUtils from '~/common/location';

import {
  buildFilterURLParams,
  buildUrlParams,
  createViewQueryObject,
  getQueryParam,
  sqlString,
} from '../queryHelpers';

test('Test buildUrlParams', () => {
  const params = { key1: 'a ', key2: 'a?' };
  expect(buildUrlParams(params)).toBe('key1=a%20&key2=a%3F');
});

test('buildFilterURLParams()', () => {
  const params = { key1: ['a', 'b'], key2: [], key3: ['c'] };
  expect(buildFilterURLParams(params)).toBe('key1=a,b&key3=c');
  expect(buildFilterURLParams({})).toBe('');
});

describe('sqlString', () => {
  it('handles empty string', () => {
    expect(sqlString('')).toBe("''");
  });

  it('doubles single quotes', () => {
    expect(sqlString("1 quote ' 3 quote'''s 2 quotes ''")).toBe(
      "'1 quote '' 3 quote''''''s 2 quotes '''''",
    );
  });

  it('does not touch other quotes', () => {
    expect(sqlString('double quote " backtick `')).toBe("'double quote \" backtick `'");
  });

  it('does not touch backslash, %, _', () => {
    // % and _ are special characters in LIKE patterns, but they're
    // not special in SQL syntax.
    // LIKE optionally lets you specify any char as an escape char but again that's
    // later interpretation of a string, it's regular char in SQL string literal.
    expect(sqlString('path/%._/100\\%')).toBe("'path/%._/100\\%'");
    expect(sqlString('\\')).toBe("'\\'");
  });
});

describe('createViewQueryObject()', () => {
  const baseViewOptions = {
    currentPage: 3,
    pageSize: 50,
    sorting: {
      sortField: null,
    },
    flags: {},
  };

  const baseResult = {
    has_filters: false,
    page: 3,
    page_size: 50,
    filter:
      "(cluster_id!='') AND (plan.id IN ('OSD', 'OSDTrial', 'OCP', 'RHMI', 'ROSA', 'RHOIC', 'MOA', 'MOA-HostedControlPlane', 'ROSA-HyperShift', 'ARO', 'OCP-AssistedInstall')) AND (status NOT IN ('Deprovisioned', 'Archived'))",
  };

  it('properly creates the query object when no filter is defined', () => {
    expect(createViewQueryObject(baseViewOptions)).toEqual(baseResult);
  });
  it('sorts correctly (with display_name column name translation)', () => {
    const viewOptions = {
      ...baseViewOptions,
      sorting: {
        sortField: 'name',
      },
    };

    expect(createViewQueryObject(viewOptions)).toEqual({
      ...baseResult,
      order: 'display_name desc',
    });

    viewOptions.sorting.isAscending = true;
    expect(createViewQueryObject(viewOptions)).toEqual({
      ...baseResult,
      order: 'display_name asc',
    });
  });

  it('sorts correctly (with custom column name)', () => {
    const viewOptions = {
      ...baseViewOptions,
      sorting: {
        sortField: 'custom',
        isAscending: false,
      },
    };

    expect(createViewQueryObject(viewOptions)).toEqual({
      ...baseResult,
      order: 'custom desc',
    });

    viewOptions.sorting.isAscending = true;
    expect(createViewQueryObject(viewOptions)).toEqual({
      ...baseResult,
      order: 'custom asc',
    });
  });

  it('sorts correctly (with multiple sort fields)', () => {
    const viewOptions = {
      ...baseViewOptions,
      sorting: {
        sortField: 'username,created_by',
        isAscending: false,
      },
    };

    expect(createViewQueryObject(viewOptions)).toEqual({
      ...baseResult,
      order: 'username desc, created_by desc',
    });
  });

  it('handles archived flag when no query is set', () => {
    const viewOptions = {
      ...baseViewOptions,
      flags: {
        showArchived: true,
      },
    };
    expect(createViewQueryObject(viewOptions)).toEqual({
      ...baseResult,
      filter:
        "(cluster_id!='') AND (plan.id IN ('OSD', 'OSDTrial', 'OCP', 'RHMI', 'ROSA', 'RHOIC', 'MOA', 'MOA-HostedControlPlane', 'ROSA-HyperShift', 'ARO', 'OCP-AssistedInstall')) AND (status IN ('Deprovisioned', 'Archived'))",
    });
  });

  it('correctly formats filter when a filter is set', () => {
    const viewOptions = {
      ...baseViewOptions,
      filter: "hello world's",
    };

    const escaped = "hello world''s";
    const expected = {
      ...baseResult,
      has_filters: !!viewOptions.filter,
      filter: `${baseResult.filter} AND (display_name ILIKE '%${escaped}%' OR external_cluster_id ILIKE '%${escaped}%' OR cluster_id ILIKE '%${escaped}%')`,
    };
    expect(createViewQueryObject(viewOptions)).toEqual(expected);
  });

  it('does not contain ILIKE when filter is not set', () => {
    const viewOptions = {
      ...baseViewOptions,
      filter: '',
    };

    const expected = {
      ...baseResult,
      has_filters: !!viewOptions.filter,
      filter: `${baseResult.filter} AND (display_name is not null OR external_cluster_id is not null OR cluster_id is not null)`,
    };
    expect(createViewQueryObject(viewOptions)).toEqual(expected);
  });

  it('correctly formats filter when plan_id filter flags are set', () => {
    const viewOptions = {
      ...baseViewOptions,
      flags: {
        subscriptionFilter: {
          plan_id: ['OCP', 'ROSA'],
        },
      },
    };
    const expected = {
      ...baseResult,
      has_filters: false,
      filter: `${baseResult.filter} AND (plan_id IN ('OCP','OCP-AssistedInstall','MOA','ROSA','MOA-HostedControlPlane'))`,
    };

    expect(createViewQueryObject(viewOptions)).toEqual(expected);
  });

  it('correctly applies filtering by username', () => {
    const username = 'test@test.com';
    const viewOptions = {
      ...baseViewOptions,
      flags: {
        showMyClustersOnly: true,
      },
    };
    const expected = {
      ...baseResult,
      has_filters: false,
      filter: `${baseResult.filter} AND (creator.username='${username}')`,
    };

    expect(createViewQueryObject(viewOptions, username)).toEqual(expected);
  });
});

describe('getQueryParam', () => {
  let locationSpy;

  beforeEach(() => {
    locationSpy = jest.spyOn(locationUtils, 'getLocation');
  });

  afterEach(() => {
    locationSpy.mockRestore();
  });

  it.each([
    ['?severityTypes=Info', 'severityTypes', 'Info'],
    ['?severityTypes=Info,Warning,Error', 'severityTypes', 'Info,Warning,Error'],
    [
      '?logTypes=Cluster version,clusterremove-high-level,Hardware/AWS global infrastructure',
      'logTypes',
      'Cluster version,clusterremove-high-level,Hardware/AWS global infrastructure',
    ],
    ['?severityTypes=Info&logTypes=clusterremove-high-level', 'severityTypes', 'Info'],
    [
      '?severityTypes=Info&logTypes=clusterremove-high-level',
      'logTypes',
      'clusterremove-high-level',
    ],
    [
      '?severityTypes=Info,Warning,Error&logTypes=clusterremove-high-level',
      'severityTypes',
      'Info,Warning,Error',
    ],
    [
      '?severityTypes=Info&logTypes=Cluster version,clusterremove-high-level,Hardware/AWS global infrastructure',
      'logTypes',
      'Cluster version,clusterremove-high-level,Hardware/AWS global infrastructure',
    ],
    [
      '?severityTypes=Info,Warning,Error&logTypes=Cluster version,clusterremove-high-level,Hardware/AWS global infrastructure',
      'severityTypes',
      'Info,Warning,Error',
    ],
  ])('search %p to be %p', (search, queryParam, expected) => {
    locationSpy.mockReturnValue({
      search,
    });
    const result = getQueryParam(queryParam);
    expect(result).toBe(expected);
  });
});
