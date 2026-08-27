import React from 'react';

import {
  Button,
  ButtonVariant,
  Content,
  ContentVariants,
  PageSection,
  Stack,
  StackItem,
  Title,
} from '@patternfly/react-core';

import { ROSA_HOSTED_CLI_MIN_VERSION } from '~/components/clusters/wizards/rosa/rosaConstants';
import { DrawerPanelContentNode } from '~/hooks/useChromeDrawerPanel';

import { AWSAccountRole } from './common/AssociateAWSAccountStep';
import AccountRoleStep from './AccountRoleStep';
import OCMRoleStep from './OCMRoleStep';
import UserRoleStep from './UserRoleStep';

export const getAssociateAWSAccountDrawerTitle = (targetRole?: AWSAccountRole) => {
  switch (targetRole) {
    case 'ocm':
      return 'Create OCM role';
    case 'user':
      return 'Create user role';
    case 'account':
      return 'Create account roles';
    default:
      return 'How to associate a new AWS account';
  }
};

const getAssociateAWSAccountDrawerFooter = (targetRole?: AWSAccountRole) => {
  switch (targetRole) {
    case 'ocm':
      return (
        <>
          After you&apos;ve created the role, close this guide and click the{' '}
          <strong>Refresh</strong> button.
        </>
      );
    case 'user':
      return "After you've created the role, close this guide and try again.";
    case 'account':
      return (
        <>
          After running the command, close this guide and click the <strong>Refresh ARNs</strong>{' '}
          button to populate the ARN fields.
        </>
      );
    default:
      return "After you've completed all the steps, close this guide and choose your account.";
  }
};

type AssociateAWSAccountDrawerBodyProps = {
  targetRole?: AWSAccountRole;
  isHypershiftSelected: boolean;
  onClose: () => void;
};

export const AssociateAWSAccountDrawerBody = ({
  targetRole,
  isHypershiftSelected,
  onClose,
}: AssociateAWSAccountDrawerBodyProps) => {
  const allSteps = !targetRole;

  return (
    <PageSection hasBodyWrapper={false}>
      <Stack hasGutter>
        <StackItem>
          <Content component={ContentVariants.p}>
            ROSA cluster deployments use the AWS Security Token Service for added security. Run the
            following required steps from a CLI authenticated with both AWS and ROSA.
          </Content>
          {isHypershiftSelected && (
            <Content component={ContentVariants.p}>
              You must use ROSA CLI version {ROSA_HOSTED_CLI_MIN_VERSION} or above.
            </Content>
          )}
        </StackItem>
        {(allSteps || targetRole === 'ocm') && (
          <StackItem>
            <OCMRoleStep
              title="Step 1: OCM role"
              expandable={allSteps}
              initiallyExpanded
              isHypershiftSelected={isHypershiftSelected}
            />
          </StackItem>
        )}
        {(allSteps || targetRole === 'user') && (
          <StackItem>
            <UserRoleStep title="Step 2: User role" expandable={allSteps} />
          </StackItem>
        )}
        {(allSteps || targetRole === 'account') && (
          <StackItem>
            <AccountRoleStep
              title="Step 3: Account roles"
              expandable={allSteps}
              isHypershiftSelected={isHypershiftSelected}
            />
          </StackItem>
        )}
        <StackItem>
          <Content component={ContentVariants.p} className="pf-v6-u-mr-md">
            {getAssociateAWSAccountDrawerFooter(targetRole)}
          </Content>
        </StackItem>
        <StackItem>
          <Button
            variant={ButtonVariant.secondary}
            data-testid="close-associate-account-btn"
            onClick={onClose}
          >
            Close
          </Button>
        </StackItem>
      </Stack>
    </PageSection>
  );
};

type BuildAssociateAWSAccountDrawerContentArgs = {
  targetRole?: AWSAccountRole;
  isHypershiftSelected: boolean;
  onClose: () => void;
};

export const buildAssociateAWSAccountDrawerContent = ({
  targetRole,
  isHypershiftSelected,
  onClose,
}: BuildAssociateAWSAccountDrawerContentArgs): DrawerPanelContentNode => ({
  head: (
    <Title headingLevel="h2" size="2xl">
      {getAssociateAWSAccountDrawerTitle(targetRole)}
    </Title>
  ),
  body: (
    <AssociateAWSAccountDrawerBody
      targetRole={targetRole}
      isHypershiftSelected={isHypershiftSelected}
      onClose={onClose}
    />
  ),
});
