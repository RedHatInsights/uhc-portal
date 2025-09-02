import React from 'react';
import { FormikErrors } from 'formik';

import { Icon, TabTitleIcon, TabTitleText } from '@patternfly/react-core';
import { ExclamationCircleIcon } from '@patternfly/react-icons/dist/esm/icons';

import { EditMachinePoolValues } from '../hooks/useMachinePoolFormik';

export const hasErrors = (errors: FormikErrors<EditMachinePoolValues>, fieldsInTab: string[]) =>
  fieldsInTab.some((field: string) => errors[field as keyof EditMachinePoolValues]);

export const tabTitle = (title: string | React.JSX.Element, hasErrors: boolean) => (
  <>
    {hasErrors ? (
      <TabTitleIcon aria-label="Validation error on this tab">
        <Icon status="danger">
          <ExclamationCircleIcon />
        </Icon>
      </TabTitleIcon>
    ) : null}

    <TabTitleText>{title}</TabTitleText>
  </>
);
