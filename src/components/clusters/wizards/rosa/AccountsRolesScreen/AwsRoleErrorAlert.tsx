import React, { MouseEventHandler, useCallback } from 'react';

import { Alert, AlertProps, Button, Content, ContentVariants } from '@patternfly/react-core';

import { AWSAccountRole } from './AssociateAWSAccountDrawer/common/AssociateAWSAccountStep';
import { OpenAssociateAWSAccountDrawer } from './AssociateAWSAccountDrawer/useAssociateAWSAccountDrawer';

type AwsRoleErrorAlertProps = Pick<AlertProps, 'title'> & {
  openDrawer: OpenAssociateAWSAccountDrawer;
  targetRole?: AWSAccountRole;
};

export const AwsRoleErrorAlert = ({ openDrawer, title, targetRole }: AwsRoleErrorAlertProps) => {
  const onClick = useCallback<MouseEventHandler<HTMLButtonElement>>(
    (event) => {
      const focusTarget = event.currentTarget;
      openDrawer({
        targetRole,
        onClose: () => focusTarget.focus(),
      });
    },
    [openDrawer, targetRole],
  );
  return (
    <Alert variant="danger" isInline title={title}>
      <Content className="pf-v6-u-font-size-sm">
        <Content component={ContentVariants.p}>
          To continue,{' '}
          <Button variant="link" isInline onClick={onClick}>
            create the required role
          </Button>{' '}
          with the ROSA CLI.
        </Content>
      </Content>
    </Alert>
  );
};
