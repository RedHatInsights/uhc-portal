import React from 'react';

import { Alert, Content, ContentVariants } from '@patternfly/react-core';

import { RosaCliCommand } from '~/components/clusters/wizards/rosa/AccountsRolesScreen/constants/cliCommands';
import InstructionCommand from '~/components/common/InstructionCommand';

type RosaVersionErrorAlertProps = {
  isHypershiftSelected: boolean;
};

const RosaVersionErrorAlert = ({ isHypershiftSelected }: RosaVersionErrorAlertProps) => (
  <Alert
    className="pf-v6-u-ml-lg"
    variant="danger"
    isInline
    role="alert"
    title="There is no version compatible with the selected ARNs in previous step"
  >
    <Content component={ContentVariants.ol} className="ocm-c-wizard-alert-steps">
      <Content component="li" className="pf-v6-u-mb-sm">
        <Content component={ContentVariants.p} className="pf-v6-u-mb-sm">
          Please select different ARNs or create new account roles using the following command in
          the ROSA CLI
        </Content>
      </Content>
      <Content component="li" className="pf-v6-u-mb-sm">
        <div className="pf-v6-u-mb-sm">
          <InstructionCommand textAriaLabel="Copyable ROSA create account-roles command">
            {isHypershiftSelected
              ? RosaCliCommand.CreateAccountRolesHCP
              : RosaCliCommand.CreateAccountRoles}
          </InstructionCommand>
        </div>
      </Content>
    </Content>
  </Alert>
);

export default RosaVersionErrorAlert;
