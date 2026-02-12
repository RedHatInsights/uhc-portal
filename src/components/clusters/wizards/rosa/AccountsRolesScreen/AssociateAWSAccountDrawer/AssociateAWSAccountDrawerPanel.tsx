import React, { useCallback } from 'react';

import {
  Button,
  ButtonVariant,
  Content,
  ContentVariants,
  Drawer,
  DrawerActions,
  DrawerCloseButton,
  DrawerContent,
  DrawerContentBody,
  DrawerHead,
  DrawerPanelBody,
  DrawerPanelContent,
  PageSection,
  Stack,
  StackItem,
  Title,
} from '@patternfly/react-core';

import { ROSA_HOSTED_CLI_MIN_VERSION } from '~/components/clusters/wizards/rosa/rosaConstants';

import { AWSAccountRole } from './common/AssociateAWSAccountStep';
import AccountRoleStep from './AccountRoleStep';
import OCMRoleStep from './OCMRoleStep';
import UserRoleStep from './UserRoleStep';

type AssociateAWSAccountDrawerPanelProps = {
  targetRole?: AWSAccountRole;
  showRosaCliRequirement: boolean;
  onClose: () => void;
};

const AssociateAWSAccountDrawerPanel = ({
  targetRole,
  showRosaCliRequirement = false,
  onClose,
}: AssociateAWSAccountDrawerPanelProps) => {

  let title;
  let footer;
  switch (targetRole) {
    case 'ocm':
      title = 'Create OCM role';
      footer = (
        <>
          After you&apos;ve created the role, close this guide and click the{' '}
          <strong>Refresh</strong> button.
        </>
      );
      break;
    case 'user':
      title = 'Create user role';
      footer = "After you've created the role, close this guide and try again.";
      break;
    case 'account':
      title = 'Create account roles';
      footer = (
        <>
          After running the command, close this guide and click the <strong>Refresh ARNs</strong>{' '}
          button to populate the ARN fields.
        </>
      );
      break;
    default:
      title = 'How to associate a new AWS account';
      footer = "After you've completed all the steps, close this guide and choose your account.";
  }

  const allSteps = !targetRole;

  const handleClose = useCallback(() => {
    onClose?.();
  }, [onClose]);

  return (
    <Drawer isExpanded>
      <DrawerContent
        panelContent={
          <DrawerPanelContent>
            <DrawerHead>
              <Title headingLevel="h2" size="2xl">
                {title}
              </Title>
              <DrawerActions>
                <DrawerCloseButton onClick={handleClose} data-testid="drawer-close-button" />
              </DrawerActions>
            </DrawerHead>
            <DrawerPanelBody hasNoPadding>
              <PageSection hasBodyWrapper={false}>
                <Stack hasGutter>
                  <StackItem>
                    <Content component={ContentVariants.p}>
                      ROSA cluster deployments use the AWS Security Token Service for added
                      security. Run the following required steps from a CLI authenticated with both
                      AWS and ROSA.
                    </Content>
                    {showRosaCliRequirement && (
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
                        isHypershiftSelected={showRosaCliRequirement}
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
                        isHypershiftSelected={showRosaCliRequirement}
                      />
                    </StackItem>
                  )}
                  <StackItem>
                    <Content component={ContentVariants.p} className="pf-v6-u-mr-md">
                      {footer}
                    </Content>
                  </StackItem>
                  <StackItem>
                    <Button
                      variant={ButtonVariant.secondary}
                      data-testid="close-associate-account-btn"
                      onClick={handleClose}
                    >
                      Close
                    </Button>
                  </StackItem>
                </Stack>
              </PageSection>
            </DrawerPanelBody>
          </DrawerPanelContent>
        }
      >
        <DrawerContentBody />
      </DrawerContent>
    </Drawer>
  );
};

export default AssociateAWSAccountDrawerPanel;
