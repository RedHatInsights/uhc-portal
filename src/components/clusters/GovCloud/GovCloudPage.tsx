import * as React from 'react';

import { PageSection, Spinner } from '@patternfly/react-core';

import { AppPage } from '~/components/App/AppPage';

import GovCloudConfirm from './GovCloudConfirm';
import GovCloudForm from './GovCloudForm';
import GovCloudPrereqErrorPage from './GovCloudPrereqErrorPage';
import GovCloudTCPage from './GovCloudTCPage';
import { useHasGovEmail } from './use-gov-email';
import { useTCSigned } from './use-tc-signed';

import './GovCloudPage.css';

const govCloudTitle = 'Access request for Red Hat OpenShift Service on AWS (ROSA) FedRAMP';

const GovCloudPage = () => {
  const [showConfirm, setShowConfirm] = React.useState(false);
  const [tcSigned, redirectURL, tcLoading, tcError] = useTCSigned();
  const [hasGovEmail, emailLoading, emailError] = useHasGovEmail();

  const error = tcError || emailError;
  const loading = tcLoading || emailLoading;
  let body: React.ReactNode;
  if (error) {
    body = <GovCloudPrereqErrorPage message={error} />;
  } else if (loading) {
    body = <Spinner aria-label="Loading..." />;
  } else if (!tcSigned) {
    body = <GovCloudTCPage redirectURL={redirectURL} />;
  } else if (showConfirm) {
    body = <GovCloudConfirm />;
  } else {
    body = (
      <GovCloudForm
        title={govCloudTitle}
        onSubmitSuccess={() => setShowConfirm(true)}
        hasGovEmail={hasGovEmail}
      />
    );
  }

  return (
    <AppPage title={`${govCloudTitle} | Red Hat OpenShift Cluster Manager`}>
      <PageSection hasBodyWrapper={false} className="govcloud-page">
        {body}
      </PageSection>
    </AppPage>
  );
};

export default GovCloudPage;
