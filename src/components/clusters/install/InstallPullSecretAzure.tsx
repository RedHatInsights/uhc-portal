import React from 'react';

import { Alert, Card, PageSection, Title } from '@patternfly/react-core';

import { AppPage } from '~/components/App/AppPage';
import useAuthToken from '~/hooks/useAuthToken';
import { ErrorState } from '~/types/types';

import ExternalLink from '../../common/ExternalLink';
import PageTitle from '../../common/PageTitle';

import PullSecretSection from './instructions/components/PullSecretSection';
import TokenErrorAlert from './instructions/components/TokenErrorAlert';

export const InstallPullSecretAzure = () => {
  const token = useAuthToken();
  const azureText =
    'Download or copy your pull secret. Your pull secret provides your Azure Red Hat OpenShift cluster with access to additional content provided by Red Hat.';
  const msDocLink = 'https://docs.microsoft.com/en-us/azure/openshift/howto-add-update-pull-secret';

  const isErrorStateObj = (
    obj:
      | ErrorState
      | {
          auths: {
            [key: string]: unknown;
          };
        },
  ): obj is ErrorState => obj && typeof obj === 'object' && 'error' in obj;

  return (
    <AppPage title="Install OpenShift 4 | Pull Secret">
      <PageTitle title="Azure Red Hat OpenShift" />
      <PageSection hasBodyWrapper={false} className="ocp-instructions">
        <>
          <Title headingLevel="h3" size="2xl" className="pf-v6-u-mb-xl">
            Red Hat content access
          </Title>
          <Card>
            <div className="pf-v6-l-grid pf-m-gutter ocm-page pf-v6-u-m-xl">
              {isErrorStateObj(token) && token.error && <TokenErrorAlert token={token} />}
              <div className="pf-v6-c-content">
                <h3 className="pf-v6-c-title pf-m-md downloads-subtitle">Pull secret</h3>
                <PullSecretSection token={token} text={azureText} />
                <Alert
                  variant="info"
                  isInline
                  title="Connecting your cluster to OpenShift Cluster Manager"
                  className="bottom-alert"
                >
                  <p>
                    Azure Red Hat OpenShift clusters do not connect to OpenShift Cluster Manager at
                    creation time. Follow the{' '}
                    <ExternalLink href={msDocLink}>Microsoft documentation</ExternalLink> if you
                    would like to enable telemetry as a day 2 operation.
                  </p>
                </Alert>
              </div>
            </div>
          </Card>
        </>
      </PageSection>
    </AppPage>
  );
};
