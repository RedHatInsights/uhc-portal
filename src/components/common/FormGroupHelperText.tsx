import React, { isValidElement } from 'react';

import {
  FormHelperText,
  HelperText,
  HelperTextItem,
  HelperTextItemProps,
} from '@patternfly/react-core';
import ExclamationCircleIcon from '@patternfly/react-icons/dist/esm/icons/exclamation-circle-icon';

interface FormGroupHelperTextProps {
  children?: React.ReactNode;
  id?: string;
  error?: string | undefined;
  touched?: boolean;
  variant?: HelperTextItemProps['variant'];
  icon?: React.ReactNode;
  validateOnSubmit?: boolean;
}

export const FormGroupHelperText = ({
  children,
  id,
  error,
  touched,
  variant = 'default',
  icon,
  validateOnSubmit,
}: FormGroupHelperTextProps) => {
  const helpMessage = React.useMemo(
    () =>
      typeof children === 'string' ? (
        <HelperText id={id}>
          <HelperTextItem icon={icon} variant={variant}>
            {children}
          </HelperTextItem>
        </HelperText>
      ) : (
        <HelperText>{children}</HelperText>
      ),
    [children, id, icon, variant],
  );

  if (!error && !children) {
    return null;
  }

  // We must ensure "error" can be rendered, see https://issues.redhat.com/browse/OCMUI-1231
  const isValidError = typeof error === 'string' || isValidElement(error);

  return (
    <FormHelperText>
      {(touched && error && isValidError) || (validateOnSubmit && error) ? (
        <HelperText id={id}>
          <HelperTextItem
            variant="error"
            icon={<ExclamationCircleIcon />}
            data-testid="form-helper-error"
          >
            {error}
          </HelperTextItem>
        </HelperText>
      ) : (
        helpMessage
      )}
    </FormHelperText>
  );
};
