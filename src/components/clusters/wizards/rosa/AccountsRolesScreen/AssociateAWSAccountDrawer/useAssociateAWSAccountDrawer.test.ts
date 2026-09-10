import useChrome from '@redhat-cloud-services/frontend-components/useChrome';
import { act, renderHook } from '@testing-library/react';

import { trackEvents } from '~/common/analytics';
import useAnalytics from '~/hooks/useAnalytics';

import { useAssociateAWSAccountDrawer } from './useAssociateAWSAccountDrawer';

jest.mock('@redhat-cloud-services/frontend-components/useChrome', () => jest.fn());
jest.mock('~/hooks/useAnalytics', () => ({
  __esModule: true,
  default: jest.fn(),
}));

const useChromeMock = useChrome as jest.Mock;
const useAnalyticsMock = useAnalytics as jest.Mock;

describe('useAssociateAWSAccountDrawer', () => {
  const track = jest.fn();
  const setDrawerPanelContent = jest.fn();
  const toggleDrawerPanel = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    useAnalyticsMock.mockReturnValue(track);
    useChromeMock.mockReturnValue({
      drawerActions: {
        setDrawerPanelContent,
        toggleDrawerPanel,
      },
    });
  });

  it('sets drawer panel content and opens the drawer', () => {
    const { result } = renderHook(() => useAssociateAWSAccountDrawer(false));

    act(() => {
      result.current.openDrawer();
    });

    expect(track).toHaveBeenCalledWith(trackEvents.AssociateAWS);
    expect(setDrawerPanelContent).toHaveBeenCalledWith(
      expect.objectContaining({
        scope: 'openshift',
        module: './DrawerPanel',
      }),
    );
    expect(toggleDrawerPanel).toHaveBeenCalledTimes(1);
  });

  it('closes the drawer and calls the onClose callback when currently open', () => {
    const onClose = jest.fn();
    const { result } = renderHook(() => useAssociateAWSAccountDrawer(false));

    act(() => {
      result.current.openDrawer({ onClose });
    });

    act(() => {
      result.current.closeDrawer();
    });

    expect(toggleDrawerPanel).toHaveBeenCalledTimes(2);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('does not call onClose when closeDrawer is called with skipOnClose', () => {
    const onClose = jest.fn();
    const { result } = renderHook(() => useAssociateAWSAccountDrawer(false));

    act(() => {
      result.current.openDrawer({ onClose });
    });

    act(() => {
      result.current.closeDrawer({ skipOnClose: true });
    });

    expect(toggleDrawerPanel).toHaveBeenCalledTimes(2);
    expect(onClose).not.toHaveBeenCalled();
  });

  it('calls onClose when closing after skipOnClose was used on an already closed drawer', () => {
    const onClose = jest.fn();
    const { result } = renderHook(() => useAssociateAWSAccountDrawer(false));

    act(() => {
      result.current.closeDrawer({ skipOnClose: true });
    });

    act(() => {
      result.current.openDrawer({ onClose });
    });

    act(() => {
      result.current.closeDrawer();
    });

    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
