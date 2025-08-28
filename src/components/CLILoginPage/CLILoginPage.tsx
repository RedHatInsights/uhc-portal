import React from 'react';
import { To } from 'react-router-dom';

import PageHeader from '@patternfly/react-component-groups/dist/dynamic/PageHeader';
import {
  Alert,
  Card,
  CardBody,
  CardTitle,
  PageSection,
  Spinner,
  Title,
} from '@patternfly/react-core';

import { defaultToOfflineTokens, hasRestrictTokensCapability } from '~/common/restrictTokensHelper';
import { isRestrictedEnv } from '~/restrictedEnv';
import { Error } from '~/types/accounts_mgmt.v1';

import { AppPage } from '../App/AppPage';
import Breadcrumbs from '../common/Breadcrumbs';

import InstructionsOCM from './Instructions';
import InstructionsROSA from './InstructionsROSA';
import useOrganization from './useOrganization';

const ErrorOrLoadingWrapper = ({ children }: { children: React.ReactElement }) => (
  <AppPage title="OpenShift Cluster Manager">
    <PageHeader title="OpenShift Cluster Manager" subtitle="" />
    <PageSection hasBodyWrapper={false}>
      <Card>
        <CardTitle>
          <Title headingLevel="h2">OpenShift Cluster Manager CLI login</Title>
        </CardTitle>
        <CardBody>{children}</CardBody>
      </Card>
    </PageSection>
  </AppPage>
);

type CLILoginPageProps = {
  showToken?: boolean;
  showPath?: To;
  isRosa?: boolean;
};

const CLILoginPage = ({ showToken = false, showPath, isRosa = false }: CLILoginPageProps) => {
  const { organization, isLoading, error } = useOrganization();

  const [shouldShowTokens, setShouldShowTokens] = React.useState<boolean>(false);

  const restrictedEnv = isRestrictedEnv();
  let restrictTokens = false;

  if (!restrictedEnv) {
    const errorData = error as Error;

    if (isLoading) {
      return (
        <ErrorOrLoadingWrapper>
          <Spinner size="lg" aria-label="Loading..." />
        </ErrorOrLoadingWrapper>
      );
    }

    if (error && !defaultToOfflineTokens) {
      return (
        <ErrorOrLoadingWrapper>
          <Alert
            variant="danger"
            isInline
            title="Error retrieving user account"
            role="alert"
            className="error-box"
            data-testid="alert-error"
          >
            <p>{errorData.reason}</p>
            <p>{`Operation ID: ${errorData.operation_id || 'N/A'}`}</p>
          </Alert>
        </ErrorOrLoadingWrapper>
      );
    }

    restrictTokens =
      !!organization?.capabilities && hasRestrictTokensCapability(organization.capabilities);
  }

  const pageTitle = isRosa
    ? `Red Hat OpenShift Service on AWS (ROSA) ${!restrictedEnv && (restrictTokens || !shouldShowTokens) ? 'SSO login' : 'API Token'}`
    : `OpenShift Cluster Manager ${!restrictedEnv && (restrictTokens || !shouldShowTokens) ? 'SSO login' : 'API Token'}`;
  const Instructions = isRosa ? InstructionsROSA : InstructionsOCM;

  return (
    <AppPage title={`${restrictTokens ? 'SSO Login' : 'API Token'} | OpenShift Cluster Manager`}>
      <PageHeader
        title={pageTitle}
        subtitle=""
        breadcrumbs={
          !restrictTokens && (
            <Breadcrumbs
              path={[{ label: 'Downloads', path: '/downloads' }, { label: pageTitle }]}
            />
          )
        }
      />
      <PageSection hasBodyWrapper={false}>
        <Instructions
          setShouldShowTokens={setShouldShowTokens}
          shouldShowTokens={shouldShowTokens}
          show={showToken}
          showPath={showPath}
          SSOLogin={restrictTokens}
          isRosa={isRosa}
        />
      </PageSection>
    </AppPage>
  );
};

export default CLILoginPage;
