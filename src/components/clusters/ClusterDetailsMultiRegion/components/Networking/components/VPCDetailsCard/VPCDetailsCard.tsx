import React from 'react';
import { useDispatch } from 'react-redux';

import {
  Card,
  CardBody,
  CardFooter,
  CardTitle,
  DescriptionList,
  DescriptionListDescription,
  DescriptionListGroup,
  DescriptionListTerm,
  Label,
  LabelGroup,
  Title,
} from '@patternfly/react-core';

import { stringToArray } from '~/common/helpers';
import { isHibernating } from '~/components/clusters/common/clusterStates';
import ButtonWithTooltip from '~/components/common/ButtonWithTooltip';
import { modalActions } from '~/components/common/Modal/ModalActions';
import modals from '~/components/common/Modal/modals';
import { isRestrictedEnv } from '~/restrictedEnv';
import { AugmentedCluster } from '~/types/types';

import EditClusterWideProxyDialog from '../EditClusterWideProxyDialog';

import './VPCDetailsCard.scss';

const resolveDisableEditReason = ({
  isReadOnly,
  clusterHibernating,
  canUpdateClusterResource,
}: Pick<AugmentedCluster, 'canUpdateClusterResource'> & {
  isReadOnly: boolean;
  clusterHibernating: boolean;
}) => {
  const readOnlyReason = isReadOnly && 'This operation is not available during maintenance';
  const hibernatingReason =
    clusterHibernating && 'This operation is not available while cluster is hibernating';
  const canNotEditReason =
    !canUpdateClusterResource &&
    'You do not have permission to edit proxies. Only cluster owners, cluster editors, and organization administrators can edit proxies.';
  return readOnlyReason || hibernatingReason || canNotEditReason;
};

type VPCDetailsCardProps = {
  cluster: AugmentedCluster;
};

const VPCDetailsCard = ({ cluster }: VPCDetailsCardProps) => {
  const dispatch = useDispatch();

  const privateLink = cluster.aws?.private_link;

  const httpProxyUrl = cluster.proxy?.http_proxy;
  const httpsProxyUrl = cluster.proxy?.https_proxy;
  const noProxyDomains = stringToArray(cluster.proxy?.no_proxy);
  const additionalTrustBundle = cluster.additional_trust_bundle;
  const gcpVPCName = cluster.gcp_network?.vpc_name;
  const isBYOVPC = cluster.aws?.subnet_ids || cluster.gcp_network;
  const gcpPrivateServiceConnect = cluster.gcp?.private_service_connect?.service_attachment_subnet;

  const region = cluster.subscription?.rh_region_id;

  const isPrivateLinkInitialized = typeof privateLink !== 'undefined';

  const { canUpdateClusterResource } = cluster;
  const isReadOnly = cluster?.status?.configuration_mode === 'read_only';
  const clusterHibernating = isHibernating(cluster);

  const disableEditReason = resolveDisableEditReason({
    isReadOnly,
    clusterHibernating,
    canUpdateClusterResource,
  });

  const handleEditClusterProxy = () =>
    dispatch(modalActions.openModal(modals.EDIT_CLUSTER_WIDE_PROXY));

  const renderNoProxyDomains = noProxyDomains
    ? noProxyDomains.map((domain) => (
        <Label isCompact color="blue">
          {domain}
        </Label>
      ))
    : 'N/A';

  if (!isBYOVPC) return null;

  return (
    <Card className="ocm-c-networking-vpc-details__card">
      <CardTitle>
        <Title headingLevel="h2" className="card-title">
          Virtual Private Cloud (VPC)
        </Title>
      </CardTitle>
      <CardBody className="ocm-c-networking-vpc-details__card--body pf-v6-l-stack pf-m-gutter">
        {gcpVPCName || isPrivateLinkInitialized || gcpPrivateServiceConnect ? (
          <>
            <Title headingLevel="h3" className="pf-v6-l-stack__item">
              VPC Details
            </Title>
            <DescriptionList
              isHorizontal
              className="pf-v6-l-stack__item pf-m-auto-column-widths details-card-dl"
            >
              {gcpVPCName ? (
                <DescriptionListGroup>
                  <DescriptionListTerm>VPC name</DescriptionListTerm>
                  <DescriptionListDescription>{gcpVPCName}</DescriptionListDescription>
                </DescriptionListGroup>
              ) : null}
              {isPrivateLinkInitialized ? (
                <DescriptionListGroup>
                  <DescriptionListTerm>PrivateLink</DescriptionListTerm>
                  <DescriptionListDescription>
                    {privateLink ? 'Enabled' : 'Disabled'}
                  </DescriptionListDescription>
                </DescriptionListGroup>
              ) : null}
              {gcpPrivateServiceConnect ? (
                <DescriptionListGroup>
                  <DescriptionListTerm>Private Service Connect Subnet</DescriptionListTerm>
                  <DescriptionListDescription>
                    {gcpPrivateServiceConnect}
                  </DescriptionListDescription>
                </DescriptionListGroup>
              ) : null}
            </DescriptionList>
          </>
        ) : null}
        <Title headingLevel="h3" className="pf-v6-l-stack__item --">
          Cluster-wide Proxy
        </Title>
        <DescriptionList isHorizontal className="pf-v6-l-stack__item details-card-dl">
          <DescriptionListGroup>
            <DescriptionListTerm>HTTP proxy URL</DescriptionListTerm>
            <DescriptionListDescription>{httpProxyUrl || 'N/A'}</DescriptionListDescription>
          </DescriptionListGroup>
          <DescriptionListGroup>
            <DescriptionListTerm>HTTPS proxy URL</DescriptionListTerm>
            <DescriptionListDescription>{httpsProxyUrl || 'N/A'}</DescriptionListDescription>
          </DescriptionListGroup>
          <DescriptionListGroup>
            <DescriptionListTerm>Additional trust bundle</DescriptionListTerm>
            <DescriptionListDescription>
              {(additionalTrustBundle === 'REDACTED' ? 'Uploaded' : additionalTrustBundle) || 'N/A'}
            </DescriptionListDescription>
          </DescriptionListGroup>
          <DescriptionListGroup>
            <DescriptionListTerm>No Proxy domains</DescriptionListTerm>
            <DescriptionListDescription>
              <LabelGroup isCompact>{renderNoProxyDomains}</LabelGroup>
            </DescriptionListDescription>
          </DescriptionListGroup>
        </DescriptionList>
        <EditClusterWideProxyDialog region={region} cluster={cluster} />
      </CardBody>
      {!isRestrictedEnv() && (
        <CardFooter>
          <ButtonWithTooltip
            variant="secondary"
            onClick={handleEditClusterProxy}
            disableReason={disableEditReason}
            isAriaDisabled={!!disableEditReason}
          >
            Edit cluster-wide proxy
          </ButtonWithTooltip>
        </CardFooter>
      )}
    </Card>
  );
};

export { VPCDetailsCard };
