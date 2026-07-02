import React from 'react';

import useChrome from '@redhat-cloud-services/frontend-components/useChrome';
import { act, renderHook } from '@testing-library/react';

import { useChromeDrawerPanel } from './useChromeDrawerPanel';

jest.mock('@redhat-cloud-services/frontend-components/useChrome', () => jest.fn());

const useChromeMock = useChrome as jest.Mock;

describe('useChromeDrawerPanel', () => {
  const content = {
    head: <div>Drawer head</div>,
    body: <div>Drawer body</div>,
  };

  const setDrawerPanelContent = jest.fn();
  const toggleDrawerPanel = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    useChromeMock.mockReturnValue({
      drawerActions: {
        setDrawerPanelContent,
        toggleDrawerPanel,
      },
    });
  });

  it('sets drawer panel content and opens the drawer', () => {
    const onClose = jest.fn();
    const { result } = renderHook(() =>
      useChromeDrawerPanel({
        module: './DrawerPanel',
        onClose,
      }),
    );

    act(() => {
      result.current.open({
        title: 'Drawer title',
        content,
      });
    });

    expect(setDrawerPanelContent).toHaveBeenCalledWith({
      scope: 'openshift',
      module: './DrawerPanel',
      title: 'Drawer title',
      content,
      onClose: expect.any(Function),
    });
    expect(toggleDrawerPanel).toHaveBeenCalledTimes(1);
    expect(onClose).not.toHaveBeenCalled();
  });

  it('updates drawer panel content without toggling when already open', () => {
    const { result } = renderHook(() =>
      useChromeDrawerPanel({
        module: './DrawerPanel',
      }),
    );

    act(() => {
      result.current.open({
        title: 'First drawer title',
        content,
      });
    });

    act(() => {
      result.current.open({
        title: 'Second drawer title',
        content,
      });
    });

    expect(setDrawerPanelContent).toHaveBeenCalledTimes(2);
    expect(setDrawerPanelContent).toHaveBeenLastCalledWith({
      scope: 'openshift',
      module: './DrawerPanel',
      title: 'Second drawer title',
      content,
      onClose: expect.any(Function),
    });
    expect(toggleDrawerPanel).toHaveBeenCalledTimes(1);
  });

  it('closes the drawer and calls the onClose callback when currently open', () => {
    const onClose = jest.fn();
    const { result } = renderHook(() =>
      useChromeDrawerPanel({
        module: './DrawerPanel',
        onClose,
      }),
    );

    act(() => {
      result.current.open({
        title: 'Drawer title',
        content,
      });
    });

    act(() => {
      result.current.close();
    });

    expect(toggleDrawerPanel).toHaveBeenCalledTimes(2);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('does not toggle or call onClose when closing an already closed drawer', () => {
    const onClose = jest.fn();
    const { result } = renderHook(() =>
      useChromeDrawerPanel({
        module: './DrawerPanel',
        onClose,
      }),
    );

    act(() => {
      result.current.close();
    });

    expect(toggleDrawerPanel).not.toHaveBeenCalled();
    expect(onClose).not.toHaveBeenCalled();
  });

  it('uses the drawer panel onClose handler to close the drawer', () => {
    const onClose = jest.fn();
    const { result } = renderHook(() =>
      useChromeDrawerPanel({
        module: './DrawerPanel',
        onClose,
      }),
    );

    act(() => {
      result.current.open({
        title: 'Drawer title',
        content,
      });
    });

    const drawerPanelOptions = setDrawerPanelContent.mock.calls[0][0];

    act(() => {
      drawerPanelOptions.onClose();
    });

    expect(toggleDrawerPanel).toHaveBeenCalledTimes(2);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('closes an open drawer on unmount without calling onClose', () => {
    const onClose = jest.fn();
    const { result, unmount } = renderHook(() =>
      useChromeDrawerPanel({
        module: './DrawerPanel',
        onClose,
      }),
    );

    act(() => {
      result.current.open({
        title: 'Drawer title',
        content,
      });
    });

    unmount();

    expect(toggleDrawerPanel).toHaveBeenCalledTimes(2);
    expect(onClose).not.toHaveBeenCalled();
  });

  it('does not toggle the drawer on unmount when it is closed', () => {
    const { unmount } = renderHook(() =>
      useChromeDrawerPanel({
        module: './DrawerPanel',
      }),
    );

    unmount();

    expect(toggleDrawerPanel).not.toHaveBeenCalled();
  });

  it('does not throw when drawerActions is unavailable', () => {
    useChromeMock.mockReturnValue({});

    const { result, unmount } = renderHook(() =>
      useChromeDrawerPanel({
        module: './DrawerPanel',
      }),
    );

    expect(() => {
      act(() => {
        result.current.open({
          title: 'Drawer title',
          content,
        });
      });

      act(() => {
        result.current.close();
      });

      unmount();
    }).not.toThrow();
  });
});
