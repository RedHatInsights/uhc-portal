import React from 'react';

import { Content } from '@patternfly/react-core';

import links, { channels, tools } from '~/common/installLinks.mjs';
import ExternalLink from '~/components/common/ExternalLink';
import SupportLevelBadge, {
  DEV_PREVIEW,
  TECH_PREVIEW,
} from '~/components/common/SupportLevelBadge';
import { isRestrictedEnv } from '~/restrictedEnv';

import { DownloadsPageRowsType } from './DownloadsPageRowsType';
import ToolAndDescriptionRows from './ToolAndDescriptionRows';

type CliToolRowsProps = DownloadsPageRowsType;

const CliToolRows = ({
  expanded,
  setExpanded,
  selections,
  setSelections,
  toolRefs,
  urls,
}: CliToolRowsProps) => {
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
        tool={tools.OC}
        channel={channels.STABLE}
        name={
          <>
            OpenShift command-line interface (<code>oc</code>)
          </>
        }
        description={
          <Content component="p">
            Create applications and manage OpenShift projects from the command line using the
            OpenShift client <code>oc</code>. {/* TODO: @beni <ExternalLink ExternalLink */}
            <ExternalLink href={links.CLI_TOOLS_OCP_GETTING_STARTED}>Get started</ExternalLink>
          </Content>
        }
      />

      {!isRestrictedEnv() && (
        <ToolAndDescriptionRows
          {...commonProps}
          tool={tools.OCM}
          channel={channels.STABLE}
          name={
            <>
              OpenShift Cluster Manager API command-line interface (<code>ocm</code>){' '}
              <SupportLevelBadge {...DEV_PREVIEW} />
            </>
          }
          description={
            <Content>
              <Content component="p">
                Manage your OpenShift clusters from the command line using the OpenShift Cluster
                Manager API client <code>ocm</code>.{' '}
                <ExternalLink href={links.OCM_CLI_DOCS}>Get started</ExternalLink>
              </Content>
            </Content>
          }
        />
      )}

      <ToolAndDescriptionRows
        {...commonProps}
        tool={tools.ROSA}
        channel={channels.STABLE}
        name={
          <>
            Red Hat OpenShift Service on AWS command-line interface (<code>rosa</code>)
          </>
        }
        description={
          <Content component="p">
            Manage your Red Hat OpenShift Service on AWS (ROSA) clusters from the command line using
            the ROSA client for OCM and AWS APIs.{' '}
            <ExternalLink href={links.ROSA_CLI_DOCS}>Get started</ExternalLink>
          </Content>
        }
      />

      {!isRestrictedEnv() && (
        <>
          <ToolAndDescriptionRows
            {...commonProps}
            tool={tools.KN}
            channel={channels.STABLE}
            name={
              <>
                Knative command-line interface for OpenShift Serverless (<code>kn</code>)
              </>
            }
            description={
              <Content component="p">
                Interact with Knative components on OpenShift Container Platform with the Knative
                client for OpenShift Serverless <code>kn</code>.{' '}
                <ExternalLink href={links.KN_DOCS}>Learn more</ExternalLink>
              </Content>
            }
          />

          <ToolAndDescriptionRows
            {...commonProps}
            tool={tools.TKN}
            channel={channels.STABLE}
            name={
              <>
                Tekton command-line interface for OpenShift Pipelines (<code>tkn</code>)
              </>
            }
            description={
              <Content component="p">
                Manage and interact with CI pipelines on OpenShift Container Platform with the
                Tekton CLI for OpenShift Pipelines.{' '}
                <ExternalLink href={links.TKN_DOCS}>Get started</ExternalLink>
              </Content>
            }
          />

          <ToolAndDescriptionRows
            {...commonProps}
            tool={tools.ARGO_CD}
            channel={channels.STABLE}
            name={
              <>
                Argo CD command-line interface for OpenShift GitOps (argocd)
                <SupportLevelBadge {...TECH_PREVIEW} />
              </>
            }
            description={
              <Content component="p">
                Manage applications on Argo CD from the command line using the Argo CD CLI for
                OpenShift GitOps. <ExternalLink href={links.ARGO_CD_DOCS}>Get started</ExternalLink>
              </Content>
            }
          />

          <ToolAndDescriptionRows
            {...commonProps}
            tool={tools.SHP_CLI}
            channel={channels.STABLE}
            name="Shipwright command-line interface for Builds for OpenShift (shp)"
            description={
              <Content component="p">
                Manage and interact with Shipwright Builds on OpenShift using the Shipwright CLI.{' '}
                <ExternalLink href={links.SHP_CLI_DOCS}>Get started</ExternalLink>
              </Content>
            }
          />
        </>
      )}
    </>
  );
};

export default CliToolRows;
