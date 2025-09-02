import React from 'react';
import { Route } from 'react-router-dom';

import { PageSection } from '@patternfly/react-core';

import { AppPage } from '~/components/App/AppPage';
import Breadcrumbs from '~/components/common/Breadcrumbs';
import PageTitle from '~/components/common/PageTitle';
import useAuthToken from '~/hooks/useAuthToken';

import { InstructionsChooser } from './instructions/InstructionsChooser';
import { InstructionsChooserPageTitle } from './instructions/InstructionsChooserPageTitle';
import InstructionsPreRelease from './instructions/InstructionsPreRelease';
import InstructionsPullSecret from './instructions/InstructionsPullSecret';
import OCPInstructions from './instructions/OCPInstructions';
import { InstallComponentProps, Routes } from './models/types';

export const InstallComponentWrapper = (props: InstallComponentProps) => {
  const { componentChooser, propsData } = props;
  const {
    breadCrumbsPaths,
    appPageTitle,
    providerTitle,
    cloudProviderId,
    customizations,
    instructionsMapping,
    isUPI,
    showPreReleaseDocs,
    installationTypeId,
    aiPageLink,
    aiLearnMoreLink,
    hideIPI,
    ipiPageLink,
    ipiLearnMoreLink,
    hideUPI,
    upiPageLink,
    upiLearnMoreLink,
    agentBasedPageLink,
    agentBasedLearnMoreLink,
    providerSpecificFeatures,
    name,
    recommend,
    installer,
  } = propsData;

  const token = useAuthToken();

  const breadcrumbs = <Breadcrumbs path={[...breadCrumbsPaths]} />;

  const chooseComponentToRender = (componentChooser: string) => {
    switch (componentChooser) {
      case 'pullSecretInstructions':
        return <InstructionsPullSecret token={token} />;
      case 'ocpInstructions':
        return (
          <OCPInstructions
            token={token}
            cloudProviderID={cloudProviderId}
            customizations={customizations}
            showPreReleaseDocs={showPreReleaseDocs}
            installationTypeId={installationTypeId}
            isUPI={isUPI}
            {...instructionsMapping}
          />
        );
      case 'instructionsChooser':
        return (
          <InstructionsChooser
            aiPageLink={aiPageLink}
            aiLearnMoreLink={aiLearnMoreLink}
            hideIPI={hideIPI}
            ipiLearnMoreLink={ipiLearnMoreLink}
            ipiPageLink={ipiPageLink}
            hideUPI={hideUPI}
            upiPageLink={upiPageLink}
            upiLearnMoreLink={upiLearnMoreLink}
            agentBasedPageLink={agentBasedPageLink}
            agentBasedLearnMoreLink={agentBasedLearnMoreLink}
            providerSpecificFeatures={providerSpecificFeatures}
            name={name}
            recommend={recommend}
          />
        );

      default:
        return <InstructionsPreRelease token={token} installer={installer} />;
    }
  };

  return (
    <AppPage title={appPageTitle}>
      {componentChooser === 'instructionsChooser' ? (
        <InstructionsChooserPageTitle cloudName={providerTitle} breadcrumbs={breadcrumbs} />
      ) : (
        <PageTitle title={providerTitle} breadcrumbs={breadcrumbs} />
      )}
      <PageSection hasBodyWrapper={false} className="ocp-instructions">
        {chooseComponentToRender(componentChooser)}
      </PageSection>
    </AppPage>
  );
};

// Loop through all Install component Routes and render required Install component
export const InstallRouteMap = (routes: Routes[]) =>
  routes.map((route: Routes) => <Route path={route.path} element={route.element} />);
