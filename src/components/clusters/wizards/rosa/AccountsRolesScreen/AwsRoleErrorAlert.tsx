import React, { useCallback, useRef } from 'react';

import { Alert, AlertProps, Button, Content, ContentVariants } from '@patternfly/react-core';

import { AWSAccountRole } from './AssociateAWSAccountDrawer/common/AssociateAWSAccountStep';
import { useAssociateAWSAccountDrawer } from './AssociateAWSAccountDrawer/useAssociateAWSAccountDrawer';

type AwsRoleErrorAlertProps = Pick<AlertProps, 'title'> & {
  targetRole?: AWSAccountRole;
  isHypershiftSelected?: boolean;
};

export const AwsRoleErrorAlert = ({
  title,
  targetRole,
  isHypershiftSelected = false,
}: AwsRoleErrorAlertProps) => {
  const { openDrawer } = useAssociateAWSAccountDrawer(isHypershiftSelected);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const onClick = useCallback(() => {
    openDrawer({
      targetRole,
      onClose: () => {
        buttonRef.current?.focus();
      },
    });
  }, [openDrawer, targetRole]);

  return (
    <Alert variant="danger" isInline title={title}>
      <Content className="pf-v6-u-font-size-sm">
        <Content component={ContentVariants.p}>
          To continue,{' '}
          <Button ref={buttonRef} variant="link" isInline onClick={onClick}>
            create the required role
          </Button>{' '}
          with the ROSA CLI.
        </Content>
      </Content>
    </Alert>
  );
};
