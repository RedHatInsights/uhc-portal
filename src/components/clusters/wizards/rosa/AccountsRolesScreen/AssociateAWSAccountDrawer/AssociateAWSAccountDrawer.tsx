import React, { forwardRef, useCallback, useContext, useRef } from 'react';

import {
  Button,
  ButtonVariant,
  Content,
  ContentVariants,
  DrawerActions,
  DrawerCloseButton,
  DrawerHead,
  DrawerPanelBody,
  DrawerPanelContent,
  PageSection,
  Stack,
  StackItem,
  Title,
} from '@patternfly/react-core';

import { trackEvents } from '~/common/analytics';
import { AppDrawerContext, AppDrawerSettings } from '~/components/App/AppDrawer';
import { ROSA_HOSTED_CLI_MIN_VERSION } from '~/components/clusters/wizards/rosa/rosaConstants';
import useAnalytics from '~/hooks/useAnalytics';

import { AWSAccountRole } from './common/AssociateAWSAccountStep';
import AccountRoleStep from './AccountRoleStep';
import OCMRoleStep from './OCMRoleStep';
import UserRoleStep from './UserRoleStep';

type AssociateRolesDrawerProps = {
  targetRole?: AWSAccountRole;
  showRosaCliRequirement: boolean;
};

const AssociateRolesDrawerContent = forwardRef<HTMLInputElement, AssociateRolesDrawerProps>(
  ({ targetRole, showRosaCliRequirement }, ref) => {
    const { closeDrawer } = useContext(AppDrawerContext);

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

    const onClick = useCallback(() => {
      closeDrawer();
    }, [closeDrawer]);

    return (
      <DrawerPanelContent isResizable>
        <DrawerHead>
          <Title headingLevel="h2" size="2xl">
            {/* span normally doesn't accept a tabIndex */}
            {/* eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex */}
            <span tabIndex={0} ref={ref}>
              {title}
            </span>
          </Title>
          <DrawerActions>
            <DrawerCloseButton onClick={onClick} />
          </DrawerActions>
        </DrawerHead>
        <DrawerPanelBody hasNoPadding>
          <PageSection hasBodyWrapper={false}>
            <Stack hasGutter>
              <StackItem>
                <Content component={ContentVariants.p}>
                  ROSA cluster deployments use the AWS Security Token Service for added security.
                  Run the following required steps from a CLI authenticated with both AWS and ROSA.
                </Content>
                {showRosaCliRequirement && (
                  <Content component={ContentVariants.p}>
                    You must use ROSA CLI version {ROSA_HOSTED_CLI_MIN_VERSION} or above.
                  </Content>
                )}
              </StackItem>
              {(allSteps || targetRole === 'ocm') && (
                <StackItem>
                  <OCMRoleStep title="Step 1: OCM role" expandable={allSteps} initiallyExpanded />
                </StackItem>
              )}
              {(allSteps || targetRole === 'user') && (
                <StackItem>
                  <UserRoleStep title="Step 2: User role" expandable={allSteps} />
                </StackItem>
              )}
              {(allSteps || targetRole === 'account') && (
                <StackItem>
                  <AccountRoleStep title="Step 3: Account roles" expandable={allSteps} />
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
                  onClick={onClick}
                >
                  Close
                </Button>
              </StackItem>
            </Stack>
          </PageSection>
        </DrawerPanelBody>
      </DrawerPanelContent>
    );
  },
);

export const useAssociateAWSAccountDrawer = (showRosaCliRequirement = false) => {
  const { openDrawer: openAppDrawer } = useContext(AppDrawerContext);
  const track = useAnalytics();

  const titleRef = useRef<HTMLInputElement>(null);

  const onExpand = useCallback(() => {
    if (titleRef.current) {
      titleRef.current.focus();
    }
  }, [titleRef]);

  const openDrawer = useCallback(
    (
      args: Omit<AppDrawerSettings, 'drawerProps' | 'drawerPanelContent'> & {
        targetRole?: AWSAccountRole;
      } = {},
    ) => {
      const { focusOnClose, onClose, targetRole } = args;
      track(trackEvents.AssociateAWS);
      openAppDrawer({
        drawerProps: { onExpand },
        drawerPanelContent: (
          <AssociateRolesDrawerContent
            ref={titleRef}
            targetRole={targetRole}
            showRosaCliRequirement={showRosaCliRequirement}
          />
        ),
        onClose,
        focusOnClose,
      });
    },
    [onExpand, openAppDrawer, track, showRosaCliRequirement],
  );
  return { openDrawer };
};
