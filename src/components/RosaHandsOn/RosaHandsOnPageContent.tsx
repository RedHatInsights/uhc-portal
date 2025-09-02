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
import { UNAUTHORIZED } from './constants';
import { DemoExperienceStatusEnum } from './DemoExperienceModels';
import RosaHandsOnErrorPage from './RosaHandsOnErrorPage';
import RosaHandsOnGetStartedCard from './RosaHandsOnGetStartedCard';
import {
  RosaHandsOnContactSupport,
  RosaHandsOnRequestAuthorization,
} from './RosaHandsOnIntercomButtons';
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

const StatusAlert = ({ demoExperience }: { demoExperience: AugmentedDemoExperience }) => {
  const remainingTime =
    new Date(demoExperience.scheduled_delete_timestamp || '').getTime() - Date.now();
  const remainingQuota = demoExperience.quota.limit - demoExperience.quota.current;
  let alert;
  switch (demoExperience.status) {
    case 'quota-exceeded':
      alert = (
        <Alert
          title={
            <>
              After {demoExperience.quota.limit} launches, you can create ROSA clusters using a
              pay-as-you-go option. If you have any questions, you can <RosaHandsOnContactSupport />
              .
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
          title={
            <>
              Your current experience demo will end in{' '}
              {humanizeDuration(remainingTime, {
                units: ['h', 'm'],
                maxDecimalPoints: 2,
                round: true,
                delimiter: ' and ',
              })}
              . You have {remainingQuota} experience launches remaining.
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
          title={
            <>
              We&apos;re experiencing an error on our end. This does not affect your quota. Try
              again and if this issue persists, <RosaHandsOnContactSupport />.
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
            Let&apos;s get you access to the Hands-on Experience. To continue, we need some{' '}
            <RosaHandsOnRequestAuthorization />.
          </>
        ) : (
          <>
            The demo system is currently unavailable. If this issue persists, you can{' '}
            <RosaHandsOnContactSupport />.
          </>
        );
      alert = <Alert title={alertTitle} variant="danger" isInline />;
      break;
    }
    case DemoExperienceStatusEnum.Available:
      alert =
        demoExperience.quota.current > 0 ? (
          <Alert
            variant="info"
            isInline
            title={
              <>
                You have {remainingQuota} launches remaining. If you have any questions, you can{' '}
                <RosaHandsOnContactSupport />.
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
                {getErrorMessage(error)}
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
