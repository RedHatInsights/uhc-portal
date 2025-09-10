/*
Copyright (c) 2018 Red Hat, Inc.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

  http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

import React, { useEffect } from 'react';
import get from 'lodash/get';
import { connect } from 'react-redux';
import { Route, Routes, useLocation } from 'react-router-dom';

import useChrome from '@redhat-cloud-services/frontend-components/useChrome';

import { Navigate, ocmBaseName } from '~/common/routing';
import ClusterDetailsClusterOrExternalIdMR from '~/components/clusters/ClusterDetailsMultiRegion/ClusterDetailsClusterOrExternalId';
import {
  AUTO_CLUSTER_TRANSFER_OWNERSHIP,
  HYPERSHIFT_WIZARD_FEATURE,
} from '~/queries/featureGates/featureConstants';
import { useFeatureGate } from '~/queries/featureGates/useFetchFeatureGate';
import { isRestrictedEnv } from '~/restrictedEnv';
import apiRequest from '~/services/apiRequest';

import { normalizedProducts } from '../../common/subscriptionTypes';
import AIRootApp from '../AIComponents/AIRootApp';
import CLILoginPage from '../CLILoginPage/CLILoginPage';
import ArchivedClusterListMultiRegion from '../clusters/ArchivedClusterListMultiRegion';
import ClusterDetailsSubscriptionIdMultiRegion from '../clusters/ClusterDetailsMultiRegion/ClusterDetailsSubscriptionIdMultiRegion';
import AccessRequestNavigate from '../clusters/ClusterDetailsMultiRegion/components/AccessRequest/components/AccessRequestNavigate';
import IdentityProviderPageMultiregion from '../clusters/ClusterDetailsMultiRegion/components/IdentityProvidersPage/index';
import ClusterListMultiRegion from '../clusters/ClusterListMultiRegion';
import ClusterRequestList from '../clusters/ClusterTransfer/ClusterRequest';
import CreateClusterPage from '../clusters/CreateClusterPage';
import GovCloudPage from '../clusters/GovCloud/GovCloudPage';
import InsightsAdvisorRedirector from '../clusters/InsightsAdvisorRedirector';
import { InstallPullSecretAzure } from '../clusters/install/InstallPullSecretAzure';
import { InstallRouteMap } from '../clusters/install/InstallWrapper';
import { routesData } from '../clusters/install/InstallWrapperRoutes';
import RegisterCluster from '../clusters/RegisterCluster';
import { CreateOsdWizard } from '../clusters/wizards/osd';
import CreateROSAWizard from '../clusters/wizards/rosa';
import GetStartedWithROSA from '../clusters/wizards/rosa/CreateRosaGetStarted';
import EntitlementConfig from '../common/EntitlementConfig/index';
import TermsGuard from '../common/TermsGuard';
import Dashboard from '../dashboard';
import DownloadsPage from '../downloads/DownloadsPage';
import Overview from '../overview';
import Quota from '../quota';
import Releases from '../releases';
import RosaHandsOnPage from '../RosaHandsOn/RosaHandsOnPage';
import { ServicePage } from '../services/servicePage/ServicePage';

import ApiError from './ApiError';
import { AppPage } from './AppPage';
import NotFoundError from './NotFoundError';
import { is404, metadataByRoute } from './routeMetadata';

interface RouterProps {
  planType: string;
  clusterId: string;
  externalClusterId: string;
}

const Router: React.FC<RouterProps> = ({ planType, clusterId, externalClusterId }) => {
  const { pathname, search } = useLocation();

  const {
    segment: { setPageMetadata },
  } = useChrome();

  const isHypershiftWizardEnabled = useFeatureGate(HYPERSHIFT_WIZARD_FEATURE);
  const isClusterTransferOwnershipEnabled = useFeatureGate(AUTO_CLUSTER_TRANSFER_OWNERSHIP);

  // For testing purposes, show which major features are enabled/disabled
  React.useEffect(() => {
    // eslint-disable-next-line no-console
    console.info(
      '---------------Features---------------\n',
      `HYPERSHIFT_WIZARD_FEATURE: ${isHypershiftWizardEnabled ? 'Enabled' : 'Disabled'}\n`,
      '-------------------------------------',
    );
  }, [isHypershiftWizardEnabled]);

  useEffect(() => {
    setPageMetadata({
      ...metadataByRoute(pathname.replace(ocmBaseName, ''), planType, clusterId, externalClusterId),
      ...(is404() ? { title: '404 Not Found' } : {}),
    });
  }, [pathname, planType, clusterId, externalClusterId, setPageMetadata]);

  return (
    <ApiError apiRequest={apiRequest}>
      <Routes>
        {/*
              IMPORTANT!
              When adding new routes, make sure to add the route both here and in Router.test.jsx,
              to ensure the route is tested.
            */}
        <Route
          path="/install/osp/installer-provisioned"
          element={<Navigate replace to="/install/openstack/installer-provisioned" />}
        />
        <Route
          path="/install/crc/installer-provisioned"
          element={<Navigate replace to="/create/local" />}
        />
        <Route path="/token/moa" element={<Navigate replace to="/token/rosa" />} />
        <Route path="/insights" element={<Navigate replace to="/dashboard" />} />
        <Route path="/subscriptions" element={<Navigate replace to="/quota" />} />
        <Route path="/downloads" element={<DownloadsPage />} />
        {/* Each token page has 2 routes with distinct paths, to remember that user wanted
                to see it during page reload that may be needed for elevated auth. */}
        <Route
          path="/token/rosa/show"
          element={
            <TermsGuard gobackPath="/">
              <AppPage>
                <CLILoginPage showToken isRosa />
                <EntitlementConfig />
              </AppPage>
            </TermsGuard>
          }
        />
        <Route
          path="/token/rosa"
          element={
            <TermsGuard gobackPath="/">
              <AppPage>
                <CLILoginPage showToken={false} showPath="/token/rosa/show" isRosa />
                <EntitlementConfig />
              </AppPage>
            </TermsGuard>
          }
        />
        {InstallRouteMap(routesData)}
        <Route path="/token/show" element={<CLILoginPage showToken />} />
        <Route path="/token" element={<CLILoginPage showToken={false} showPath="/token/show" />} />
        <Route path="/install/azure/aro-provisioned" element={<InstallPullSecretAzure />} />
        <Route path="/install" element={<Navigate replace to="/create" />} />
        <Route path="/create/osd/aws" element={<Navigate replace to="/create/osd" />} />
        <Route path="/create/osd/gcp" element={<Navigate replace to="/create/osd" />} />
        <Route path="/create/osdtrial/aws" element={<Navigate replace to="/create/osdtrial" />} />
        <Route path="/create/osdtrial/gcp" element={<Navigate replace to="/create/osdtrial" />} />
        <Route
          path="/create/osdtrial"
          element={
            <TermsGuard gobackPath="/create">
              <CreateOsdWizard product={normalizedProducts.OSDTrial} />
            </TermsGuard>
          }
        />
        <Route
          path="/create/osd"
          element={
            <TermsGuard gobackPath="/create">
              <CreateOsdWizard />
            </TermsGuard>
          }
        />
        <Route path="/create/cloud" element={<CreateClusterPage activeTab="cloud" />} />
        <Route path="/create/datacenter" element={<CreateClusterPage activeTab="datacenter" />} />
        <Route path="/create/local" element={<CreateClusterPage activeTab="local" />} />
        <Route
          path="/create/rosa/welcome"
          element={<Navigate replace to="/create/rosa/getstarted" />}
        />
        <Route
          path="/create/rosa/getstarted"
          element={
            <TermsGuard gobackPath="/create">
              <GetStartedWithROSA />
            </TermsGuard>
          }
        />
        <Route path="/create/rosa/govcloud" element={<GovCloudPage />} />
        <Route
          path="/create/rosa/wizard"
          element={
            <TermsGuard gobackPath="/create">
              <CreateROSAWizard />
            </TermsGuard>
          }
        />
        <Route path="/create" element={<CreateClusterPage activeTab="" />} />
        <Route
          path="/details/s/:id/insights/:reportId/:errorKey"
          element={<InsightsAdvisorRedirector />}
        />
        <Route
          path="/details/s/:id/add-idp/:idpTypeName"
          element={<IdentityProviderPageMultiregion />}
        />
        <Route
          path="/details/s/:id/edit-idp/:idpName"
          element={<IdentityProviderPageMultiregion isEditForm />}
        />
        {/* WARNING! The "/details/s/:id" route is used by catchpoint tests which determine
        'Operational' or 'Major Outage' status for "OpenShift Cluster Manager" on the
        'http:///status.redhat.com' site. If this route is changed, then the related catchpoint
        tests must be updated. For more info. see: https://issues.redhat.com/browse/OCMUI-2398 */}
        <Route path="/details/s/:id" element={<ClusterDetailsSubscriptionIdMultiRegion />} />
        <Route
          path="/details/:id/insights/:reportId/:errorKey"
          element={<InsightsAdvisorRedirector />}
        />
        <Route path="/details/:id" element={<ClusterDetailsClusterOrExternalIdMR />} />
        <Route path="/register" element={<RegisterCluster />} />
        <Route path="/quota/resource-limits" element={<Quota marketplace />} />
        <Route path="/quota" element={<Quota />} />
        <Route path="/archived" element={<ArchivedClusterListMultiRegion getMultiRegion />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/overview/rosa/hands-on" element={<RosaHandsOnPage />} />
        <Route path="/overview/rosa" element={<ServicePage serviceName="ROSA" />} />
        <Route path="/overview/osd" element={<ServicePage serviceName="OSD" />} />
        <Route path="/overview" element={<Overview />} />
        <Route path="/releases" element={<Releases />} />
        <Route path="/assisted-installer/*" element={<AIRootApp />} />
        {/* TODO: remove these redirects once links from trials and demo system emails are updated */}
        <Route
          path="/services/rosa/demo"
          element={<Navigate replace to={`/overview/rosa/hands-on/${search}`} />}
        />
        <Route
          path="/services/rosa"
          element={<Navigate replace to={`/overview/rosa${search}`} />}
        />
        <Route
          path="/access-request/:id"
          element={!isRestrictedEnv() ? <AccessRequestNavigate /> : <NotFoundError />}
        />
        {/* WARNING! The "/cluster-list" route is used by catchpoint tests which determine
        'Operational' or 'Major Outage' status for "OpenShift Cluster Manager" on the
        'http:///status.redhat.com' site. If this route is changed, then the related catchpoint
        tests must be updated. For more info. see: https://issues.redhat.com/browse/OCMUI-2398 */}
        <Route path="/cluster-list" element={<ClusterListMultiRegion getMultiRegion />} />
        {isClusterTransferOwnershipEnabled ? (
          <Route path="/cluster-request" element={<ClusterRequestList />} />
        ) : null}
        <Route
          path="/"
          element={<Navigate replace to={isRestrictedEnv() ? '/cluster-list' : '/overview'} />}
        />
        {/* catch all */}
        <Route path="*" element={<NotFoundError />} />
      </Routes>
    </ApiError>
  );
};

type RouterState = {
  clusters: any;
};
const mapStateToProps = (state: RouterState) => {
  const { cluster } = state.clusters.details;
  return {
    planType: get(cluster, 'subscription.plan.type', normalizedProducts.UNKNOWN),
    clusterId: get(cluster, 'subscription.cluster_id'),
    externalClusterId: get(cluster, 'subscription.external_cluster_id'),
  };
};

export default connect(mapStateToProps)(Router);
