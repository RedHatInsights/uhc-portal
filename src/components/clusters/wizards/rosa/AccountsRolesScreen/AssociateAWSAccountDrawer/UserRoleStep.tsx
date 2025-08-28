import React from 'react';

import { Alert, AlertVariant, Title } from '@patternfly/react-core';

import { trackEvents } from '~/common/analytics';
import InstructionCommand from '~/components/common/InstructionCommand';
import PopoverHint from '~/components/common/PopoverHint';

import { RosaCliCommand } from '../constants/cliCommands';

import AssociateAWSAccountStep, {
  AssociateAWSAccountStepProps,
} from './common/AssociateAWSAccountStep';
import ToggleGroupTabs from './common/ToggleGroupTabs';

const UserRoleStep = (props: AssociateAWSAccountStepProps) => {
  const { expandable } = props;
  return (
    <AssociateAWSAccountStep {...props}>
      <Title headingLevel="h3" className="pf-v6-u-mb-md" size="md">
        First, check if a role exists and is linked with:
      </Title>

      <InstructionCommand
        data-testId="copy-rosa-list-user-role"
        textAriaLabel={`Copyable ROSA ${RosaCliCommand.ListUserRole} command`}
        className="pf-v6-u-mb-lg"
      >
        {RosaCliCommand.ListUserRole}
      </InstructionCommand>

      <Alert
        variant={AlertVariant.info}
        isInline
        isPlain
        title={`If there is an existing role and it's already linked to your Red Hat account, ${
          expandable ? 'you can continue to step 3' : 'no further action is needed'
        }.`}
        className="pf-v6-u-mb-lg"
      />

      <Title headingLevel="h3" size="md" className="pf-v6-u-mb-lg">
        Next, is there an existing role that isn&apos;t linked?
      </Title>

      <ToggleGroupTabs
        tabs={[
          {
            'data-testid': 'copy-user-role-tab-no',
            id: 'copy-user-role-tab-no-id',
            title: 'No, create new role',
            body: (
              <>
                <strong>User role </strong>
                <PopoverHint bodyContent="The user role is necessary to validate that your Red Hat user account has permissions to install a cluster in the AWS account." />
                <InstructionCommand
                  data-testid="copy-rosa-create-user-role"
                  textAriaLabel="Copyable ROSA create user-role"
                  trackEvent={trackEvents.CopyUserRoleCreate}
                >
                  {RosaCliCommand.UserRole}
                </InstructionCommand>
              </>
            ),
          },
          {
            'data-testid': 'copy-user-role-tab-yes',
            id: 'copy-user-role-tab-yes-id',
            title: 'Yes, link existing role',
            body: (
              <InstructionCommand
                data-testid="copy-rosa-link-user-role"
                textAriaLabel="Copyable ROSA link user-role --arn"
                trackEvent={trackEvents.CopyUserRoleLink}
              >
                {RosaCliCommand.LinkUserRole}
              </InstructionCommand>
            ),
          },
        ]}
      />
    </AssociateAWSAccountStep>
  );
};

export default UserRoleStep;
