import React from 'react';
import { useDispatch } from 'react-redux';

import {
  ActionList,
  Card,
  CardBody,
  CardFooter,
  CardTitle,
  ClipboardCopy,
  Content,
  ContentVariants,
  Form,
  FormGroup,
  Label,
  LabelGroup,
  TextInput,
} from '@patternfly/react-core';

import { isRestrictedEnv } from '~/restrictedEnv';
import { Ingress } from '~/types/clusters_mgmt.v1';
import { AugmentedCluster } from '~/types/types';

import ButtonWithTooltip from '../../../../../../common/ButtonWithTooltip';
import { modalActions } from '../../../../../../common/Modal/ModalActions';
import modals from '../../../../../../common/Modal/modals';
import { isHibernating, isHypershiftCluster, isOffline } from '../../../../../common/clusterStates';
import NetworkingSelector, { routeSelectorPairsAsStrings } from '../../NetworkingSelector';
import EditClusterIngressDialog from '../EditClusterIngressDialog';

import './ClusterIngressCard.scss';

const resolveDisableEditReason = ({
  canEdit,
  isReadOnly,
  isSTSEnabled,
  clusterHibernating,
  hypershiftCluster,
}: {
  canEdit?: boolean;
  isReadOnly: boolean;
  isSTSEnabled: boolean;
  clusterHibernating: boolean;
  hypershiftCluster: boolean;
}) => {
  const readOnlyReason = isReadOnly && 'This operation is not available during maintenance';
  const STSEnabledReason =
    isSTSEnabled &&
    !hypershiftCluster &&
    'Cluster ingress can only be edited for ROSA hosted control plane clusters or clusters not using Security Token Service (STS)';
  const hibernatingReason =
    clusterHibernating && 'This operation is not available while cluster is hibernating';
  const canNotEditReason =
    !canEdit &&
    'You do not have permission to edit routers. Only cluster owners, cluster editors, and organization administrators can edit routers.';
  return STSEnabledReason || readOnlyReason || hibernatingReason || canNotEditReason;
};

type ClusterIngressCardProps = {
  refreshCluster: () => void;
  clusterRoutersData: Ingress[];
  cluster: AugmentedCluster;
};

const ClusterIngressCard = ({
  refreshCluster,
  clusterRoutersData,
  cluster,
}: ClusterIngressCardProps) => {
  const provider = cluster.cloud_provider?.id ?? 'N/A';
  const consoleURL = cluster.console?.url;
  const controlPlaneAPIEndpoint = cluster.api?.url;
  const isApiPrivate = cluster.api?.listening === 'internal';
  const clusterRouters = NetworkingSelector(clusterRoutersData);
  const hasAdditionalRouter = Object.keys(clusterRouters).length === 2;

  const additionalRouterAddress = hasAdditionalRouter
    ? clusterRouters.additional?.address
    : `apps2${clusterRouters.default?.address?.substr(4)}`;

  const additionalRouterLabels = routeSelectorPairsAsStrings(
    clusterRouters?.additional?.routeSelectors,
  );
  const isAdditionalRouterPrivate = !!clusterRouters?.additional?.isPrivate;

  const { canEdit } = cluster;

  const isReadOnly = cluster?.status?.configuration_mode === 'read_only';
  const isSTSEnabled = cluster?.aws?.sts?.enabled === true;
  const clusterHibernating = isHibernating(cluster);
  const showConsoleLink = consoleURL && !isOffline(cluster);
  const hypershiftCluster = isHypershiftCluster(cluster);

  const dispatch = useDispatch();
  const handleEditSettings = () => {
    dispatch(modalActions.openModal(modals.EDIT_CLUSTER_INGRESS));
  };

  const disableEditReason = resolveDisableEditReason({
    canEdit,
    isReadOnly,
    isSTSEnabled,
    clusterHibernating,
    hypershiftCluster,
  });

  return (
    <Card className="ocm-c-networking-cluster-ingress__card">
      <CardTitle>Cluster ingress</CardTitle>
      <CardBody className="ocm-c-networking-cluster-ingress__card--body">
        <Form isHorizontal>
          <FormGroup fieldId="console_url" label="Cluster console URL" isStack>
            {consoleURL?.length ? (
              <>
                <ClipboardCopy name="console_url" isReadOnly>
                  {consoleURL}
                </ClipboardCopy>
                {showConsoleLink && (
                  <Content>
                    <Content component={ContentVariants.small}>
                      <a href={consoleURL} target="_blank" rel="noopener noreferrer">
                        Open console
                      </a>
                    </Content>
                  </Content>
                )}
              </>
            ) : (
              <TextInput value="N/A" type="text" readOnlyVariant="default" />
            )}
          </FormGroup>
          <FormGroup
            fieldId="control_plane_api_endpoint"
            label="Control Plane API endpoint"
            isStack
          >
            <ClipboardCopy name="control_plane_api_endpoint" isReadOnly>
              {controlPlaneAPIEndpoint as string}
            </ClipboardCopy>
            <Content>
              <Content component={ContentVariants.small}>
                {`${isApiPrivate || isRestrictedEnv() ? 'Private' : 'Public'} API`}
              </Content>
            </Content>
          </FormGroup>
          {hasAdditionalRouter && (
            <>
              <FormGroup fieldId="additional_router_address" label="Additional router" isStack>
                <TextInput
                  id="additional_router_address"
                  value={`*.${additionalRouterAddress}`}
                  readOnlyVariant="default"
                />
                <Content>
                  <Content component={ContentVariants.small}>
                    {`${
                      isAdditionalRouterPrivate || isRestrictedEnv() ? 'Private' : 'Public'
                    } router`}
                  </Content>
                </Content>
              </FormGroup>
              <FormGroup fieldId="labels_additional_router" label="Label match" isStack>
                {Array.isArray(additionalRouterLabels) && (
                  <LabelGroup isCompact>
                    {additionalRouterLabels.map((text) => (
                      <Label isCompact color="blue">
                        {text}
                      </Label>
                    ))}
                  </LabelGroup>
                )}
              </FormGroup>
            </>
          )}
          <EditClusterIngressDialog
            provider={provider}
            refreshCluster={refreshCluster}
            cluster={cluster}
            clusterRoutersData={clusterRoutersData}
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
              data-testid="edit-cluster-ingress"
            >
              Edit cluster ingress
            </ButtonWithTooltip>
          </ActionList>
        </CardFooter>
      )}
    </Card>
  );
};

export { ClusterIngressCard };
