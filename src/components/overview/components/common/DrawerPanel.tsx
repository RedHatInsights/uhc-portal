import React from 'react';

import {
  Divider,
  Drawer,
  DrawerActions,
  DrawerCloseButton,
  DrawerContent,
  DrawerContentBody,
  DrawerHead,
  DrawerPanelContent,
} from '@patternfly/react-core';

import { DrawerPanelContentNode } from './DrawerPanelContent';

type DrawerPanelProps = {
  content: DrawerPanelContentNode;
  onClose: () => void;
};

const DrawerPanel = ({ content, onClose }: DrawerPanelProps) => {
  const handleClose = () => {
    onClose?.();
  };

  return (
    <Drawer isExpanded>
      <DrawerContent
        panelContent={
          <DrawerPanelContent>
            <DrawerHead>
              {content?.head}
              <DrawerActions>
                <DrawerCloseButton onClick={handleClose} data-testid="drawer-close-button" />
              </DrawerActions>
            </DrawerHead>
            <Divider component="div" data-testid="drawer-panel-divider" />
            <DrawerContentBody>{content?.body}</DrawerContentBody>
          </DrawerPanelContent>
        }
      />
    </Drawer>
  );
};

export default DrawerPanel;
