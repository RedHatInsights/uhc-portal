import React from 'react';
import humanizeDuration from 'humanize-duration';

import {
  Alert,
  Card,
  CardBody,
  Content,
  Flex,
  FlexItem,
  PageSection,
  Skeleton,
} from '@patternfly/react-core';

import ErrorBoundary from '../App/ErrorBoundary';

import { AugmentedDemoExperience } from './augmentedModelTypes';
import { ROSA_HANDS_ON_STATUS_ALERT_TEST_ID, UNAUTHORIZED } from './constants';
import { DemoExperienceStatusEnum } from './DemoExperienceModels';
import { RosaHandsOnCustomerSuccessLink } from './RosaHandsOnContactLinks';
import RosaHandsOnErrorPage from './RosaHandsOnErrorPage';
import RosaHandsOnGetStartedCard from './RosaHandsOnGetStartedCard';
import RosaHandsOnPageHeader from './RosaHandsOnPageHeader';
import RosaHandsOnRecommendedContentTable from './RosaHandsOnRecommendedContentTable';

const getErrorMessage = (error: unknown): string => {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === 'string') {
    return error;
  }
  return 'Unexpected error';
};

export const StatusAlert = ({ demoExperience }: { demoExperience: AugmentedDemoExperience }) => {
  const remainingTime =
    new Date(demoExperience.scheduled_delete_timestamp || '').getTime() - Date.now();
  // Guardrail: incomplete API/override payloads may omit quota (service also normalizes).
  const quotaCurrent = demoExperience.quota?.current ?? 0;
  const quotaLimit = demoExperience.quota?.limit ?? 0;
  const remainingQuota = quotaLimit - quotaCurrent;
  const launchLabel = remainingQuota === 1 ? 'launch' : 'launches';
  let alert;
  switch (demoExperience.status) {
    case 'quota-exceeded':
      alert = (
        <Alert
          component="span"
          data-testid={ROSA_HANDS_ON_STATUS_ALERT_TEST_ID}
          title={
            <>
              After {quotaLimit} launches, you can create ROSA clusters using a pay-as-you-go
              option. If you have any questions, you can{' '}
              <RosaHandsOnCustomerSuccessLink linkText="contact support" />.
            </>
          }
          isInline
          variant="info"
        />
      );
      break;
    case DemoExperienceStatusEnum.Started:
      alert = (
        <Alert
          data-testid={ROSA_HANDS_ON_STATUS_ALERT_TEST_ID}
          title={
            <>
              Your current experience demo will end in{' '}
              {humanizeDuration(remainingTime, {
                units: ['h', 'm'],
                maxDecimalPoints: 2,
                round: true,
                delimiter: ' and ',
              })}
              . You have {remainingQuota} experience {launchLabel} remaining.
            </>
          }
          variant="info"
          isInline
        />
      );
      break;
    case DemoExperienceStatusEnum.Failed:
      alert = (
        <Alert
          component="span"
          data-testid={ROSA_HANDS_ON_STATUS_ALERT_TEST_ID}
          title={
            <>
              We&apos;re experiencing an error on our end. This does not affect your quota. Try
              again and if this issue persists,{' '}
              <RosaHandsOnCustomerSuccessLink linkText="contact support" />.
            </>
          }
          variant="danger"
          isInline
        />
      );
      break;
    case DemoExperienceStatusEnum.Unavailable: {
      const alertTitle =
        demoExperience.unavailable_reason === UNAUTHORIZED ? (
          <>
            You must be logged in with your business email account to access the experience. If you
            are logged in with a business email and still cannot request, we will review your
            request when we have additional capacity.
          </>
        ) : (
          <>
            The demo system is currently unavailable. If this issue persists, you can{' '}
            <RosaHandsOnCustomerSuccessLink linkText="contact support" />.
          </>
        );
      alert = (
        <Alert
          component="span"
          data-testid={ROSA_HANDS_ON_STATUS_ALERT_TEST_ID}
          title={alertTitle}
          variant="danger"
          isInline
        />
      );
      break;
    }
    case DemoExperienceStatusEnum.Available:
      alert =
        quotaCurrent > 0 ? (
          <Alert
            component="span"
            data-testid={ROSA_HANDS_ON_STATUS_ALERT_TEST_ID}
            variant="info"
            isInline
            title={
              <>
                You have {remainingQuota} {launchLabel} remaining. If you have any questions, you
                can <RosaHandsOnCustomerSuccessLink linkText="contact support" />.
              </>
            }
          />
        ) : null;
      break;
    default:
      alert = null;
  }
  return alert;
};

export type RosaHandsOnPageContentProps = {
  error: unknown;
  requestError: unknown;
  loading: boolean;
  demoExperience: AugmentedDemoExperience;
  onRequestCluster: () => void;
};

const RosaHandsOnPageContent = ({
  error,
  loading,
  requestError,
  demoExperience,
  onRequestCluster,
}: RosaHandsOnPageContentProps) => {
  if (error) {
    return <RosaHandsOnErrorPage message={getErrorMessage(error)} />;
  }

  return (
    <ErrorBoundary>
      <RosaHandsOnPageHeader />
      <PageSection hasBodyWrapper={false}>
        <Flex direction={{ default: 'column' }} rowGap={{ default: 'rowGapMd' }}>
          <FlexItem>
            <StatusAlert demoExperience={demoExperience} />
          </FlexItem>
          {requestError ? (
            <FlexItem>
              <Alert title="Failed to request an experience" variant="danger" isInline>
                {getErrorMessage(requestError)}
              </Alert>
            </FlexItem>
          ) : null}
        </Flex>
      </PageSection>
      <>
        <PageSection hasBodyWrapper={false}>
          {loading ? (
            <Card>
              <CardBody style={{ height: '200px' }}>
                <Skeleton height="100%" screenreaderText="Loading Rosa handson demo experience" />
              </CardBody>
            </Card>
          ) : (
            <RosaHandsOnGetStartedCard
              onRequestCluster={onRequestCluster}
              demoExperience={demoExperience}
            />
          )}
        </PageSection>
        <PageSection hasBodyWrapper={false} style={{ paddingTop: 'unset' }}>
          <Content>
            <Content component="h3">Recommended content</Content>
          </Content>
        </PageSection>

        <RosaHandsOnRecommendedContentTable />
      </>
    </ErrorBoundary>
  );
};

export default RosaHandsOnPageContent;
