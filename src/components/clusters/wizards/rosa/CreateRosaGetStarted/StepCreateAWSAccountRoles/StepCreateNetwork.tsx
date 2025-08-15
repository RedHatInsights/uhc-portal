import React from 'react';

import {
  Icon,
  Label,
  List,
  ListComponent,
  ListItem,
  OrderType,
  Split,
  SplitItem,
  Title,
} from '@patternfly/react-core';
import ExclamationTriangleIcon from '@patternfly/react-icons/dist/esm/icons/exclamation-triangle-icon';

import { trackEvents } from '~/common/analytics';
import links from '~/common/installLinks.mjs';
import ExternalLink from '~/components/common/ExternalLink';
import InstructionCommand from '~/components/common/InstructionCommand';

import { RosaCliCommand } from '../../AccountsRolesScreen/constants/cliCommands';

const StepCreateNetwork = () => (
  <>
    <Split hasGutter>
      <SplitItem>
        <Title headingLevel="h3" data-testid="create-vpc-networking-title">
          Create a Virtual Private Network (VPC) and necessary networking components.
        </Title>
      </SplitItem>
      <SplitItem>
        <Label
          data-testid="create-vpc-networking-hcp-label"
          variant="outline"
          color="red"
          icon={
            <Icon status="warning">
              <ExclamationTriangleIcon />
            </Icon>
          }
        >
          Only for ROSA HCP clusters
        </Label>
      </SplitItem>
    </Split>
    <List
      component={ListComponent.ol}
      type={OrderType.number}
      data-testid="create-vpc-networking-definition"
    >
      <ListItem data-testid="create-vpc-networking-definition-item1">
        To create a Virtual Private Network (VPC) and all the neccesary components, run this
        command:
        <InstructionCommand
          trackEvent={trackEvents.CopyCreateAccountRoles}
          textAriaLabel="Copyable ROSA create account-roles command"
          className="pf-v6-u-mt-md"
        >
          {RosaCliCommand.CreateNetwork}
        </InstructionCommand>
      </ListItem>
    </List>
    <div className="pf-v6-u-mt-md">
      Learn more about the{' '}
      <ExternalLink href={links.ROSA_CREATE_NETWORK}>create network command</ExternalLink> and other
      ways to <ExternalLink href={links.CREATE_VPC_WAYS}>create a VPC</ExternalLink>
    </div>
  </>
);

export default StepCreateNetwork;
