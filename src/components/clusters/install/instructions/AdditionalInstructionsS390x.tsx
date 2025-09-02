import React from 'react';

import { Content, Icon, List, ListItem } from '@patternfly/react-core';
import { ExternalLinkAltIcon } from '@patternfly/react-icons/dist/esm/icons/external-link-alt-icon';

import links from '../../../../common/installLinks.mjs';

const AdditionalInstructionsS390x = () => (
  <List>
    <ListItem>
      If you plan your installation with z/VM, download the initramfs, the kernel, and the rootfs
      files.{' '}
      <Content
        component="a"
        href={links.INSTALL_IBMZ_LEARN_MORE_ZVM}
        target="_blank"
        rel="noreferrer noopener"
        data-testid="install-ibmz-zvm-link"
      >
        Learn more{' '}
        <Icon size="sm">
          <ExternalLinkAltIcon />
        </Icon>
        .
      </Content>
    </ListItem>
    <ListItem>
      If you plan your installation with RHEL KVM, depending on the installation type you plan to
      perform, download the QCOW2 file or the initramfs, the kernel, and the rootfs files.{' '}
      <Content
        component="a"
        href={links.INSTALL_IBMZ_RHCOS_LEARN_MORE_RHEL_KVM}
        target="_blank"
        rel="noreferrer noopener"
        data-testid="install-ibmz-rhcos-link"
      >
        Learn more{' '}
        <Icon size="sm">
          <ExternalLinkAltIcon />
        </Icon>
        .{' '}
      </Content>
    </ListItem>
  </List>
);

export default AdditionalInstructionsS390x;
