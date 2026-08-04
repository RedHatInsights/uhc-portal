import React from 'react';

import { Stack, StackItem } from '@patternfly/react-core';

import { TextInputField } from '~/components/clusters/wizards/form';
import {
  groupsApplicationsAvailableTooltip,
  groupsApplicationsChosenTooltip,
  s3BucketNameTooltip,
  s3BucketPrefixTooltip,
} from '~/components/clusters/wizards/rosa/LogForwarding/logForwardingTooltips';

import { ClusterLogForwardingGroupsApplicationsSelector } from './ClusterLogForwardingGroupsApplicationsSelector';

type LogForwardingS3FormFieldsProps = {
  bucketNameField?: string;
  bucketPrefixField?: string;
  selectedItemsField?: string;
};

export function LogForwardingS3FormFields({
  bucketNameField = 'bucketName',
  bucketPrefixField = 'bucketPrefix',
  selectedItemsField = 'selectedItems',
}: LogForwardingS3FormFieldsProps) {
  return (
    <Stack hasGutter>
      <StackItem>
        <TextInputField
          name={bucketNameField}
          label="Bucket name"
          formGroup={{ isRequired: true }}
          tooltip={s3BucketNameTooltip}
        />
      </StackItem>
      <StackItem>
        <TextInputField
          name={bucketPrefixField}
          label="Bucket prefix"
          tooltip={s3BucketPrefixTooltip}
        />
      </StackItem>
      <StackItem>
        <ClusterLogForwardingGroupsApplicationsSelector
          name={selectedItemsField}
          isRequired
          availableTooltip={groupsApplicationsAvailableTooltip}
          chosenTooltip={groupsApplicationsChosenTooltip}
        />
      </StackItem>
    </Stack>
  );
}
