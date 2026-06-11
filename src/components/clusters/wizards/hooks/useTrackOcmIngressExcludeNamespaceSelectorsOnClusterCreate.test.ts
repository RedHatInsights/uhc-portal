import { ocmResourceTypeByProduct, trackEvents } from '~/common/analytics';
import { FieldId } from '~/components/clusters/wizards/osd/constants';
import useAnalytics from '~/hooks/useAnalytics';
import { useGlobalState } from '~/redux/hooks/useGlobalState';
import { renderHook, waitFor } from '~/testUtils';

import { useTrackOcmIngressExcludeNamespaceSelectorsOnClusterCreate } from './useTrackOcmIngressExcludeNamespaceSelectorsOnClusterCreate';

jest.mock('~/redux/hooks/useGlobalState');
jest.mock('~/hooks/useAnalytics', () => ({
  __esModule: true,
  default: jest.fn(),
}));

const useGlobalStateMock = useGlobalState as jest.MockedFunction<typeof useGlobalState>;
const useAnalyticsMock = useAnalytics as jest.MockedFunction<typeof useAnalytics>;

describe('useTrackOcmIngressExcludeNamespaceSelectorsOnClusterCreate', () => {
  const track = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    useAnalyticsMock.mockReturnValue(track);
    const createdCluster = { fulfilled: false };
    useGlobalStateMock.mockImplementation((selector) =>
      selector({ clusters: { createdCluster } } as never),
    );
  });

  it('does not track while cluster create has not fulfilled', () => {
    renderHook(() =>
      useTrackOcmIngressExcludeNamespaceSelectorsOnClusterCreate(
        {
          [FieldId.DefaultRouterExcludeNamespaceSelectors]: [{ key: 'env', value: 'prod' }],
        },
        'OSD',
      ),
    );

    expect(track).not.toHaveBeenCalled();
  });

  it('does not track when create fulfilled but no exclude-namespace selectors are configured', () => {
    const createdCluster = { fulfilled: true };
    useGlobalStateMock.mockImplementation((selector) =>
      selector({ clusters: { createdCluster } } as never),
    );

    renderHook(() =>
      useTrackOcmIngressExcludeNamespaceSelectorsOnClusterCreate(
        {
          [FieldId.DefaultRouterExcludeNamespaceSelectors]: [{ key: '', value: '' }],
        },
        'OSD',
      ),
    );

    expect(track).not.toHaveBeenCalled();
  });

  it('tracks once when create fulfilled and selectors are configured', async () => {
    const createdCluster = { fulfilled: true };
    useGlobalStateMock.mockImplementation((selector) =>
      selector({ clusters: { createdCluster } } as never),
    );

    renderHook(() =>
      useTrackOcmIngressExcludeNamespaceSelectorsOnClusterCreate(
        {
          [FieldId.DefaultRouterExcludeNamespaceSelectors]: [{ key: 'env', value: 'prod' }],
        },
        'OSD',
      ),
    );

    await waitFor(() => {
      expect(track).toHaveBeenCalledTimes(1);
    });
    expect(track).toHaveBeenCalledWith(trackEvents.OcmIngressExcludeNamespaceSelectorsSet, {
      resourceType: (ocmResourceTypeByProduct as Record<string, string>).OSD,
      customProperties: { cluster_creation: true },
    });
  });

  it('tracks when fulfilled flips to true after mount', async () => {
    const createdCluster = { fulfilled: false };
    useGlobalStateMock.mockImplementation((selector) =>
      selector({ clusters: { createdCluster } } as never),
    );

    const { rerender } = renderHook(() =>
      useTrackOcmIngressExcludeNamespaceSelectorsOnClusterCreate(
        {
          [FieldId.DefaultRouterExcludeNamespaceSelectors]: [{ key: 'env', value: 'prod' }],
        },
        'OSD',
      ),
    );

    expect(track).not.toHaveBeenCalled();

    useGlobalStateMock.mockImplementation((selector) =>
      selector({ clusters: { createdCluster: { fulfilled: true } } } as never),
    );
    rerender();

    await waitFor(() => {
      expect(track).toHaveBeenCalledTimes(1);
    });
  });

  it('tracks when selectors are configured after create has already fulfilled', async () => {
    const createdCluster = { fulfilled: true };
    useGlobalStateMock.mockImplementation((selector) =>
      selector({ clusters: { createdCluster } } as never),
    );

    const emptySelectors = {
      [FieldId.DefaultRouterExcludeNamespaceSelectors]: [{ key: '', value: '' }],
    };
    const withSelectors = {
      [FieldId.DefaultRouterExcludeNamespaceSelectors]: [{ key: 'env', value: 'prod' }],
    };

    const { rerender } = renderHook(
      ({ formValues }: { formValues: typeof emptySelectors }) =>
        useTrackOcmIngressExcludeNamespaceSelectorsOnClusterCreate(formValues, 'OSD'),
      { initialProps: { formValues: emptySelectors } },
    );

    expect(track).not.toHaveBeenCalled();

    rerender({ formValues: withSelectors });

    await waitFor(() => {
      expect(track).toHaveBeenCalledTimes(1);
    });
  });

  it('does not track again on rerender after the event was already sent', async () => {
    const createdCluster = { fulfilled: true };
    useGlobalStateMock.mockImplementation((selector) =>
      selector({ clusters: { createdCluster } } as never),
    );

    const values = {
      [FieldId.DefaultRouterExcludeNamespaceSelectors]: [{ key: 'env', value: 'prod' }],
    };

    const { rerender } = renderHook(
      ({ formValues }: { formValues: typeof values }) =>
        useTrackOcmIngressExcludeNamespaceSelectorsOnClusterCreate(formValues, 'OSD'),
      { initialProps: { formValues: values } },
    );

    await waitFor(() => {
      expect(track).toHaveBeenCalledTimes(1);
    });

    rerender({ formValues: values });

    await waitFor(() => {
      expect(track).toHaveBeenCalledTimes(1);
    });
  });
});
