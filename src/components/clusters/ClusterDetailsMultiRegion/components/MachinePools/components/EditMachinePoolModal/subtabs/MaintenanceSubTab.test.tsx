import { MP_ADDITIONAL_MAINTENANCE_VALUES } from '~/queries/featureGates/featureConstants';
import { mockUseFeatureGate, render, renderHook, screen } from '~/testUtils';
import { ClusterFromSubscription } from '~/types/types';

import { useMaintenanceSubTab } from './MaintenanceSubTab';

jest.mock('formik', () => ({
  ...jest.requireActual('formik'),
  useField: jest.fn().mockReturnValue([
    {
      name: 'auto_repair',
      value: false,
    },
    {
      name: 'maxSurge',
      value: 1,
      onChange: jest.fn(),
    },
    {
      name: 'maxUnavailable',
      value: 0,
      onChange: jest.fn(),
    },
    {
      name: 'nodeDrainTimeout',
      value: 0,
      onChange: jest.fn(),
    },
    {
      setValue: jest.fn(),
      setTouched: jest.fn(),
      setError: jest.fn(),
    },
  ]),
}));

describe('MaintenanceSubTab', () => {
  const mockHypershiftCluster: ClusterFromSubscription = {
    id: 'test-cluster',
    cloud_provider: { id: 'aws' },
    hypershift: { enabled: true },
  } as ClusterFromSubscription;

  const mockClassicCluster: ClusterFromSubscription = {
    id: 'test-cluster',
    cloud_provider: { id: 'aws' },
    hypershift: { enabled: false },
  } as ClusterFromSubscription;

  const defaultProps = {
    cluster: mockHypershiftCluster,
    tabKey: 2,
    initialTabContentShown: true,
  };

  const checkForError = (show: boolean) => {
    if (show) {
      expect(screen.getByLabelText('Validation error on this tab')).toBeInTheDocument();
    } else {
      expect(screen.queryByLabelText('Validation error on this tab')).not.toBeInTheDocument();
    }
  };

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('tab', () => {
    it('displays tab when cluster is hypershift', () => {
      const { result } = renderHook(() => useMaintenanceSubTab(defaultProps));
      const [tabs] = result.current;

      render(tabs({}));
      expect(screen.getByRole('tab')).toHaveTextContent('Maintenance');
      checkForError(false);
    });

    it('does not display tab when cluster is not hypershift', () => {
      const { result } = renderHook(() =>
        useMaintenanceSubTab({
          ...defaultProps,
          cluster: mockClassicCluster,
        }),
      );
      const [tabs] = result.current;

      const { container } = render(tabs({}));
      expect(container).toBeEmptyDOMElement();
    });

    it('shows error when a validation error is on auto_repair field', () => {
      const { result } = renderHook(() => useMaintenanceSubTab(defaultProps));
      const [tabs] = result.current;

      render(tabs({ auto_repair: 'some error' }));
      expect(screen.getByRole('tab')).toBeInTheDocument();
      checkForError(true);
    });

    it('shows error when a validation error is on max surge field', () => {
      const { result } = renderHook(() => useMaintenanceSubTab(defaultProps));
      const [tabs] = result.current;

      render(tabs({ maxSurge: 'error present' }));
      expect(screen.getByRole('tab')).toBeInTheDocument();
      checkForError(true);
    });

    it('does not show error when validation error is on field outside of tab', () => {
      const { result } = renderHook(() => useMaintenanceSubTab(defaultProps));
      const [tabs] = result.current;

      render(tabs({ myOtherField: 'some error' }));
      expect(screen.getByRole('tab')).toBeInTheDocument();
      checkForError(false);
    });
  });

  describe('tab content', () => {
    it('displays the correct content when cluster is hypershift', () => {
      const { result } = renderHook(() => useMaintenanceSubTab(defaultProps));
      const [_tab, content] = result.current;
      render(content());
      expect(screen.getByRole('tabpanel')).toBeInTheDocument();
      expect(screen.getByText('AutoRepair')).toBeInTheDocument();
    });

    it('displays the correct content when maintenance fields are enabled', () => {
      mockUseFeatureGate([[MP_ADDITIONAL_MAINTENANCE_VALUES, true]]);
      const { result } = renderHook(() => useMaintenanceSubTab(defaultProps));
      const [_tab, content] = result.current;

      render(content());
      expect(screen.getByRole('tabpanel')).toBeInTheDocument();
      expect(screen.getByText('Max surge')).toBeInTheDocument();
      expect(screen.getByText('Max unavailable')).toBeInTheDocument();
      expect(screen.getByText('Node drain timeout')).toBeInTheDocument();
    });

    it('does not display content when cluster is not hypershift', () => {
      const { result } = renderHook(() =>
        useMaintenanceSubTab({
          ...defaultProps,
          cluster: mockClassicCluster,
        }),
      );
      const [_tab, content] = result.current;

      const { container } = render(content());
      expect(container).toBeEmptyDOMElement();
    });
  });
});
