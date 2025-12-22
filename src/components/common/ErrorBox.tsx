import React from 'react';

import { Alert, AlertActionCloseButton, ExpandableSection } from '@patternfly/react-core';

import { trackEvents } from '~/common/analytics';
import ErrorDetailsDisplay from '~/components/common/ErrorDetailsDisplay';
import useAnalytics from '~/hooks/useAnalytics';
import { ErrorState } from '~/types/types';

type Props = {
  message: string;
  response: Pick<ErrorState, 'errorDetails' | 'errorMessage' | 'operationID'>;
  variant?: 'danger' | 'warning';
  children?: React.ReactNode;
  isExpandable?: boolean;
  showCloseBtn?: boolean;
  onCloseAlert?: () => void;
  hideOperationID?: boolean;
  forceAsAlert?: boolean;
  analyticsType?: string;
  analyticsResourceType?: string;
};

const ErrorBox = ({
  message,
  variant = 'danger',
  response,
  children,
  isExpandable,
  showCloseBtn = false,
  onCloseAlert,
  hideOperationID,
  forceAsAlert,
  analyticsType,
  analyticsResourceType,
}: Props) => {
  const track = useAnalytics();

  const handleClose = React.useCallback(() => {
    if (onCloseAlert) {
      onCloseAlert();
    }
    if (analyticsType) {
      track(trackEvents.AlertInteraction, {
        resourceType: analyticsResourceType,
        customProperties: {
          type: analyticsType || 'all',
          action: 'dismiss',
          severity: variant,
        },
      });
    }
  }, [onCloseAlert, analyticsType, track, analyticsResourceType, variant]);

  const closeAlertProp = {
    actionClose: <AlertActionCloseButton onClose={handleClose} />,
  };

  return (
    <Alert
      variant={variant}
      isInline
      title={message}
      role={variant === 'danger' || forceAsAlert ? 'alert' : undefined}
      className="error-box"
      data-testid="alert-error"
      {...(showCloseBtn && closeAlertProp)}
    >
      {children && (
        <>
          {children}
          <br />
        </>
      )}
      {isExpandable || children ? (
        <ExpandableSection toggleText={children ? 'More details' : 'Error details'}>
          <ErrorDetailsDisplay response={response} hideOperationID={hideOperationID} />
        </ExpandableSection>
      ) : (
        <ErrorDetailsDisplay response={response} />
      )}
    </Alert>
  );
};

export default ErrorBox;
