import React from 'react';

import { UnavailableContent as PFUnavailable } from '@patternfly/react-component-groups/';
import {
  EmptyState,
  EmptyStateBody,
  ExpandableSection,
  Stack,
  StackItem,
  Title,
} from '@patternfly/react-core';
import * as Sentry from '@sentry/browser';

import ErrorDetailsDisplay from '~/components/common/ErrorDetailsDisplay';
import { ErrorState } from '~/types/types';

import './Unavailable.scss';

type ErrorProp = { key?: string; message: string; response: ErrorState };

type Props =
  | {
      errors: ErrorProp[];
      message?: undefined;
      response?: undefined;
    }
  | {
      errors?: undefined;
      message?: string;
      response: ErrorState;
    };

const Unavailable = ({ errors, message = '', response }: Props) => {
  React.useEffect(() => {
    const reportToSentry = (r: ErrorState) => {
      Sentry.withScope((scope) => {
        scope.setTag('operationID', r.operationID ?? '');
        Sentry.captureException(
          new Error(`${r.errorCode} error from server: ${r.internalErrorCode} - ${r.errorMessage}`),
        );
      });
    };
    if (errors) {
      errors.forEach((error) => {
        const { response } = error;
        reportToSentry(response);
      });
    } else {
      reportToSentry(response);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const errorDetails = ({ response: r, message: m, key = '' }: ErrorProp) => (
    <StackItem key={key}>
      <Stack>
        {m && (
          <StackItem>
            <Title headingLevel="h6">{m}</Title>
          </StackItem>
        )}
        <ErrorDetailsDisplay response={r} itemWrapper={StackItem} showErrorCode renderLinks />
      </Stack>
    </StackItem>
  );
  return (
    <EmptyState>
      <EmptyStateBody>
        <PFUnavailable />
        <ExpandableSection id="error-expand" toggleText="Error details">
          <Stack hasGutter>
            {errors ? errors.map(errorDetails) : errorDetails({ response, message })}
          </Stack>
        </ExpandableSection>
      </EmptyStateBody>
    </EmptyState>
  );
};

export default Unavailable;
