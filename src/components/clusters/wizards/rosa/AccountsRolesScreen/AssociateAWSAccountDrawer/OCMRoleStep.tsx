import React from 'react';

import { Alert, AlertVariant, Content, ContentVariants, Title } from '@patternfly/react-core';

import { trackEvents } from '~/common/analytics';
import links from '~/common/installLinks.mjs';
import { useFormState } from '~/components/clusters/wizards/hooks';
import { FieldId } from '~/components/clusters/wizards/rosa/constants';
import ExternalLink from '~/components/common/ExternalLink';
import InstructionCommand from '~/components/common/InstructionCommand';
import PopoverHintWithTitle from '~/components/common/PopoverHintWithTitle';

import { RosaCliCommand } from '../constants/cliCommands';

import AssociateAWSAccountStep, {
  AssociateAWSAccountStepProps,
} from './common/AssociateAWSAccountStep';
import ToggleGroupTabs from './common/ToggleGroupTabs';

const OCMRoleStep = (props: AssociateAWSAccountStepProps) => {
  const { expandable } = props;

  const {
    values: { [FieldId.Hypershift]: hypershiftValue },
  } = useFormState();
  const isHypershiftSelected = hypershiftValue === 'true';

  return (
    <AssociateAWSAccountStep {...props}>
      <Title headingLevel="h4" className="pf-v6-u-mb-md" size="md">
        First, check if a role exists and is linked with:
      </Title>

      <InstructionCommand
        data-testid="copy-rosa-list-ocm-role"
        textAriaLabel={`Copyable ROSA ${RosaCliCommand.ListOcmRole} command`}
        className="pf-v6-u-mb-lg"
      >
        {RosaCliCommand.ListOcmRole}
      </InstructionCommand>

      <Alert
        variant={AlertVariant.info}
        isInline
        isPlain
        title={`If there is an existing role and it's already linked to your Red Hat account, ${
          expandable ? 'you can continue to step 2' : 'no further action is needed'
        }.`}
        className="pf-v6-u-mb-lg"
      />

      <Title headingLevel="h3" size="md">
        Next, is there an existing role that isn&apos;t linked?
      </Title>

      <PopoverHintWithTitle
        title="Why do I need to link my account?"
        bodyContent={
          <>
            The link creates a trust policy between the role and the link cluster installer.{' '}
            <ExternalLink
              href={
                isHypershiftSelected
                  ? links.ROSA_AWS_ACCOUNT_ASSOCIATION
                  : links.ROSA_CLASSIC_AWS_ACCOUNT_ASSOCIATION
              }
              noIcon
            >
              Review the AWS policy permissions for the basic and admin OCM roles.
            </ExternalLink>
          </>
        }
      />
      <ToggleGroupTabs
        tabs={[
          {
            'data-testid': 'copy-ocm-role-tab-no',
            id: 'copy-ocm-role-tab-no-id',
            title: 'No, create new role',
            body: (
              <>
                <strong>Basic OCM role</strong>
                <InstructionCommand
                  data-testid="copy-rosa-create-ocm-role"
                  textAriaLabel="Copyable ROSA create ocm-role"
                  trackEvent={trackEvents.CopyOCMRoleCreateBasic}
                >
                  {RosaCliCommand.OcmRole}
                </InstructionCommand>
                <div className="pf-v6-u-mt-md pf-v6-u-mb-md">OR</div>
                <strong>Admin OCM role</strong>
                <InstructionCommand
                  data-testid="copy-rosa-create-ocm-admin-role"
                  textAriaLabel="Copyable ROSA create ocm-role --admin"
                  trackEvent={trackEvents.CopyOCMRoleCreateAdmin}
                >
                  {RosaCliCommand.AdminOcmRole}
                </InstructionCommand>
                <PopoverHintWithTitle
                  title="Help me decide"
                  bodyContent={
                    <>
                      <Content component={ContentVariants.p} className="pf-v6-u-mb-md">
                        The <strong>basic role</strong> enables OpenShift Cluster Manager to detect
                        the AWS IAM roles and policies required by ROSA.
                      </Content>
                      <Content component={ContentVariants.p}>
                        The <strong>admin role</strong> also enables the detection of the roles and
                        policies. In addition, the admin role enables automatic deployment of the
                        cluster-specific Operator roles and OpenID Connect (OIDC) provider by using
                        OpenShift Cluster Manager.
                      </Content>
                    </>
                  }
                />
              </>
            ),
          },
          {
            'data-testid': 'copy-ocm-role-tab-yes',
            id: 'copy-ocm-role-tab-yes-id',
            title: 'Yes, link existing role',
            body: (
              <>
                <strong> If a role exists but is not linked, link it with:</strong>
                <InstructionCommand
                  data-testid="copy-rosa-link-ocm-role"
                  textAriaLabel={`Copyable ${RosaCliCommand.LinkOcmRole} command`}
                  trackEvent={trackEvents.CopyOCMRoleLink}
                >
                  {RosaCliCommand.LinkOcmRole}
                </InstructionCommand>
                <Alert
                  variant={AlertVariant.info}
                  isInline
                  isPlain
                  className="ocm-instruction-block_alert pf-v6-u-mt-lg"
                  title="You must have organization administrator privileges in your Red Hat account to run this command. After you link the OCM role with your Red Hat organization, it is visible for all users in the organization."
                />
              </>
            ),
          },
        ]}
      />
    </AssociateAWSAccountStep>
  );
};

export default OCMRoleStep;
