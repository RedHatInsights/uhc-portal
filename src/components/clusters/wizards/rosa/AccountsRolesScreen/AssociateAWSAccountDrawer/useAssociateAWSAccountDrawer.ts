import { useCallback, useEffect, useRef } from 'react';

import useChrome from '@redhat-cloud-services/frontend-components/useChrome';

import { trackEvents } from '~/common/analytics';
import useAnalytics from '~/hooks/useAnalytics';

import { AWSAccountRole } from './common/AssociateAWSAccountStep';

type OpenDrawerArgs = {
  targetRole?: AWSAccountRole;
  onClose?: () => void;
};

type CloseDrawerArgs = {
  skipOnClose?: boolean;
};

let isDrawerOpen = false;

export const useAssociateAWSAccountDrawer = (showRosaCliRequirement = false) => {
  const { drawerActions } = useChrome();
  const track = useAnalytics();
  const onCloseRef = useRef<(() => void) | undefined>(undefined);

  const closeDrawer = useCallback(
    (args: CloseDrawerArgs = {}) => {
      const { skipOnClose = false } = args;
      if (isDrawerOpen) {
        isDrawerOpen = false;
        drawerActions?.toggleDrawerPanel();
        if (!skipOnClose) {
          onCloseRef.current?.();
        }
        onCloseRef.current = undefined;
      }
    },
    [drawerActions],
  );

  const openDrawer = useCallback(
    (args: OpenDrawerArgs = {}) => {
      const { targetRole, onClose } = args;

      track(trackEvents.AssociateAWS);

      // Store onClose for this specific drawer instance
      onCloseRef.current = onClose;

      drawerActions?.setDrawerPanelContent({
        scope: 'openshift',
        module: './AssociateAWSAccountDrawerPanel',
        targetRole,
        showRosaCliRequirement,
        onClose: closeDrawer,
      });

      if (!isDrawerOpen) {
        drawerActions?.toggleDrawerPanel();
        isDrawerOpen = true;
      }
    },
    [drawerActions, track, showRosaCliRequirement, closeDrawer],
  );

  // Close drawer on unmount
  useEffect(
    () => () => {
      if (isDrawerOpen) {
        drawerActions?.toggleDrawerPanel();
        isDrawerOpen = false;
      }
    },
    [drawerActions],
  );

  return { openDrawer, closeDrawer };
};
