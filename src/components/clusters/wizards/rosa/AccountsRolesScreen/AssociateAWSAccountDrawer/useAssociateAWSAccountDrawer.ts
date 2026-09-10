import { useCallback, useRef } from 'react';

import { trackEvents } from '~/common/analytics';
import useAnalytics from '~/hooks/useAnalytics';
import { useChromeDrawerPanel } from '~/hooks/useChromeDrawerPanel';

import { AWSAccountRole } from './common/AssociateAWSAccountStep';
import {
  buildAssociateAWSAccountDrawerContent,
  getAssociateAWSAccountDrawerTitle,
} from './AssociateAWSAccountDrawerContent';

export type OpenAssociateAWSAccountDrawerArgs = {
  targetRole?: AWSAccountRole;
  onClose?: () => void;
};

export type OpenAssociateAWSAccountDrawer = (args?: OpenAssociateAWSAccountDrawerArgs) => void;

type CloseAssociateAWSAccountDrawerArgs = {
  skipOnClose?: boolean;
};

type CloseAssociateAWSAccountDrawer = (args?: CloseAssociateAWSAccountDrawerArgs) => void;

export const useAssociateAWSAccountDrawer = (isHypershiftSelected: boolean) => {
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

  const closeDrawer: CloseAssociateAWSAccountDrawer = useCallback(
    (args = {}) => {
      const { skipOnClose = false } = args;
      if (skipOnClose && isDrawerOpenRef.current) {
        skipNextOnCloseRef.current = true;
      }
      close();
    },
    [close],
  );

  const openDrawer: OpenAssociateAWSAccountDrawer = useCallback(
    (args = {}) => {
      const { targetRole, onClose } = args;

      track(trackEvents.AssociateAWS);
      openOnCloseRef.current = onClose;

      open({
        title: getAssociateAWSAccountDrawerTitle(targetRole),
        content: buildAssociateAWSAccountDrawerContent({
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
