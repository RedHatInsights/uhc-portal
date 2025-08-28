import React from 'react';

import {
  Card,
  CardBody,
  CardTitle,
  Content,
  List,
  ListItem,
  Stack,
  StackItem,
  Title,
} from '@patternfly/react-core';

import links, { channels, tools } from '../../common/installLinks.mjs';
import DownloadAndOSSelection from '../clusters/install/instructions/components/DownloadAndOSSelection';
import ExternalLink from '../common/ExternalLink';
import InstructionCommand from '../common/InstructionCommand';
import SupportLevelBadge, { DEV_PREVIEW } from '../common/SupportLevelBadge';

import LeadingInfo from './LeadingInfo';
import { SSOAlert } from './SSOAlert';

import './Instructions.scss';

const SSOLogin = ({
  isRosa,
  commandName,
  commandTool,
  SSOLogin,
  setShouldShowTokens,
}: {
  isRosa: boolean;
  commandName: string;
  commandTool: string;
  SSOLogin: boolean;
  setShouldShowTokens: (v: boolean) => void;
}) => (
  <Stack hasGutter>
    <StackItem>
      <Card className="ocm-c-api-token__card">
        {!SSOLogin ? <SSOAlert isRosa={isRosa} setShouldShowTokens={setShouldShowTokens} /> : null}
        <CardTitle>
          <Title headingLevel="h2">SSO Login</Title>
        </CardTitle>
        <CardBody className="ocm-c-api-token__card--body">
          <Content>
            <LeadingInfo isRosa={isRosa} SSOLogin />
          </Content>
          <Content className="pf-v6-u-mt-lg">
            <List component="ol">
              <ListItem>
                Download and install the <code>{commandName}</code> command-line tool:{' '}
                {commandTool === tools.OCM && <SupportLevelBadge {...DEV_PREVIEW} />}
                <Content component="p" />
                <DownloadAndOSSelection tool={commandTool} channel={channels.STABLE} />
                <Content component="p" />
              </ListItem>
              <ListItem>
                To authenticate, run one of these commands:
                <Content component="p" />
                <Content component="p">Option 1 (for browsers)</Content>
                <InstructionCommand
                  className="ocm-c-api-token-limit-width"
                  outerClassName="pf-v6-u-mt-md"
                >
                  {`${commandName} login --use-auth-code`}
                </InstructionCommand>
                <Content component="p">Option 2 (for browserless environment)</Content>
                <InstructionCommand
                  className="ocm-c-api-token-limit-width"
                  outerClassName="pf-v6-u-mt-md"
                >
                  {`${commandName} login --use-device-code`}
                </InstructionCommand>
              </ListItem>
              <ListItem>
                Enter your Red Hat login credentials via SSO in the browser window.
              </ListItem>
            </List>
          </Content>
        </CardBody>
      </Card>
    </StackItem>
    <StackItem>
      <Card>
        <CardTitle>
          <Title headingLevel="h2">Additional resources:</Title>
        </CardTitle>
        <CardBody>
          <Content>
            You can find documentation for these related products and services here:
            <List>
              <ListItem>
                <ExternalLink href={links.OCM_CLI_DOCS} noIcon>
                  OpenShift Cluster Manager documentation
                </ExternalLink>
              </ListItem>
            </List>
          </Content>
        </CardBody>
      </Card>
    </StackItem>
  </Stack>
);

export default SSOLogin;
