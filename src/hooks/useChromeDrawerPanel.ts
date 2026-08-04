import { ReactNode, useCallback, useEffect, useRef } from 'react';

import useChrome from '@redhat-cloud-services/frontend-components/useChrome';

import { insights } from '../../package.json';

const SCOPE = insights.appname;

type DrawerPanelOptions = {
  module: string;
  onClose?: () => void;
};

export type DrawerPanelContentNode = {
  head: ReactNode;
  body: ReactNode;
};

type DrawerContent = {
  title: string;
  content: DrawerPanelContentNode;
};

export const useChromeDrawerPanel = ({ module, onClose: onCloseCallback }: DrawerPanelOptions) => {
  const { drawerActions } = useChrome();
  const isOpenRef = useRef<boolean>(false);
  const onCloseRef = useRef(onCloseCallback);

  const close = useCallback(() => {
    if (isOpenRef.current) {
      isOpenRef.current = false;
      drawerActions?.toggleDrawerPanel();
      if (onCloseRef.current) {
        onCloseRef.current();
      }
    }
  }, [drawerActions, onCloseRef]);

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
    // prevent the drawer from closing on data re-fetches
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  return { open, close };
};
