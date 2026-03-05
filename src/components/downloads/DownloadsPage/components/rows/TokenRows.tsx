import React from 'react';

import { Alert, Button, Content, Spinner, Split, SplitItem } from '@patternfly/react-core';
import { ArrowRightIcon } from '@patternfly/react-icons/dist/esm/icons/arrow-right-icon';
import { Tbody, Td, Tr } from '@patternfly/react-table';

import { defaultToOfflineTokens } from '~/common/restrictTokensHelper';
import { Link } from '~/common/routing';
import { AccessTokenCfg } from '~/types/accounts_mgmt.v1';
import { ErrorState } from '~/types/types';

import links from '../../../../../common/installLinks.mjs';
import AlignRight from '../../../../common/AlignRight';
import ExternalLink from '../../../../common/ExternalLink';
import CopyPullSecret from '../../../CopyPullSecret';
import DownloadPullSecret from '../../../DownloadPullSecret';
import { expandKeys } from '../../../downloadsStructure';
import ExpandableRowPair from '../ExpandableRowPair';

type CommonProps = {
  expanded: { [index: string]: boolean };
  setExpanded: (param: { [index: string]: boolean }) => void;
  toolRefs: { [index: string]: React.RefObject<any> };
};

type PullSecretRowProps = CommonProps & {
  token: ErrorState | AccessTokenCfg;
};

const PullSecretRow = ({ expanded, setExpanded, toolRefs, token }: PullSecretRowProps) => (
  <ExpandableRowPair
    expanded={expanded}
    setExpanded={setExpanded}
    toolRefs={toolRefs}
    expandKey={expandKeys.PULL_SECRET}
    cells={[
      <Td key="pullSecret">Pull secret</Td>,
      <Td key="download">
        <AlignRight>
          <Split hasGutter>
            <SplitItem>
              <CopyPullSecret token={token} text="Copy" variant="link-inplace" />
            </SplitItem>
            <SplitItem>
              <DownloadPullSecret token={token} text="Download" />
            </SplitItem>
          </Split>
        </AlignRight>
      </Td>,
    ]}
    description={
      <Content>
        <Content component="p">
          An image pull secret provides authentication for the cluster to access services and
          registries which serve the container images for OpenShift components. Every individual
          user gets a single pull secret generated. The pull secret can be used when installing
          clusters, based on the required infrastructure.
        </Content>
        <Content component="p">
          Learn how to <Link to="/create">create a cluster</Link> or{' '}
          <ExternalLink href={links.OCM_DOCS_PULL_SECRETS}>
            learn more about pull secrets
          </ExternalLink>
          .
        </Content>
      </Content>
    }
  />
);

const ApiTokenRow = ({ expanded, setExpanded, toolRefs }: CommonProps) => (
  <ExpandableRowPair
    expanded={expanded}
    setExpanded={setExpanded}
    toolRefs={toolRefs}
    expandKey={expandKeys.TOKEN_OCM}
    cells={[
      <Td key="name">OpenShift Cluster Manager API Token</Td>,
      <Td key="viewAPI">
        <AlignRight>
          <Link to="/token">
            <Button
              variant="secondary"
              icon={<ArrowRightIcon />}
              data-testid="view-api-token-btn"
              iconPosition="right"
            >
              View API token
            </Button>
          </Link>
        </AlignRight>
      </Td>,
    ]}
    description={
      <Content component="p">
        Use your API token to authenticate against your OpenShift Cluster Manager account.
      </Content>
    }
  />
);

type TokenRowsProps = CommonProps & {
  token: ErrorState | AccessTokenCfg;
  orgRequest: {
    error: { reason: string; operation_id: string };
    isLoading: boolean;
  };
  restrictedEnv: boolean;
  restrictTokens?: boolean;
};

const TokenRows = ({
  expanded,
  setExpanded,
  toolRefs,
  token,
  restrictTokens,
  orgRequest,
  restrictedEnv,
}: TokenRowsProps) => {
  const commonProps = { expanded, setExpanded, toolRefs };
  const pullSecretRowProps = { ...commonProps, token };

  if (restrictedEnv) {
    return (
      <>
        <PullSecretRow {...pullSecretRowProps} />
        <ApiTokenRow {...commonProps} />
      </>
    );
  }

  if (restrictTokens) {
    return <PullSecretRow {...pullSecretRowProps} />;
  }

  if (orgRequest.isLoading) {
    return (
      <>
        <PullSecretRow {...pullSecretRowProps} />

        <Tbody>
          <Tr>
            <Td>
              <div className="pf-v6-u-text-align-center">
                <Spinner size="lg" aria-label="Loading..." />
              </div>
            </Td>
          </Tr>
        </Tbody>
      </>
    );
  }

  if (orgRequest.error && !defaultToOfflineTokens) {
    return (
      <>
        <PullSecretRow {...pullSecretRowProps} />

        <Tbody>
          <Tr>
            <Td />
            <Td id="org-error">
              <Alert variant="danger" isInline title="Error retrieving user account">
                <p>{orgRequest.error.reason}</p>
                <p>{`Operation ID: ${orgRequest.error.operation_id || 'N/A'}`}</p>
              </Alert>
            </Td>
            <Td />
          </Tr>
        </Tbody>
      </>
    );
  }

  return (
    <>
      <PullSecretRow {...pullSecretRowProps} />
      <ApiTokenRow {...commonProps} />
    </>
  );
};

export default TokenRows;
