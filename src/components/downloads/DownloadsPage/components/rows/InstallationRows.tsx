import React from 'react';

import { Content } from '@patternfly/react-core';

import links, { channels, tools } from '~/common/installLinks.mjs';
import { Link } from '~/common/routing';
import ExternalLink from '~/components/common/ExternalLink';

import { DownloadsPageRowsType } from './DownloadsPageRowsType';
import ToolAndDescriptionRows from './ToolAndDescriptionRows';

type InstallationRowsProps = DownloadsPageRowsType;

const InstallationRows = ({
  expanded,
  setExpanded,
  selections,
  setSelections,
  toolRefs,
  urls,
}: InstallationRowsProps) => {
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
        tool={tools.X86INSTALLER}
        channel={channels.STABLE}
        name="OpenShift for x86_64 Installer"
        description={
          <Content>
            <Content component="p">
              Download and extract your operating system&apos;s installation program and place the
              file in the directory where you&apos;ll store your configuration details. Then, create
              clusters on supported x86_64 infrastructure using our{' '}
              <ExternalLink href={links.INSTALL_DOCS_ENTRY}>documentation</ExternalLink> as a guide.
            </Content>
            <Content component="p">
              Learn how to deploy in the <Link to="/create">cloud</Link>, or in your{' '}
              <Link to="/create/datacenter">data center</Link>.
            </Content>
          </Content>
        }
      />

      <ToolAndDescriptionRows
        {...commonProps}
        tool={tools.ARMINSTALLER}
        channel={channels.STABLE}
        name="OpenShift for ARM Installer"
        description={
          <Content>
            <Content component="p">
              Download and extract your operating system&apos;s installation program and place the
              file in the directory where you&apos;ll store your configuration details. Then, create
              clusters on supported ARM infrastructure using our{' '}
              <ExternalLink href={links.INSTALL_DOCS_ENTRY}>documentation</ExternalLink> as a guide.
            </Content>
            <Content component="p">
              Learn how to deploy in <Link to="/install/aws/arm">AWS</Link>,{' '}
              <Link to="/install/azure/arm/installer-provisioned">Azure</Link>, or in your{' '}
              <Link to="/install/arm">data center</Link>.
            </Content>
          </Content>
        }
      />

      <ToolAndDescriptionRows
        {...commonProps}
        tool={tools.IBMZINSTALLER}
        channel={channels.STABLE}
        name="OpenShift for IBM Z (s390x) Installer"
        description={
          <Content>
            <Content component="p">
              Download and extract your operating system&apos;s installation program and place the
              file in the directory where you&apos;ll store your configuration details. Then, create
              clusters on supported IBM Z (s390x) infrastructure using our{' '}
              <ExternalLink href={links.INSTALL_DOCS_ENTRY}>documentation</ExternalLink> as a guide.
            </Content>
            <Content component="p">
              Learn how to deploy in your{' '}
              <Link to="/install/ibmz/user-provisioned">data center</Link>.
            </Content>
          </Content>
        }
      />

      <ToolAndDescriptionRows
        {...commonProps}
        tool={tools.PPCINSTALLER}
        channel={channels.STABLE}
        name="OpenShift for Power Installer"
        description={
          <Content>
            <Content component="p">
              Download and extract your operating system&apos;s installation program and place the
              file in the directory where you&apos;ll store your configuration details. Then, create
              clusters on supported Power infrastructure using our{' '}
              <ExternalLink href={links.INSTALL_DOCS_ENTRY}>documentation</ExternalLink> as a guide.
            </Content>
            <Content component="p">
              Learn how to deploy in your{' '}
              <Link to="/install/power/user-provisioned">data center</Link>.
            </Content>
          </Content>
        }
      />

      <ToolAndDescriptionRows
        {...commonProps}
        tool={tools.MULTIINSTALLER}
        channel={channels.STABLE}
        name="OpenShift Installer with multi-architecture compute machines"
        description={
          <Content>
            <Content component="p">
              Download and extract your operating system&apos;s installation program and place the
              file in the directory where you&apos;ll store your configuration details. Then, create
              clusters on supported infrastructure using our{' '}
              <ExternalLink href={links.INSTALL_DOCS_ENTRY}>documentation</ExternalLink> as a guide.
            </Content>
            <Content component="p">
              Learn how to deploy in{' '}
              <Link to="/install/azure/multi/installer-provisioned">Azure</Link>.
            </Content>
          </Content>
        }
      />

      <ToolAndDescriptionRows
        {...commonProps}
        tool={tools.CRC}
        channel={channels.STABLE}
        name={
          <>
            OpenShift Local (<code>crc</code>)
          </>
        }
        description={
          <Content>
            <Content component="p">
              Download and open the OpenShift Local file to automatically start a step-by-step
              installation guide.
            </Content>
            <Content component="p">
              <Link to="/create/local">Create a minimal cluster on your desktop</Link> for local
              development and testing.
            </Content>
          </Content>
        }
      />
    </>
  );
};

export default InstallationRows;
