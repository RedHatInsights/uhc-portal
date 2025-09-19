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
import { Field, Formik } from 'formik';
import React from 'react';
import { ChannelGroupSelect } from './ChannelGroupSelect';
import { useMutateChannelGroup } from '~/queries/ChannelGroupEditQueries/useMutateChannelGroup';
import ErrorBox from '~/components/common/ErrorBox';
import { useGetChannelGroupsData } from './useGetChannelGroupsData';
import { Cluster } from '~/types/clusters_mgmt.v1';

type ChannelGroupEditModalProps = {
  clusterID: string;
  isOpen: boolean;
  onClose: () => void;
  channelGroup: string;
  optionsDropdownData: any;
};

type ChannelGroupEditProps = {
  clusterID: string;
  channelGroup: string;
  cluster: CanEditCluster;
};

interface CanEditCluster extends Cluster {
  canEdit: boolean;
}

const ChannelGroupEditModal = ({
  clusterID,
  isOpen,
  onClose,
  channelGroup,
  optionsDropdownData,
}: ChannelGroupEditModalProps) => {
  const { mutate, isError, error } = useMutateChannelGroup();

  const handleClose = () => {
    onClose();
  };
  return isOpen ? (
    <Formik
      initialValues={{ channelGroup: channelGroup }}
      onSubmit={(values: any) => {
        const channelGroup = values.channelGroup;
        mutate({ clusterID, channelGroup });
      }}
    >
      {(formik) => {
        return (
          <Modal
            id="edit-channel-group-modal"
            title="Edit channel group"
            variant={ModalVariant.small}
            onClose={handleClose}
            isOpen={isOpen}
            aria-labelledby="edit-channel-group-modal"
            aria-describedby="modal-box-edit-channel-group"
          >
            <ModalHeader>Edit channel group</ModalHeader>
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
                isDisabled={formik.isSubmitting}
              >
                Save
              </Button>
              <Button key="cancel" variant="link" onClick={handleClose}>
                Cancel
              </Button>
            </ModalFooter>
          </Modal>
        );
      }}
    </Formik>
  ) : null;
};

export const ChannelGroupEdit = ({ clusterID, channelGroup, cluster }: ChannelGroupEditProps) => {
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
        <DescriptionListTerm>Channel group</DescriptionListTerm>
        <DescriptionListDescription>
          {channelGroup ? channelGroup.charAt(0).toUpperCase() + channelGroup.slice(1) : 'N/A'}
          {!isLoading ? (
            <Button onClick={() => setIsModalOpen(true)} isDisabled={!canEdit}>
              Open modal
            </Button>
          ) : (
            <Spinner size="sm" aria-label="Loading..." />
          )}
        </DescriptionListDescription>
      </DescriptionListGroup>
    </>
  );
};
