import React from 'react';
import PropTypes from 'prop-types';

import {
  PageSection,
  Spinner,
  Tab,
  Tabs,
  TabTitleIcon,
  TabTitleText,
} from '@patternfly/react-core';
import { CloudIcon } from '@patternfly/react-icons/dist/esm/icons/cloud-icon';
import { LaptopIcon } from '@patternfly/react-icons/dist/esm/icons/laptop-icon';
import { ServerIcon } from '@patternfly/react-icons/dist/esm/icons/server-icon';

import { useNavigate } from '~/common/routing';
import { AppPage } from '~/components/App/AppPage';
import { isRestrictedEnv } from '~/restrictedEnv';

import { shouldRefetchQuota } from '../../../common/helpers';
import Breadcrumbs from '../../common/Breadcrumbs';
import PageTitle from '../../common/PageTitle';

import CloudTab from './CloudTab/CloudTab';
import DatacenterTab from './DatacenterTab';
import LocalTab from './LocalTab';

import './CreateClusterPage.scss';

const hashToTabIndex = {
  cloud: 0,
  datacenter: 1,
  local: 2,
};

const tabIndexToHash = Object.entries(hashToTabIndex).reduce((acc, tabIndex) => {
  const [key, value] = tabIndex;
  // eslint-disable-next-line no-param-reassign
  acc[value] = key;
  return acc;
}, {});

const CreateCluster = ({
  getOrganizationAndQuota,
  organization,
  getAuthToken,
  hasOSDQuota,
  hasOSDTrialQuota,
  rosaCreationWizardFeature,
  token,
  activeTab,
}) => {
  const navigate = useNavigate();

  React.useEffect(() => {
    if (shouldRefetchQuota(organization, false)) {
      getOrganizationAndQuota();
    }
    getAuthToken();
    // only run once on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleTabClick = (event, tabIndex) => {
    const tabHash = tabIndexToHash[tabIndex];
    navigate(`/create/${tabHash}`);
  };

  const activeTabIndex = hashToTabIndex[activeTab] || 0;

  const title = (
    <PageTitle
      title="Select an OpenShift cluster type to create"
      breadcrumbs={<Breadcrumbs path={[{ label: 'Cluster List' }, { label: 'Cluster Type' }]} />}
    />
  );

  const tabTitle = (tabKey) => {
    switch (tabKey) {
      case 0:
        return (
          <>
            <TabTitleIcon>
              <CloudIcon />
            </TabTitleIcon>
            <TabTitleText>Cloud</TabTitleText>
          </>
        );
      case 1:
        return (
          <>
            <TabTitleIcon>
              <ServerIcon />
            </TabTitleIcon>
            <TabTitleText>Datacenter</TabTitleText>
          </>
        );
      case 2:
        return (
          <>
            <TabTitleIcon>
              <LaptopIcon />
            </TabTitleIcon>
            <TabTitleText>Local</TabTitleText>
          </>
        );
      default:
        return null;
    }
  };

  const quotaRequestComplete = organization.fulfilled || organization.error;

  return (
    <AppPage title="Create an OpenShift cluster | Red Hat OpenShift Cluster Manager">
      {quotaRequestComplete ? (
        <>
          {title}
          <PageSection hasBodyWrapper={false} className="cluster-create-page">
            <Tabs isFilled activeKey={activeTabIndex} onSelect={handleTabClick}>
              {[
                <Tab eventKey={0} title={tabTitle(0)} key="cloudTab">
                  <CloudTab
                    hasOSDQuota={hasOSDQuota}
                    rosaCreationWizardFeature={rosaCreationWizardFeature}
                    trialEnabled={hasOSDTrialQuota}
                  />
                </Tab>,
                ...(isRestrictedEnv()
                  ? []
                  : [
                      <Tab eventKey={1} title={tabTitle(1)} key="datacenterTab">
                        <DatacenterTab />
                      </Tab>,
                      <Tab eventKey={2} title={tabTitle(2)} key="localTab">
                        <LocalTab token={token} />
                      </Tab>,
                    ]),
              ]}
            </Tabs>
          </PageSection>
        </>
      ) : (
        <>
          {title}
          <PageSection hasBodyWrapper={false}>
            <div className="pf-v6-u-text-align-center">
              <Spinner size="lg" aria-label="Loading..." />
            </div>
          </PageSection>
        </>
      )}
    </AppPage>
  );
};

CreateCluster.propTypes = {
  hasOSDQuota: PropTypes.bool.isRequired,
  hasOSDTrialQuota: PropTypes.bool.isRequired,
  rosaCreationWizardFeature: PropTypes.bool,
  organization: PropTypes.shape({
    fulfilled: PropTypes.bool,
    error: PropTypes.bool,
  }).isRequired,
  getOrganizationAndQuota: PropTypes.func.isRequired,
  token: PropTypes.object.isRequired,
  getAuthToken: PropTypes.func.isRequired,
  activeTab: PropTypes.string,
};

export default CreateCluster;
