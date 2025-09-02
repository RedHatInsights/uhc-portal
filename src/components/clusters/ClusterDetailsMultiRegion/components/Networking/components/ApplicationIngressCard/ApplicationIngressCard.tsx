import React from 'react';
import { useDispatch } from 'react-redux';

import {
  ActionList,
  Card,
  CardBody,
  CardFooter,
  CardTitle,
  Content,
  ContentVariants,
  Form,
  FormGroup,
  Switch,
  TextInput,
} from '@patternfly/react-core';

import { isHibernating, isHypershiftCluster } from '~/components/clusters/common/clusterStates';
import { CloudProviderType } from '~/components/clusters/wizards/common';
import { modalActions } from '~/components/common/Modal/ModalActions';
import { isRestrictedEnv } from '~/restrictedEnv';
import { Ingress } from '~/types/clusters_mgmt.v1';
import { LoadBalancerFlavor } from '~/types/clusters_mgmt.v1/enums';
import { ClusterWithPermissions } from '~/types/types';

import ButtonWithTooltip from '../../../../../../common/ButtonWithTooltip';
import modals from '../../../../../../common/Modal/modals';
import {
  canConfigureDayTwoManagedIngress,
  canConfigureLoadBalancer,
} from '../../NetworkingHelpers';
import NetworkingSelector, {
  excludedNamespacesAsString,
  routeSelectorsAsString,
} from '../../NetworkingSelector';
import { LoadBalancerFlavorLabel } from '../constants';
import EditApplicationIngressDialog from '../EditApplicationIngressDialog';
import LoadBalancerPopover from '../LoadBalancerPopover';

import { ExcludedNamespacesPopover } from './ExcludedNamespacesPopover';
import { NamespaceOwnerPolicyPopover } from './NamespaceOwnerPolicyPopover';
import { RouteSelectorsPopover } from './RouteSelectorsPopover';
import { WildcardPolicyPopover } from './WildcardsPolicyPopover';

import './ApplicationIngressCard.scss';

type ResolveDisableEditReasonParams = {
  canEdit: boolean;
  isReadOnly: boolean;
  clusterHibernating: boolean;
  hasSufficientIngressEditVersion?: boolean;
  canEditLoadBalancer: boolean;
};

const resolveDisableEditReason = ({
  canEdit,
  isReadOnly,
  clusterHibernating,
  hasSufficientIngressEditVersion,
  canEditLoadBalancer,
}: ResolveDisableEditReasonParams) => {
  const canNotEditDefaultRouterReason =
    !canEditLoadBalancer &&
    !hasSufficientIngressEditVersion &&
    'This operation is available for clusters of version 4.13 or higher.';
  const readOnlyReason = isReadOnly && 'This operation is not available during maintenance';
  const hibernatingReason =
    clusterHibernating && 'This operation is not available while cluster is hibernating';
  const canNotEditReason =
    !canEdit &&
    'You do not have permission to edit routers. Only cluster owners, cluster editors, and organization administrators can edit routers.';
  return canNotEditDefaultRouterReason || readOnlyReason || hibernatingReason || canNotEditReason;
};

type ApplicationIngressCardProps = {
  cluster: ClusterWithPermissions;
  clusterRoutersData: Ingress[];
  provider: string;
  refreshCluster: () => void;
};

const ApplicationIngressCard: React.FC<ApplicationIngressCardProps> = ({
  provider,
  cluster,
  clusterRoutersData,
  refreshCluster,
}) => {
  const clusterRouters = NetworkingSelector(clusterRoutersData);
  const dispatch = useDispatch();

  const { canEdit } = cluster;
  const isHypershift = isHypershiftCluster(cluster);
  const isAWS = provider === CloudProviderType.Aws;
  const isReadOnly = cluster?.status?.configuration_mode === 'read_only';
  const isSTSEnabled = cluster?.aws?.sts?.enabled === true;
  const clusterHibernating = isHibernating(cluster);
  const clusterVersion = cluster?.openshift_version || cluster?.version?.raw_id || '';
  const hasSufficientIngressEditVersion =
    !isHypershift && canConfigureDayTwoManagedIngress(clusterVersion);
  const canEditLoadBalancer = canConfigureLoadBalancer(clusterVersion, isSTSEnabled);
  const canShowLoadBalancer = isAWS && !isHypershift;
  const {
    routeSelectors: defaultRouterSelectors,
    excludedNamespaces: defaultRouterExcludedNamespacesFlag,
    loadBalancer,
    address: defaultRouterAddress,
    isPrivate: isDefaultRouterPrivate,
    tlsSecretRef: clusterRoutesTlsSecretRef,
    isWildcardPolicyAllowed: isDefaultIngressWildcardPolicyAllowed,
    isNamespaceOwnershipPolicyStrict: isDefaultRouterNamespaceOwnershipPolicyStrict,
    hostname: clusterRoutesHostname,
  } = clusterRouters.default || {};
  const region = cluster.subscription?.rh_region_id;
  const clusterID = cluster.id;

  const isNLB = loadBalancer === LoadBalancerFlavor.nlb;

  const disableEditReason = resolveDisableEditReason({
    canEdit: !!canEdit,
    isReadOnly,
    clusterHibernating,
    hasSufficientIngressEditVersion,
    canEditLoadBalancer,
  });

  const handleEditSettings = () => {
    dispatch(modalActions.openModal(modals.EDIT_APPLICATION_INGRESS));
  };

  return (
    <Card className="ocm-c-networking-application-ingress__card">
      <CardTitle>Application ingress</CardTitle>
      <CardBody>
        <Form isHorizontal>
          <FormGroup fieldId="default_router_address" label="Default application router" isStack>
            <TextInput
              id="default_router_address"
              value={`*.${defaultRouterAddress}`}
              readOnlyVariant="default"
            />
            <Content>
              <Content component={ContentVariants.small}>
                {`${isDefaultRouterPrivate || isRestrictedEnv() ? 'Private' : 'Public'} router`}
              </Content>
            </Content>
          </FormGroup>

          {hasSufficientIngressEditVersion && (
            <>
              <FormGroup
                fieldId="defaultRouterSelectors"
                label="Route selector"
                labelHelp={<RouteSelectorsPopover />}
                isStack
              >
                <TextInput
                  id="defaultRouterSelectors"
                  value={routeSelectorsAsString(defaultRouterSelectors) ?? ''}
                  isDisabled
                />
              </FormGroup>

              <FormGroup
                fieldId="defaultRouterExcludedNamespacesFlag"
                label="Excluded namespaces"
                labelHelp={<ExcludedNamespacesPopover />}
                isStack
              >
                <TextInput
                  id="defaultRouterExcludedNamespacesFlag"
                  value={excludedNamespacesAsString(defaultRouterExcludedNamespacesFlag)}
                  isDisabled
                />
              </FormGroup>

              <FormGroup fieldId="clusterRoutesTlsSecretRef" label="TLS Secret name" isStack>
                <TextInput
                  id="clusterRoutesTlsSecretRef"
                  value={clusterRoutesTlsSecretRef}
                  isDisabled
                />
              </FormGroup>

              <FormGroup fieldId="clusterRoutesHostname" label="Hostname" isStack>
                <TextInput id="clusterRoutesHostname" value={clusterRoutesHostname} isDisabled />
              </FormGroup>

              <FormGroup
                label="Namespace ownership policy"
                labelHelp={<NamespaceOwnerPolicyPopover />}
                isStack
              >
                <Switch
                  label="Strict"
                  isChecked={!!isDefaultRouterNamespaceOwnershipPolicyStrict}
                  isDisabled
                />
              </FormGroup>

              <FormGroup label="Wildcard policy" labelHelp={<WildcardPolicyPopover />} isStack>
                <Switch
                  label="Allowed"
                  isChecked={isDefaultIngressWildcardPolicyAllowed}
                  isDisabled
                />
              </FormGroup>
            </>
          )}

          {canShowLoadBalancer && (
            <FormGroup label="Load balancer type" labelHelp={<LoadBalancerPopover />}>
              <Switch
                label={LoadBalancerFlavorLabel[LoadBalancerFlavor.nlb]}
                isChecked={isNLB}
                isDisabled
              />
            </FormGroup>
          )}

          <EditApplicationIngressDialog
            clusterID={clusterID}
            refreshCluster={refreshCluster}
            region={region}
            clusterRouters={clusterRouters}
            canShowLoadBalancer={canShowLoadBalancer}
            canEditLoadBalancer={canEditLoadBalancer}
            isHypershiftCluster={isHypershift}
            hasSufficientIngressEditVersion={hasSufficientIngressEditVersion}
          />
        </Form>
      </CardBody>
      {!isRestrictedEnv() && (
        <CardFooter>
          <ActionList>
            <ButtonWithTooltip
              variant="secondary"
              onClick={handleEditSettings}
              disableReason={disableEditReason}
              isAriaDisabled={!!disableEditReason}
            >
              Edit application ingress
            </ButtonWithTooltip>
          </ActionList>
        </CardFooter>
      )}
    </Card>
  );
};

export default ApplicationIngressCard;
