// useChromeDrawerPanel.ts
import { useCallback, useEffect, useRef } from 'react';

import useChrome from '@redhat-cloud-services/frontend-components/useChrome';

type DrawerPanelOptions = {
  scope: string;
  module: string;
  onClose?: () => void;
};

type DrawerContent<T = unknown> = {
  title: string;
  content?: T;
};

export const useChromeDrawerPanel = <T = unknown>({
  scope,
  module,
  onClose: onCloseCallback,
}: DrawerPanelOptions) => {
  const { drawerActions } = useChrome();
  const isOpenRef = useRef<boolean>(false);

  const close = useCallback(() => {
    if (isOpenRef.current) {
      isOpenRef.current = false;
      drawerActions?.toggleDrawerPanel();
      onCloseCallback?.();
    }
  }, [drawerActions, onCloseCallback]);

  const open = useCallback(
    ({ title, content }: DrawerContent) => {
      drawerActions?.setDrawerPanelContent({
        scope,
        module,
        title,
        content,
        onClose: close,
      });

      if (!isOpenRef.current) {
        drawerActions?.toggleDrawerPanel();
        isOpenRef.current = true;
      }
    },
    [drawerActions, scope, module, close],
  );

  useEffect(
    () => () => {
      if (isOpenRef.current) {
        drawerActions?.toggleDrawerPanel();
      }
    },
    [drawerActions],
  );

  return { open, close };
};
