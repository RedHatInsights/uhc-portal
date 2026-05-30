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
  Title,
} from '@patternfly/react-core';

import docLinks from '~/common/docLinks.mjs';
import clusterStates from '~/components/clusters/common/clusterStates';
import { constants } from '~/components/clusters/common/CreateOSDFormConstants';
import EditButton from '~/components/common/EditButton';
import ErrorBox from '~/components/common/ErrorBox';
import ExternalLink from '~/components/common/ExternalLink';
import PopoverHint from '~/components/common/PopoverHint';
import { useMutateChannelGroup } from '~/queries/ChannelGroupEditQueries/useMutateChannelGroup';
import { invalidateClusterDetailsQueries } from '~/queries/ClusterDetailsQueries/useFetchClusterDetails';
import type { AugmentedCluster } from '~/types/types';

import { formatChannelGroupName } from '../../../clusterDetailsHelper';

import { ChannelGroupSelect } from './ChannelGroupSelect';
import { useGetChannelGroupsData } from './useGetChannelGroupsData';

type ChannelGroupEditModalProps = {
  clusterID: string;
  isOpen: boolean;
  onClose: () => void;
  channelGroup: string;
  optionsDropdownData: {
    value: string;
    label: string;
  }[];
};

type ChannelGroupEditProps = {
  clusterID: string;
  channelGroup: string;
  cluster: AugmentedCluster;
  isROSA?: boolean;
};

const ChannelGroupEditModal = ({
  clusterID,
  isOpen,
  onClose,
  channelGroup,
  optionsDropdownData,
}: ChannelGroupEditModalProps) => {
  const { mutate, isError, error, isPending } = useMutateChannelGroup();

  return isOpen ? (
    <Formik
      initialValues={{ channelGroup }}
      onSubmit={(values: any) => {
        const { channelGroup } = values;
        mutate(
          { clusterID, channelGroup },
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
          id="edit-channel-group-modal"
          title="Edit channel group"
          variant={ModalVariant.small}
          onClose={onClose}
          isOpen={isOpen}
          aria-labelledby="edit-channel-group-modal"
          aria-describedby="modal-box-edit-channel-group"
        >
          <ModalHeader>
            <Title headingLevel="h1">Edit channel group</Title>
          </ModalHeader>
          <ModalBody id="modal-box-edit-channel-group">
            {isError && (
              <StackItem>
                <ErrorBox
                  message={error.error.errorMessage ? error.error.errorMessage : ''}
                  response={{
                    operationID: error.error.operationID,
                  }}
                />
              </StackItem>
            )}
            <Field
              fieldId="channelGroup"
              label="channelGroup"
              name="channelGroup"
              formSelectValue={formik.values.channel_group}
              component={ChannelGroupSelect}
              optionsDropdownData={optionsDropdownData}
              input={{
                ...formik.getFieldProps('channelGroup'),
                onChange: (value: string) => formik.setFieldValue('channelGroup', value),
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

export const ChannelGroupEdit = ({
  clusterID,
  channelGroup,
  cluster,
  isROSA,
}: ChannelGroupEditProps) => {
  const [isModalOpen, setIsModalOpen] = React.useState<boolean>(false);
  const canUpdateClusterResource = !!cluster.canUpdateClusterResource;
  const isClusterReady = cluster.state === clusterStates.ready;
  const { availableDropdownChannelGroups, isLoading } = useGetChannelGroupsData(cluster);
  const hasChannelGroupOptions = (availableDropdownChannelGroups?.length ?? 0) > 0;

  return (
    <>
      {isModalOpen && (
        <ChannelGroupEditModal
          clusterID={clusterID}
          isOpen={isModalOpen}
          optionsDropdownData={availableDropdownChannelGroups}
          onClose={() => setIsModalOpen(false)}
          channelGroup={channelGroup}
        />
      )}
      <DescriptionListGroup>
        <DescriptionListTerm>
          Channel group
          <PopoverHint
            iconClassName="pf-v6-u-ml-sm"
            hint={
              <>
                {constants.channelGroupHint}{' '}
                <ExternalLink
                  href={isROSA ? docLinks.ROSA_LIFE_CYCLE_DATES : docLinks.OSD_LIFE_CYCLE_DATES}
                >
                  Learn more about the support lifecycle
                </ExternalLink>
              </>
            }
          />
        </DescriptionListTerm>
        <DescriptionListDescription>
          {formatChannelGroupName(channelGroup)}
          {canUpdateClusterResource &&
            (isLoading ? (
              <Spinner size="sm" aria-label="Loading..." />
            ) : (
              <EditButton
                data-testid="channelGroupModal"
                ariaLabel="editChannelGroupBtn"
                onClick={() => {
                  if (hasChannelGroupOptions) {
                    setIsModalOpen(true);
                  }
                }}
                isAriaDisabled={isLoading || !isClusterReady || !hasChannelGroupOptions}
              />
            ))}
        </DescriptionListDescription>
      </DescriptionListGroup>
    </>
  );
};
