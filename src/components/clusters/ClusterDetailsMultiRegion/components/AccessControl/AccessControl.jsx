import React, { useEffect, useState } from 'react';
import get from 'lodash/get';
import PropTypes from 'prop-types';

import { Card, CardBody, Tab, Tabs, TabTitleText } from '@patternfly/react-core';

import { isCompatibleFeature, SupportedFeature } from '~/common/featureCompatibility';
import clusterStates, {
  isHibernating,
  isHypershiftCluster,
} from '~/components/clusters/common/clusterStates';

import {
  isExtenalAuthenicationActive,
  isReadyForAwsAccessActions,
  isReadyForExternalActions,
  isReadyForIdpActions,
  isReadyForRoleAccessActions,
} from '../../clusterDetailsHelper';

import { ClusterTransferSection } from './ClusterTransferOwnership/ClusterTransferSection';
import { ExternalAuthenticationSection } from './ExternalAuthentication/ExternalAuthenticationSection';
import IDPSection from './IDPSection';
import NetworkSelfServiceSection from './NetworkSelfServiceSection';
import OCMRolesSection from './OCMRolesSection';
import UsersSection from './UsersSection';

import './AccessControl.scss';

function AccessControl({
  cluster,
  refreshEvent = null,
  isAutoClusterTransferOwnershipEnabled = false,
  isROSA,
}) {
  const [activeKey, setActiveKey] = React.useState(0);

  const clusterID = cluster?.id;
  const subscriptionID = cluster?.subscription?.id;
  const region = cluster?.subscription?.rh_region_id;
  const canUpdateClusterResource = cluster?.canUpdateClusterResource;

  // class for whether display vertical tabs (wider screen)
  const [isVerticalTab, setIsVerticalTab] = useState(true);
  const [tabClass, setTabClass] = useState('');

  // class for whether display tab titles (hide when there's single tab)
  const [bodyClass, setBodyClass] = useState('');
  const clusterUrls = {
    console: get(cluster, 'console.url'),
    api: get(cluster, 'api.url'),
  };
  // states based on the cluster
  const [isReadOnly, setIsReadOnly] = useState(false);
  const [clusterRolesAndAccessIsHidden, setClusterRolesAndAccessIsHidden] = useState(false);
  const [identityProvidersIsHidden, setIdentityProvidersIsHidden] = useState(false);
  const [AWSInfrastructureAccessIsHidden, setAWSInfrastructureAccessIsHidden] = useState(false);
  const [externalAuthenicationIsHidden, setExternalAuthenicationIsHidden] = useState(false);
  const [transferOwnershipIsHidden, setTransferOwnershipIsHidden] = useState(false);

  const isHypershift = isHypershiftCluster(cluster);

  // dynamically adjust the tab to be vertical (wider screen) or on the top
  useEffect(() => {
    const minWidthQuery = window.matchMedia ? window.matchMedia('(min-width: 768px)') : null;
    const handler = (e) => {
      if (e.matches) {
        setIsVerticalTab(true);
        setTabClass('');
      } else {
        setIsVerticalTab(false);
        // add the class for displaying the arrow buttons at the end of tab bar
        setTabClass('pf-m-scrollable');
      }
    };
    if (window.matchMedia) {
      // use vertical tab if it's larger than the min-width
      handler(minWidthQuery);
      minWidthQuery.addEventListener('change', handler);
    }
    return () => {
      if (minWidthQuery) {
        minWidthQuery.removeEventListener('change', handler);
      }
    };
  }, []);

  useEffect(() => {
    const hideExternalAuthenication =
      !isReadyForExternalActions(cluster) || !isExtenalAuthenicationActive(cluster);
    const hideRolesActions =
      !isReadyForRoleAccessActions(cluster) || isExtenalAuthenicationActive(cluster);
    const hideIdpActions = !isReadyForIdpActions(cluster) || isExtenalAuthenicationActive(cluster);
    const hideAwsInfrastructureAccess = !isReadyForAwsAccessActions(cluster);
    const hideTransferOwnership =
      !isAutoClusterTransferOwnershipEnabled ||
      cluster.state !== clusterStates.ready ||
      !isCompatibleFeature(SupportedFeature.AUTO_CLUSTER_TRANSFER_OWNERSHIP, cluster);

    setClusterRolesAndAccessIsHidden(hideRolesActions);
    setIdentityProvidersIsHidden(hideIdpActions);
    setAWSInfrastructureAccessIsHidden(hideAwsInfrastructureAccess);
    setIsReadOnly(cluster?.status?.configuration_mode === 'read_only');
    setExternalAuthenicationIsHidden(hideExternalAuthenication);
    setTransferOwnershipIsHidden(hideTransferOwnership);

    // hide the tab title if there is only one tab ("OCM Roles and Access").
    const isSingleTab = hideRolesActions && hideIdpActions && hideAwsInfrastructureAccess;
    setBodyClass(
      isSingleTab ? 'single-tab access-control-tab-content' : 'access-control-tab-content',
    );
  }, [cluster, isAutoClusterTransferOwnershipEnabled]);

  return (
    <Card>
      <CardBody id="cluster-details-access-control-tab-contents" className={bodyClass}>
        <Tabs
          activeKey={activeKey}
          onSelect={(event, key) => setActiveKey(key)}
          isVertical={isVerticalTab}
          className={tabClass}
        >
          <Tab
            eventKey={0}
            id="identity-providers"
            title={<TabTitleText>Identity providers</TabTitleText>}
            isHidden={identityProvidersIsHidden}
          >
            <IDPSection
              clusterID={clusterID}
              isHypershift={isHypershift}
              clusterUrls={clusterUrls}
              idpActions={cluster.idpActions}
              clusterHibernating={isHibernating(cluster)}
              isReadOnly={isReadOnly}
              subscriptionID={subscriptionID}
              cluster={cluster}
              isROSA={isROSA}
            />
          </Tab>
          <Tab
            eventKey={1}
            id="cluster-roles-access"
            title={<TabTitleText>Cluster Roles and Access</TabTitleText>}
            isHidden={clusterRolesAndAccessIsHidden}
          >
            <UsersSection
              cluster={cluster}
              clusterHibernating={isHibernating(cluster)}
              isReadOnly={isReadOnly}
              region={region}
              isROSA={isROSA}
              isHypershift={isHypershift}
            />
          </Tab>
          <Tab
            eventKey={2}
            id="ocm-roles-access"
            title={<TabTitleText>OCM Roles and Access</TabTitleText>}
          >
            <OCMRolesSection
              subscription={cluster.subscription}
              canEditOCMRoles={cluster.canEditOCMRoles}
              canViewOCMRoles={cluster.canViewOCMRoles}
              refreshEvent={refreshEvent}
            />
          </Tab>
          <Tab
            eventKey={3}
            id="aws-infra-access"
            isHidden={AWSInfrastructureAccessIsHidden}
            title={<TabTitleText>AWS infrastructure access</TabTitleText>}
          >
            <NetworkSelfServiceSection
              clusterID={get(cluster, 'id')}
              canEdit={cluster.canEdit}
              clusterHibernating={isHibernating(cluster)}
              isReadOnly={isReadOnly}
              region={region}
            />
          </Tab>
          <Tab
            eventKey={4}
            id="external-authentication"
            title={<TabTitleText>External authentication</TabTitleText>}
            isHidden={externalAuthenicationIsHidden}
          >
            <ExternalAuthenticationSection
              canUpdateClusterResource={canUpdateClusterResource}
              clusterID={clusterID}
              subscriptionID={subscriptionID}
              region={region}
            />
          </Tab>
          <Tab
            eventKey={5}
            id="transfer-ownership"
            title={<TabTitleText>Transfer Ownership</TabTitleText>}
            isHidden={transferOwnershipIsHidden}
          >
            <ClusterTransferSection
              canEdit={cluster?.canEdit}
              clusterExternalID={cluster.subscription?.external_cluster_id}
              subscription={cluster.subscription}
            />
          </Tab>
        </Tabs>
      </CardBody>
    </Card>
  );
}

AccessControl.propTypes = {
  cluster: PropTypes.object.isRequired,
  refreshEvent: PropTypes.object,
  isAutoClusterTransferOwnershipEnabled: PropTypes.bool,
  isROSA: PropTypes.bool.isRequired,
};

export default AccessControl;
