import { useField } from 'formik';

import { render, renderHook, screen } from '~/testUtils';
import { ClusterFromSubscription } from '~/types/types';

import { useCostSavingsSubTab } from './CostSavingsSubTab';

// Mock dependencies

jest.mock('formik', () => ({
  ...jest.requireActual('formik'),
  useField: jest.fn(),
}));

describe('CostSavingsSubTab', () => {
  const mockCluster: ClusterFromSubscription = {
    id: 'test-cluster',
    cloud_provider: { id: 'aws' },
    product: { id: 'ROSA' },
  } as ClusterFromSubscription;

  const defaultProps = {
    cluster: mockCluster,
    isEdit: false,
    tabKey: 5,
    initialTabContentShown: true,
  };

  const checkForError = (show: boolean) => {
    if (show) {
      expect(screen.getByLabelText('Validation error on this tab')).toBeInTheDocument();
    } else {
      expect(screen.queryByLabelText('Validation error on this tab')).not.toBeInTheDocument();
    }
  };

  const mockedUseField = useField as jest.MockedFunction<typeof useField>;

  mockedUseField.mockReturnValue([
    {
      name: 'spotInstanceType',
      value: 'onDemand',
      onChange: jest.fn(),
      onBlur: jest.fn(),
      checked: false,
    },
    {
      value: 'onDemand',
      error: undefined,
      touched: false,
      initialValue: 'onDemand',
      initialTouched: false,
      initialError: undefined,
    },
    {
      setValue: jest.fn(),
      setTouched: jest.fn(),
      setError: jest.fn(),
    },
  ]);

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('tab', () => {
    it('displays tab when cluster supports spot instances', () => {
      const { result } = renderHook(() => useCostSavingsSubTab(defaultProps));
      const [tabs] = result.current;

      render(tabs({}));
      expect(screen.getByRole('tab', { name: 'Cost savings' })).toBeInTheDocument();
      checkForError(false);
    });

    it('does not display tab when cluster does not support spot instances', () => {
      const noSpotInstancesCluster = { ...mockCluster, hypershift: { enabled: true } };
      const { result } = renderHook(() =>
        useCostSavingsSubTab({ ...defaultProps, cluster: noSpotInstancesCluster }),
      );
      const [tabs] = result.current;

      const { container } = render(tabs({}));
      expect(container).toBeEmptyDOMElement();
    });

    it('shows error when a validation error is on useSpotInstances field', () => {
      const { result } = renderHook(() => useCostSavingsSubTab(defaultProps));
      const [tabs] = result.current;

      render(tabs({ useSpotInstances: ['some error'] }));
      expect(screen.getByRole('tab')).toBeInTheDocument();
      checkForError(true);
    });

    it('does not show  a validation error when on a field outside of tab', () => {
      const { result } = renderHook(() => useCostSavingsSubTab(defaultProps));
      const [tabs] = result.current;

      render(tabs({ myOtherField: 'some error' }));
      expect(screen.getByRole('tab')).toBeInTheDocument();
      checkForError(false);
    });
  });

  describe('tab content', () => {
    it('displays the correct content when cluster supports spot instances', () => {
      const { result } = renderHook(() => useCostSavingsSubTab(defaultProps));
      const [_tab, content] = result.current;

      render(content());
      expect(screen.getByRole('tabpanel')).toBeInTheDocument();
      expect(screen.getByText('Cost saving')).toBeInTheDocument();
    });

    it('does not display content when cluster does not support spot instances', () => {
      const noSpotInstancesCluster = { ...mockCluster, hypershift: { enabled: true } };
      const { result } = renderHook(() =>
        useCostSavingsSubTab({ ...defaultProps, cluster: noSpotInstancesCluster }),
      );
      const [_tab, content] = result.current;

      const { container } = render(content());
      expect(container).toBeEmptyDOMElement();
    });
  });
});
