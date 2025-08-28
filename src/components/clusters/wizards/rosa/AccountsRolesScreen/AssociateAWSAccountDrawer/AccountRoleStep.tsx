import React from 'react';

import { Alert, AlertVariant, Content, ContentVariants } from '@patternfly/react-core';

import { trackEvents } from '~/common/analytics';
import links from '~/common/installLinks.mjs';
import { useFormState } from '~/components/clusters/wizards/hooks';
import { FieldId } from '~/components/clusters/wizards/rosa/constants';
import ExternalLink from '~/components/common/ExternalLink';
import InstructionCommand from '~/components/common/InstructionCommand';

import { RosaCliCommand } from '../constants/cliCommands';

import AssociateAWSAccountStep, {
  AssociateAWSAccountStepProps,
} from './common/AssociateAWSAccountStep';

const AccountRoleStep = (props: AssociateAWSAccountStepProps) => {
  const {
    values: { [FieldId.Hypershift]: hypershift },
  } = useFormState();
  const isHypershiftSelected = hypershift === 'true';
  const accountRolesCommand = isHypershiftSelected
    ? RosaCliCommand.CreateAccountRolesHCP
    : RosaCliCommand.CreateAccountRoles;
  return (
    <AssociateAWSAccountStep {...props}>
      <Content component={ContentVariants.p} className="pf-v6-u-mb-lg">
        To create the necessary account-wide roles and policies quickly, use the default auto method
        that&apos;s provided by the ROSA CLI.
      </Content>
      <InstructionCommand
        data-testId="copy-rosa-create-account-role"
        trackEvent={trackEvents.CopyCreateAccountRoles}
        textAriaLabel={`Copyable ROSA ${accountRolesCommand} command`}
        className="pf-v6-u-mb-lg"
      >
        {accountRolesCommand}
      </InstructionCommand>

      <Alert
        variant={AlertVariant.info}
        isInline
        isPlain
        className="pf-v6-u-mb-lg"
        title={
          <>
            If you would prefer to manually create the required roles and policies within your AWS
            account, then follow{' '}
            <ExternalLink href={links.AWS_CLI_GETTING_STARTED_MANUAL} noIcon>
              these instructions
            </ExternalLink>
            .
          </>
        }
      />
    </AssociateAWSAccountStep>
  );
};

export default AccountRoleStep;
