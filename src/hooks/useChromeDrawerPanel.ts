import { useCallback, useEffect, useRef } from 'react';

import useChrome from '@redhat-cloud-services/frontend-components/useChrome';

import { insights } from '../../package.json';

const SCOPE = insights.appname;

type DrawerPanelOptions = {
  module: string;
  onClose?: () => void;
};

type DrawerContent<T = unknown> = {
  title: string;
  content?: T;
};

export const useChromeDrawerPanel = <T = unknown>({
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
        scope: SCOPE,
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
    [drawerActions, module, close],
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
