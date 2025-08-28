import React, { MouseEventHandler, useCallback } from 'react';

import { Alert, AlertProps, Button, Content, ContentVariants } from '@patternfly/react-core';

import { useAssociateAWSAccountDrawer } from './AssociateAWSAccountDrawer/AssociateAWSAccountDrawer';
import { AWSAccountRole } from './AssociateAWSAccountDrawer/common/AssociateAWSAccountStep';

type AwsRoleErrorAlertProps = Pick<AlertProps, 'title'> & {
  targetRole?: AWSAccountRole;
};

export const AwsRoleErrorAlert = ({ title, targetRole }: AwsRoleErrorAlertProps) => {
  const { openDrawer } = useAssociateAWSAccountDrawer();
  const onClick = useCallback<MouseEventHandler<HTMLButtonElement>>(
    (event) => {
      openDrawer({ focusOnClose: event.target as HTMLElement, targetRole });
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
