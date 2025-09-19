import React from 'react';
import { useDispatch } from 'react-redux';
import { useParams } from 'react-router-dom';

import {
  DescriptionListDescription,
  DescriptionListGroup,
  DescriptionListTerm,
} from '@patternfly/react-core';

import { isCompatibleFeature, SupportedFeature } from '~/common/featureCompatibility';
import clusterStates from '~/components/clusters/common/clusterStates';
import EditButton from '~/components/common/EditButton';
import { openModal } from '~/components/common/Modal/ModalActions';
import modals from '~/components/common/Modal/modals';
import { useFetchClusterDetails } from '~/queries/ClusterDetailsQueries/useFetchClusterDetails';
import { AUTO_CLUSTER_TRANSFER_OWNERSHIP } from '~/queries/featureGates/featureConstants';
import { useFeatureGate } from '~/queries/featureGates/useFetchFeatureGate';
import { useGlobalState } from '~/redux/hooks';

export function Owner() {
  const dispatch = useDispatch();

  const params = useParams();

  const { cluster } = useFetchClusterDetails(params.id || '');

  const hasFeatureGate = useFeatureGate(AUTO_CLUSTER_TRANSFER_OWNERSHIP);
  const username = useGlobalState((state) => state.userProfile.keycloakProfile.username);

  const showOwnershipTransfer =
    cluster?.canEdit &&
    cluster?.state === clusterStates.ready &&
    cluster?.subscription?.creator?.username === username &&
    hasFeatureGate &&
    isCompatibleFeature(SupportedFeature.AUTO_CLUSTER_TRANSFER_OWNERSHIP, cluster);
  const disableChangeReason =
    !cluster?.canEdit && 'You do not have permission to transfer ownership.';
  const owner =
    cluster?.subscription?.creator?.name || cluster?.subscription?.creator?.username || 'N/A';
  return (
    <DescriptionListGroup>
      <DescriptionListTerm>Owner </DescriptionListTerm>
      <DescriptionListDescription>
        {showOwnershipTransfer ? (
          <EditButton
            data-testid="ownerTranswerOverviewLink"
            disableReason={disableChangeReason}
            ariaLabel="Transfer ownership"
            onClick={() =>
              dispatch(
                openModal(modals.TRANSFER_CLUSTER_OWNERSHIP_AUTO, {
                  subscription: cluster?.subscription,
                }),
              )
            }
          >
            {owner}
          </EditButton>
        ) : (
          owner
        )}
      </DescriptionListDescription>
    </DescriptionListGroup>
  );
}
