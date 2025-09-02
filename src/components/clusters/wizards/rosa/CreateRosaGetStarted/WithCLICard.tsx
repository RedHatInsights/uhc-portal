import React from 'react';

import {
  Card,
  CardBody,
  CardFooter,
  CardTitle,
  Content,
  ContentVariants,
  Title,
} from '@patternfly/react-core';
import { CodeIcon } from '@patternfly/react-icons/dist/esm/icons/code-icon';

import { trackEvents } from '~/common/analytics';
import links from '~/common/installLinks.mjs';
import ExternalLink from '~/components/common/ExternalLink';
import InstructionCommand from '~/components/common/InstructionCommand';

import { RosaCliCommand } from '../AccountsRolesScreen/constants/cliCommands';

const WithCLICard = () => (
  <Card isFullHeight data-testid="deploy-with-cli-card">
    <CardTitle>
      <Title headingLevel="h3" size="lg">
        <CodeIcon className="ocm-c-wizard-get-started--card-icon" />
        Deploy with CLI
      </Title>
    </CardTitle>
    <CardBody>
      <Content component={ContentVariants.p} className="pf-v6-u-mb-sm">
        Run the create command in your terminal to begin setup in interactive mode.
      </Content>
      <InstructionCommand
        textAriaLabel="Copyable ROSA create cluster command"
        trackEvent={trackEvents.CopyRosaCreateCluster}
      >
        {RosaCliCommand.CreateCluster}
      </InstructionCommand>
    </CardBody>
    <CardFooter>
      Learn how to{' '}
      <ExternalLink href={links.ROSA_HCP_CLI_URL}>
        deploy ROSA clusters with the ROSA CLI
      </ExternalLink>
    </CardFooter>
  </Card>
);

export default WithCLICard;
