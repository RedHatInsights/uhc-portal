import * as React from 'react';

import {
  Alert,
  Button,
  Content,
  ContentVariants,
  Form,
  FormGroup,
  HelperText,
  HelperTextItem,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  ModalVariant,
  Switch,
  TextInput,
  Title,
} from '@patternfly/react-core';

import { trackEvents } from '~/common/analytics';
import { validateRoleARN } from '~/common/validators';
import { queryClient } from '~/components/App/queryClient';
import ErrorBox from '~/components/common/ErrorBox';
import PopoverHint from '~/components/common/PopoverHint';
import WithTooltip from '~/components/common/WithTooltip';
import useAnalytics from '~/hooks/useAnalytics';
import { useEditCluster } from '~/queries/ClusterDetailsQueries/useEditCluster';
import { queryConstants } from '~/queries/queriesConstants';
import { ClusterFromSubscription } from '~/types/types';

type EditAutoNodeModalProps = {
  cluster: ClusterFromSubscription;
  region?: string;
  onClose: () => void;
};

const EditAutoNodeModal = ({ cluster, region, onClose }: EditAutoNodeModalProps) => {
  const initialAutoNodeEnabled = cluster?.auto_node?.mode === 'enabled';
  const initialIamRoleArn = cluster?.aws?.auto_node?.role_arn ?? '';
  const track = useAnalytics();

  const [isAutoNodeEnabled, setIsAutoNodeEnabled] = React.useState(initialAutoNodeEnabled);
  const [iamRoleArn, setIamRoleArn] = React.useState(initialIamRoleArn);

  const [arnValidationError, setArnValidationError] = React.useState<string | undefined>(undefined);

  const isValid = !isAutoNodeEnabled || (iamRoleArn.trim().length > 0 && !arnValidationError);

  const hasChanges =
    isAutoNodeEnabled !== initialAutoNodeEnabled ||
    (isAutoNodeEnabled && iamRoleArn !== initialIamRoleArn);

  const { mutate: editCluster, isPending: isSubmitting, isError, error } = useEditCluster(region);

  const handleSave = () => {
    if (!cluster.id) {
      return;
    }

    editCluster(
      {
        clusterID: cluster.id,
        cluster: {
          auto_node: {
            mode: isAutoNodeEnabled ? 'enabled' : 'disabled',
          },
          aws: {
            auto_node: {
              role_arn: iamRoleArn,
            },
          },
        },
      },
      {
        onSuccess: () => {
          track(trackEvents.AutonodeEnableSubmitted);
          queryClient.invalidateQueries({
            queryKey: [
              queryConstants.FETCH_CLUSTER_DETAILS_QUERY_KEY,
              'clusterService',
              cluster.id,
            ],
          });
          onClose();
        },
      },
    );
  };

  return (
    <Modal
      id="edit-auto-node-modal"
      onClose={isSubmitting ? undefined : onClose}
      variant={ModalVariant.medium}
      isOpen
      className="openshift"
    >
      <ModalHeader>
        <Title headingLevel="h1">Edit Autonode settings</Title>
        <Content component={ContentVariants.small}>Configure Autonode for this cluster</Content>
      </ModalHeader>
      <ModalBody>
        <Form>
          <WithTooltip
            showTooltip={cluster?.auto_node?.mode === 'enabled'}
            content="Autonode cannot be disabled once enabled."
            position="top-start"
          >
            <Switch
              id="enable-auto-node"
              label="Enable Autonode"
              isChecked={isAutoNodeEnabled}
              onChange={(_event, checked) => {
                setIsAutoNodeEnabled(checked);
                if (!checked) {
                  setIamRoleArn(initialIamRoleArn);
                  setArnValidationError(undefined);
                }
              }}
              isDisabled={cluster?.auto_node?.mode === 'enabled'}
            />
          </WithTooltip>

          {isAutoNodeEnabled && cluster?.auto_node?.mode !== 'enabled' ? (
            <Alert variant="warning" isInline isPlain title="Enabling Autonode cannot be undone">
              Ensure you have created the required IAM role in your AWS account before proceeding.
            </Alert>
          ) : null}

          <FormGroup
            label="Autonode IAM role ARN"
            isRequired={isAutoNodeEnabled}
            labelHelp={
              <PopoverHint
                buttonAriaLabel="Autonode IAM role ARN information"
                hint="The AWS ARN of the IAM Role that has permissions for Autonode."
              />
            }
          >
            <TextInput
              id="auto-node-iam-role-arn"
              value={iamRoleArn}
              onChange={(_event, value) => {
                setIamRoleArn(value);
                setArnValidationError(value.trim().length > 0 ? validateRoleARN(value) : undefined);
              }}
              placeholder="arn:aws:iam::123456789012:role/ManagedOpenShift-Autonode-Role"
              validated={arnValidationError ? 'error' : 'default'}
              isDisabled={!isAutoNodeEnabled}
            />
            <HelperText>
              <HelperTextItem variant={arnValidationError ? 'error' : 'default'}>
                {arnValidationError ?? 'The ARN of the IAM Role with the required Autonode policy.'}
              </HelperTextItem>
            </HelperText>
          </FormGroup>
        </Form>
      </ModalBody>
      <ModalFooter>
        {isError && error && (
          <ErrorBox message="Error updating Autonode settings" response={error} />
        )}

        <Button
          variant="primary"
          onClick={handleSave}
          isDisabled={!isValid || isSubmitting || !hasChanges}
          isLoading={isSubmitting}
        >
          Save
        </Button>
        <Button variant="link" isDisabled={isSubmitting} onClick={onClose}>
          Cancel
        </Button>
      </ModalFooter>
    </Modal>
  );
};

export default EditAutoNodeModal;
