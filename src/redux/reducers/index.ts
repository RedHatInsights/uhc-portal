import { combineReducers } from 'redux';

// TODO remove ignore statement once frontend-components-notifications has types
import apiErrorReducer from '../../components/App/ApiError/ApiErrorReducer';
import clusterUsersReducer from '../../components/clusters/ClusterDetailsMultiRegion/components/AccessControl/UsersSection/UsersReducer';
import addOnsReducer from '../../components/clusters/ClusterDetailsMultiRegion/components/AddOns/AddOnsReducer';
import insightsReducer from '../../components/clusters/ClusterDetailsMultiRegion/components/Insights/InsightsReducer';
import { MonitoringReducer } from '../../components/clusters/ClusterDetailsMultiRegion/components/Monitoring/MonitoringReducer';
import { NetworkingReducer } from '../../components/clusters/ClusterDetailsMultiRegion/components/Networking/NetworkingReducer';
import { deleteProtectionReducer } from '../../components/clusters/ClusterDetailsMultiRegion/components/Overview/DetailsRight/DeleteProtection/deleteProtectionReducer';
import { InstallationLogReducer } from '../../components/clusters/ClusterDetailsMultiRegion/components/Overview/InstallationLogView/InstallationLogReducer';
import clusterUpgrades from '../../components/clusters/common/Upgrades/clusterUpgradeReducer';
import modalReducer from '../../components/common/Modal/ModalReducer';

import { accessProtectionReducer } from './accessProtectionReducer';
import ccsInquiriesReducer from './ccsInquiriesReducer';
import { cloudProvidersReducer } from './cloudProvidersReducer';
import { clusterAutoscalerReducer } from './clusterAutoscalerReducer';
import { clustersReducer } from './clustersReducer';
import { costReducer } from './costReducer';
import { dashboardsReducer } from './dashboardsReducer';
import dnsDomainsReducer from './dnsDomainsReducer';
import entitlementConfigReducer from './entitlementConfigReducer';
import flavoursReducer from './flavoursReducer';
import githubReducer from './githubReducer';
import globalErrorReducer from './globalErrorReducer';
import { loadBalancersReducer } from './loadBalancersReducer';
import machineTypesByRegionReducer from './machineTypesByRegionReducer';
import machineTypesReducer from './machineTypesReducer';
import ocmRolesReducer from './OCMRolesReducer';
import { persistentStorageReducer } from './persistentStorageReducer';
import rosaReducer from './rosaReducer';
import { subscriptionReleasedReducer } from './subscriptionReleasedReducer';
import { subscriptionSettingsReducer } from './subscriptionSettingsReducer';
import { subscriptionsReducer } from './subscriptionsReducer';
import { supportReducer } from './supportReducer';
import supportStatusReducer from './supportStatusReducer';
import tollboothReducer from './tollbooth';
import userReducer from './userReducer';
import { viewOptionsReducer } from './viewOptionsReducer';

const reducers = {
  accessProtection: accessProtectionReducer,
  clusters: clustersReducer,

  cloudProviders: cloudProvidersReducer,
  viewOptions: viewOptionsReducer,
  userProfile: userReducer,
  tollbooth: tollboothReducer,
  modal: modalReducer,
  logs: InstallationLogReducer,
  clusterAutoscaler: clusterAutoscalerReducer,
  clusterUsers: clusterUsersReducer,
  clusterSupport: supportReducer,
  dnsDomains: dnsDomainsReducer,
  addOns: addOnsReducer,
  globalError: globalErrorReducer,
  flavours: flavoursReducer,
  machineTypes: machineTypesReducer,
  machineTypesByRegion: machineTypesByRegionReducer,
  monitoring: MonitoringReducer,
  subscriptions: subscriptionsReducer,
  persistentStorageValues: persistentStorageReducer,
  loadBalancerValues: loadBalancersReducer,
  subscriptionSettings: subscriptionSettingsReducer,
  subscriptionReleased: subscriptionReleasedReducer,
  insightsData: insightsReducer,
  clusterRouters: NetworkingReducer,
  cost: costReducer,
  dashboards: dashboardsReducer,
  supportStatus: supportStatusReducer,
  entitlementConfig: entitlementConfigReducer,

  clusterUpgrades,
  apiError: apiErrorReducer,
  githubReleases: githubReducer,
  ccsInquiries: ccsInquiriesReducer,
  ocmRoles: ocmRolesReducer,
  rosaReducer,
  deleteProtection: deleteProtectionReducer,
};

const reduxReducers = combineReducers({
  ...reducers,
});

export { reducers, reduxReducers };

export default reduxReducers;
