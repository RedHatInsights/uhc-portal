import React, { createContext, PropsWithChildren, useCallback, useMemo, useState } from 'react';

import { Drawer, DrawerContent, DrawerContentBody, DrawerProps } from '@patternfly/react-core';

import './AppDrawer.scss';

export type AppDrawerSettings = {
  drawerProps?: DrawerProps;
  drawerPanelContent?: React.ReactNode;
  /** Callback to execute after drawer close animation completes */
  onClose?: () => void;
  /** Element to focus after drawer close animation completes (usually button or link that opened drawer) */
  focusOnClose?: HTMLElement;
};

export const AppDrawerContext = createContext<{
  openDrawer: (settings: AppDrawerSettings) => void;
  closeDrawer: (args?: { skipOnClose?: boolean }) => void;
}>({ openDrawer: () => undefined, closeDrawer: () => undefined });

export const AppDrawer: React.FC<PropsWithChildren<{}>> = ({ children }) => {
  const [drawerDiv, setDrawerDiv] = useState<HTMLDivElement>();
  const drawerDivRef = useCallback((div: HTMLDivElement) => setDrawerDiv(div), [setDrawerDiv]);

  const drawerTransitionDuration = useMemo(() => {
    if (drawerDiv) {
      const drawerElements = drawerDiv.getElementsByClassName('pf-v6-c-drawer');
      if (drawerElements.length) {
        const transitionDurationString = getComputedStyle(drawerElements[0]).getPropertyValue(
          '--pf-v6-c-drawer__panel--TransitionDuration',
        );
        try {
          const transitionDuration = parseInt(transitionDurationString, 10);
          // valid CSS transition durations are in ms or s (ms canonical)
          return transitionDurationString.endsWith('ms') || !transitionDurationString.endsWith('s')
            ? transitionDuration
            : transitionDuration * 1000;
        } catch {
          // fall through - default to 250
        }
      }
    }
    return 250;
  }, [drawerDiv]);

  const [drawerSettings, setDrawerSettings] = useState<AppDrawerSettings>({
    drawerProps: { isExpanded: false },
  });

  const [isOpening, setIsOpening] = useState(false);

  const closeDrawer = useCallback(
    (args: { skipOnClose?: boolean } = { skipOnClose: false }) => {
      const { skipOnClose } = args;
      setDrawerSettings((settings: AppDrawerSettings) => {
        const { drawerProps, drawerPanelContent, onClose, focusOnClose } = settings;
        if (!skipOnClose) {
          setTimeout(() => {
            focusOnClose?.focus();
            onClose?.();
          }, drawerTransitionDuration);
        }
        return { drawerProps: { ...drawerProps, isExpanded: false }, drawerPanelContent };
      });
    },
    [drawerTransitionDuration, setDrawerSettings],
  );

  const openDrawer = useCallback(
    ({ drawerProps, ...otherSettings }: AppDrawerSettings) => {
      const isOpen = drawerSettings?.drawerProps?.isExpanded;
      if (!isOpening) {
        setIsOpening(true);
        if (isOpen) {
          closeDrawer({ skipOnClose: true }); // skip close callbacks
        } else {
          // set up drawer initially closed so it can transition open properly
          setDrawerSettings({
            drawerProps: { ...drawerProps, isExpanded: false },
            ...otherSettings,
          });
        }
        setTimeout(
          () => {
            setDrawerSettings({
              drawerProps: { ...drawerProps, isExpanded: true },
              ...otherSettings,
            });
            // wait for drawer to transition open before calling onExpand callback
            setTimeout(() => {
              setIsOpening(false);
            }, drawerTransitionDuration);
          },
          // if drawer was previously open, wait for it to transition closed before re-opening
          isOpen ? drawerTransitionDuration : 0,
        );
      }
    },
    [
      closeDrawer,
      drawerSettings,
      drawerTransitionDuration,
      isOpening,
      setIsOpening,
      setDrawerSettings,
    ],
  );

  const contextValue = useMemo(() => ({ openDrawer, closeDrawer }), [openDrawer, closeDrawer]);

  const { drawerProps, drawerPanelContent } = drawerSettings;

  return (
    <div id="app-drawer-div" ref={drawerDivRef}>
      <AppDrawerContext.Provider value={contextValue}>
        <Drawer {...drawerProps}>
          <DrawerContent data-testid="appDrawerContent" panelContent={drawerPanelContent}>
            <DrawerContentBody className="app-drawer-body">{children}</DrawerContentBody>
          </DrawerContent>
        </Drawer>
      </AppDrawerContext.Provider>
    </div>
  );
};
