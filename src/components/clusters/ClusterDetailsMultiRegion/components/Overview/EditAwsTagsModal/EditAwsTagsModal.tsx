import * as React from 'react';
import { Formik } from 'formik';
import * as Yup from 'yup';

import {
  Button,
  Form,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  ModalVariant,
  Title,
} from '@patternfly/react-core';

import { queryClient } from '~/components/App/queryClient';
import EditAWSTagsSection from '~/components/clusters/ClusterDetailsMultiRegion/components/MachinePools/components/EditMachinePoolModal/sections/EditAWSTagsSection';
import {
  AwsTagRow,
  AwsTags,
  awsTagsToRows,
  buildAwsTagsPatch,
  getAWSTags,
  MAX_CLUSTER_AWS_TAGS,
  splitAwsTags,
} from '~/components/clusters/common/awsTags/awsTagsHelpers';
import { getAwsTagsValidationSchema } from '~/components/clusters/common/awsTags/awsTagsValidation';
import ErrorBox from '~/components/common/ErrorBox';
import { useEditCluster } from '~/queries/ClusterDetailsQueries/useEditCluster';
import { queryConstants } from '~/queries/queriesConstants';
import { ClusterFromSubscription } from '~/types/types';

type EditAwsTagsModalProps = {
  cluster: ClusterFromSubscription;
  region?: string;
  onClose: () => void;
};

type EditAwsTagsValues = {
  awsTags: AwsTagRow[];
};

const validationSchema = Yup.lazy((values: EditAwsTagsValues) =>
  Yup.object({
    awsTags: getAwsTagsValidationSchema(values.awsTags, {
      isHypershift: true,
      maxCount: MAX_CLUSTER_AWS_TAGS,
      isCluster: true,
    }),
  }),
);

/** Modal to edit a ROSA HCP cluster's AWS tags; saves only the changes and shows system tags read-only. */
const EditAwsTagsModal = ({ cluster, region, onClose }: EditAwsTagsModalProps) => {
  const { editable: initialTags, readOnly: readOnlyTags } = React.useMemo(
    () => splitAwsTags(cluster.aws?.tags, { isCluster: true }),
    [cluster.aws?.tags],
  );
  const initialValues = React.useMemo<EditAwsTagsValues>(
    () => ({ awsTags: awsTagsToRows(initialTags) }),
    [initialTags],
  );

  const { mutate: editCluster, isPending: isSubmitting, isError, error } = useEditCluster(region);

  const handleSave = (values: EditAwsTagsValues) => {
    if (!cluster.id) {
      return;
    }

    editCluster(
      {
        clusterID: cluster.id,
        cluster: {
          aws: {
            // The API merges tags and uses `null` to remove one, which the generated type does not allow
            tags: buildAwsTagsPatch(initialTags, getAWSTags(values.awsTags)) as AwsTags,
          },
        },
      },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({
            queryKey: [
              queryConstants.FETCH_CLUSTER_DETAILS_QUERY_KEY,
              'clusterService',
              cluster.id,
            ],
          });
          // Node pools include the cluster tags, so refresh them too
          queryClient.invalidateQueries({
            queryKey: [
              queryConstants.FETCH_CLUSTER_DETAILS_QUERY_KEY,
              'nodePoolWithUpgradePolicies',
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
    <Formik<EditAwsTagsValues>
      initialValues={initialValues}
      validationSchema={validationSchema}
      onSubmit={handleSave}
      validateOnMount
    >
      {({ values, isValid, submitForm }) => {
        const hasChanges =
          Object.keys(buildAwsTagsPatch(initialTags, getAWSTags(values.awsTags))).length > 0;

        return (
          <Modal
            id="edit-aws-tags-modal"
            onClose={isSubmitting ? undefined : onClose}
            variant={ModalVariant.medium}
            isOpen
            className="openshift"
          >
            <ModalHeader>
              <Title headingLevel="h1">Edit cluster AWS tags</Title>
            </ModalHeader>
            <ModalBody>
              <Form>
                <EditAWSTagsSection
                  readOnlyTags={readOnlyTags}
                  maxCount={MAX_CLUSTER_AWS_TAGS}
                  description="Cluster AWS tags are applied to the AWS resources created for this cluster, including all machine pools. A machine pool can use a different value for a tag by overriding it in that machine pool's settings."
                />
              </Form>
            </ModalBody>
            <ModalFooter>
              {isError && error ? (
                <ErrorBox message="Error updating AWS tags" response={error} />
              ) : null}
              <Button
                variant="primary"
                onClick={submitForm}
                isDisabled={!hasChanges || !isValid || isSubmitting}
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
      }}
    </Formik>
  );
};

export default EditAwsTagsModal;
