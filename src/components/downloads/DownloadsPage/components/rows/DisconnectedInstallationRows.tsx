import React from 'react';

import { Content } from '@patternfly/react-core';

import links, { channels, tools } from '~/common/installLinks.mjs';
import ExternalLink from '~/components/common/ExternalLink';

import { DownloadsPageRowsType } from './DownloadsPageRowsType';
import ToolAndDescriptionRows from './ToolAndDescriptionRows';

type DisconnectedInstallationRowsProps = DownloadsPageRowsType;

const DisconnectedInstallationRows = ({
  expanded,
  setExpanded,
  selections,
  setSelections,
  toolRefs,
  urls,
}: DisconnectedInstallationRowsProps) => {
  const commonProps = {
    expanded,
    setExpanded,
    selections,
    setSelections,
    toolRefs,
    urls,
  };
  return (
    <>
      <ToolAndDescriptionRows
        {...commonProps}
        tool={tools.MIRROR_REGISTRY}
        channel={channels.STABLE}
        name="mirror registry for Red Hat OpenShift"
        description={
          <Content>
            <Content component="p">
              Download and install a local, minimal single instance deployment of Red Hat Quay to
              aid bootstrapping the first disconnected cluster.{' '}
              <ExternalLink href={links.INSTALL_MIRROR_REGISTRY_LEARN_MORE}>
                Learn more
              </ExternalLink>
            </Content>
          </Content>
        }
      />
      <ToolAndDescriptionRows
        {...commonProps}
        tool={tools.OC_MIRROR_PLUGIN}
        channel={channels.STABLE}
        name="OpenShift Client (oc) mirror plugin"
        description={
          <Content>
            <Content component="p">
              The &quot;mirror&quot; plugin for the OpenShift CLI client (oc) controls the process{' '}
              of mirroring all relevant container image for a full disconnected OpenShift{' '}
              installation in a central, declarative tool.{' '}
              <ExternalLink href={links.INSTALL_OC_MIRROR_PLUGIN_LEARN_MORE}>
                Learn more
              </ExternalLink>
            </Content>
            <Content component="p">
              RHEL 9 is FIPS compatible; RHEL 8 is non-FIPS compatible.
            </Content>
          </Content>
        }
      />
    </>
  );
};

export default DisconnectedInstallationRows;
