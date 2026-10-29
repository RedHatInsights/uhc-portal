import { useCallback, useRef } from 'react';

import { trackEvents } from '~/common/analytics';
import useAnalytics from '~/hooks/useAnalytics';
import { useChromeDrawerPanel } from '~/hooks/useChromeDrawerPanel';

import { AWSAccountRole } from './common/AccountsAndRolesDrawerStep';
import {
  buildAccountsAndRolesDrawerContent,
  getAccountsAndRolesDrawerTitle,
} from './AccountsAndRolesDrawerContent';

export type OpenAccountsAndRolesDrawerArgs = {
  targetRole?: AWSAccountRole;
  onClose?: () => void;
};

export type OpenAccountsAndRolesDrawer = (args?: OpenAccountsAndRolesDrawerArgs) => void;

type CloseAccountsAndRolesDrawerArgs = {
  skipOnClose?: boolean;
};

type CloseAccountsAndRolesDrawer = (args?: CloseAccountsAndRolesDrawerArgs) => void;

export const useAccountsAndRolesDrawer = (isHypershiftSelected: boolean) => {
  const track = useAnalytics();
  const openOnCloseRef = useRef<(() => void) | undefined>(undefined);
  const skipNextOnCloseRef = useRef(false);
  const isDrawerOpenRef = useRef(false);

  const handleDrawerClosed = useCallback(() => {
    isDrawerOpenRef.current = false;

    if (skipNextOnCloseRef.current) {
      skipNextOnCloseRef.current = false;
      openOnCloseRef.current = undefined;
      return;
    }

    openOnCloseRef.current?.();
    openOnCloseRef.current = undefined;
  }, []);

  const { open, close } = useChromeDrawerPanel({
    module: './DrawerPanel',
    onClose: handleDrawerClosed,
  });

  const closeDrawer: CloseAccountsAndRolesDrawer = useCallback(
    (args = {}) => {
      const { skipOnClose = false } = args;
      if (skipOnClose && isDrawerOpenRef.current) {
        skipNextOnCloseRef.current = true;
      }
      close();
    },
    [close],
  );

  const openDrawer: OpenAccountsAndRolesDrawer = useCallback(
    (args = {}) => {
      const { targetRole, onClose } = args;

      track(trackEvents.AssociateAWS);
      openOnCloseRef.current = onClose;

      open({
        title: getAccountsAndRolesDrawerTitle(targetRole),
        content: buildAccountsAndRolesDrawerContent({
          targetRole,
          isHypershiftSelected,
          onClose: close,
        }),
      });
      isDrawerOpenRef.current = true;
    },
    [close, isHypershiftSelected, open, track],
  );

  return { openDrawer, closeDrawer };
};
