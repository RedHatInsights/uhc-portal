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

import links from '~/common/installLinks.mjs';
import { constants } from '~/components/clusters/common/CreateOSDFormConstants';
import EditButton from '~/components/common/EditButton';
import ErrorBox from '~/components/common/ErrorBox';
import ExternalLink from '~/components/common/ExternalLink';
import PopoverHint from '~/components/common/PopoverHint';
import { useMutateChannelGroup } from '~/queries/ChannelGroupEditQueries/useMutateChannelGroup';
import { invalidateClusterDetailsQueries } from '~/queries/ClusterDetailsQueries/useFetchClusterDetails';
import { Cluster } from '~/types/clusters_mgmt.v1';

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
  cluster: CanEditCluster;
  isROSA?: boolean;
};

export interface CanEditCluster extends Cluster {
  canEdit: boolean;
}

const ChannelGroupEditModal = ({
  clusterID,
  isOpen,
  onClose,
  channelGroup,
  optionsDropdownData,
}: ChannelGroupEditModalProps) => {
  const { mutate, isError, error, isPending } = useMutateChannelGroup();

  const handleClose = () => {
    onClose();
  };
  return isOpen ? (
    <Formik
      initialValues={{ channelGroup }}
      onSubmit={(values: any) => {
        const { channelGroup } = values;
        mutate(
          { clusterID, channelGroup },
          {
            onSuccess: () => {
              handleClose();
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
          onClose={handleClose}
          isOpen={isOpen}
          aria-labelledby="edit-channel-group-modal"
          aria-describedby="modal-box-edit-channel-group"
        >
          <ModalHeader>
            <Title headingLevel="h1">Edit channel group</Title>
          </ModalHeader>
          <ModalBody>
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
            >
              Save
            </Button>
            <Button key="cancel" variant="link" onClick={handleClose}>
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
  const { canEdit } = cluster;

  const { availableDropdownChannelGroups, isLoading } = useGetChannelGroupsData(cluster, canEdit);

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
                  href={isROSA ? links.ROSA_LIFE_CYCLE_DATES : links.OSD_LIFE_CYCLE_DATES}
                >
                  Learn more about the support lifecycle
                </ExternalLink>
              </>
            }
          />
        </DescriptionListTerm>
        <DescriptionListDescription>
          {formatChannelGroupName(channelGroup)}
          {canEdit &&
            (isLoading ? (
              <Spinner size="sm" aria-label="Loading..." />
            ) : (
              <EditButton
                data-testid="channelGroupModal"
                ariaLabel="editChannelGroupBtn"
                onClick={() => setIsModalOpen(true)}
                isAriaDisabled={!canEdit || isLoading}
              />
            ))}
        </DescriptionListDescription>
      </DescriptionListGroup>
    </>
  );
};
