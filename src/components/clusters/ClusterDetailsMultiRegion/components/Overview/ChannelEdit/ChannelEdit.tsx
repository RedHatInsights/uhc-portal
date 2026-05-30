import React from 'react';
import { Field, Formik } from 'formik';

import {
  Button,
  DescriptionListDescription,
  DescriptionListGroup,
  DescriptionListTerm,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  ModalVariant,
  Spinner,
  StackItem,
} from '@patternfly/react-core';

import docLinks from '~/common/docLinks.mjs';
import clusterStates, { isHypershiftCluster } from '~/components/clusters/common/clusterStates';
import { constants } from '~/components/clusters/common/CreateOSDFormConstants';
import EditButton from '~/components/common/EditButton';
import ErrorBox from '~/components/common/ErrorBox';
import ExternalLink from '~/components/common/ExternalLink';
import PopoverHint from '~/components/common/PopoverHint';
import { useEditChannelOnCluster } from '~/queries/ChannelEditQueries/useEditChannelOnCluster';
import { useGetSchedules } from '~/queries/ClusterDetailsQueries/ClusterSettingsTab/useGetSchedules';
import { invalidateClusterDetailsQueries } from '~/queries/ClusterDetailsQueries/useFetchClusterDetails';
import { UpgradePolicy } from '~/types/clusters_mgmt.v1';
import type { AugmentedCluster } from '~/types/types';

import { ChannelSelect } from './ChannelSelect';

const channelsToDropdownOptions = (
  channels: string[] | undefined,
): { value: string; label: string }[] => (channels ?? []).map((c) => ({ value: c, label: c }));

type ChannelEditModalProps = {
  clusterID: string;
  isOpen: boolean;
  onClose: () => void;
  channel: string;
  optionsDropdownData: {
    value: string;
    label: string;
  }[];
};

type ChannelEditProps = {
  cluster: AugmentedCluster;
  isClusterDetailsFetching?: boolean;
};

const ChannelEditModal = ({
  clusterID,
  isOpen,
  onClose,
  channel,
  optionsDropdownData,
}: ChannelEditModalProps) => {
  const { mutate, isError, error, isPending } = useEditChannelOnCluster();

  return isOpen ? (
    <Formik
      initialValues={{ channel }}
      onSubmit={(values: { channel: string }) => {
        const { channel: newChannel } = values;
        mutate(
          { clusterID, channel: newChannel },
          {
            onSuccess: () => {
              onClose();
              invalidateClusterDetailsQueries();
            },
          },
        );
      }}
    >
      {(formik) => (
        <Modal
          id="edit-channel-modal"
          title="Edit channel"
          variant={ModalVariant.small}
          onClose={onClose}
          isOpen={isOpen}
          aria-labelledby="edit-channel-modal"
          aria-describedby="modal-box-edit-channel"
        >
          <ModalHeader
            labelId="edit-channel-modal"
            title="Edit channel"
            description="Select a new channel for this cluster. The cluster will receive upgrades according to the channel you choose."
          />
          <ModalBody id="modal-box-edit-channel">
            {isError && (
              <StackItem>
                <ErrorBox
                  message={error?.error?.errorMessage ?? error?.error?.message ?? ''}
                  response={{
                    operationID: error?.error?.operationID,
                  }}
                />
                <br />
              </StackItem>
            )}
            <Field
              fieldId="channel"
              label="Channel"
              name="channel"
              component={ChannelSelect}
              optionsDropdownData={optionsDropdownData}
              input={{
                ...formik.getFieldProps('channel'),
                onChange: (value: string) => formik.setFieldValue('channel', value),
              }}
            />
          </ModalBody>
          <ModalFooter>
            <Button
              key="confirm"
              variant="primary"
              onClick={formik.submitForm}
              isDisabled={isPending || !formik.dirty}
              isLoading={isPending}
            >
              Save
            </Button>
            <Button key="cancel" variant="link" onClick={onClose}>
              Cancel
            </Button>
          </ModalFooter>
        </Modal>
      )}
    </Formik>
  ) : null;
};

export const ChannelEdit = ({ cluster, isClusterDetailsFetching = false }: ChannelEditProps) => {
  const [isModalOpen, setIsModalOpen] = React.useState<boolean>(false);
  const canUpdateClusterResource = !!cluster.canUpdateClusterResource;
  const isClusterReady = cluster.state === clusterStates.ready;
  const isHypershift = isHypershiftCluster(cluster);
  const clusterId = cluster.id ?? '';
  const channel = cluster?.channel ?? '';
  const region = cluster?.subscription?.rh_region_id;
  const { data: schedulesData, isLoading: isSchedulesLoading } = useGetSchedules(
    clusterId,
    isHypershift,
    region,
  );
  const hasScheduledUpgradePolicy = (schedulesData?.items ?? []).some((policy: UpgradePolicy) =>
    ['automatic', 'manual'].includes(policy.schedule_type ?? ''),
  );
  const scheduledUpgradePolicyReason =
    hasScheduledUpgradePolicy &&
    'Channel editing is not available while an upgrade policy is scheduled.';
  const availableDropdownChannels = channelsToDropdownOptions(cluster.version?.available_channels);
  const currentChannel = channel;
  const hasAlternativeChannelOption = availableDropdownChannels.some(
    (channel) => channel.value !== currentChannel,
  );

  return (
    <>
      {isModalOpen && (
        <ChannelEditModal
          clusterID={clusterId}
          isOpen={isModalOpen}
          optionsDropdownData={availableDropdownChannels}
          onClose={() => setIsModalOpen(false)}
          channel={channel}
        />
      )}
      <DescriptionListGroup>
        <DescriptionListTerm>
          Channel
          <PopoverHint
            iconClassName="pf-v6-u-ml-sm"
            hint={
              <>
                {constants.channelHint}{' '}
                <ExternalLink href={docLinks.OCP_UPDATE_CHANNELS}>Learn more</ExternalLink>
              </>
            }
          />
        </DescriptionListTerm>
        <DescriptionListDescription>
          {isClusterDetailsFetching ? (
            <Spinner size="sm" aria-label="Loading channel" />
          ) : (
            <>
              {channel || 'N/A'}
              {canUpdateClusterResource && hasAlternativeChannelOption ? (
                <EditButton
                  data-testid="channelModal"
                  ariaLabel="Edit channel"
                  onClick={() => {
                    if (!hasScheduledUpgradePolicy && !isSchedulesLoading && isClusterReady) {
                      setIsModalOpen(true);
                    }
                  }}
                  isAriaDisabled={!isClusterReady || isSchedulesLoading}
                  disableReason={scheduledUpgradePolicyReason}
                />
              ) : null}
            </>
          )}
        </DescriptionListDescription>
      </DescriptionListGroup>
    </>
  );
};
