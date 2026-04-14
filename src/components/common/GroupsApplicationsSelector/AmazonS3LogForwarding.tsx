import React from 'react';
import { useField } from 'formik';

import { Stack, StackItem, Title } from '@patternfly/react-core';

import { CheckboxField, TextInputField } from '~/components/clusters/wizards/form';
import { FieldId } from '~/components/clusters/wizards/rosa/constants';

import { LogForwardingGroupsApplicationsSelector } from './LogForwardingGroupsApplicationsSelector';
import {
  groupsApplicationsAvailableTooltip,
  groupsApplicationsChosenTooltip,
  s3BucketNameTooltip,
  s3BucketPrefixTooltip,
} from './logForwardingTooltips';

export function AmazonS3LogForwarding() {
  const [{ value: s3Enabled }] = useField<boolean>(FieldId.LogForwardingS3Enabled);

  return (
    <Stack hasGutter>
      <StackItem>
        <Title headingLevel="h4">Amazon S3</Title>
      </StackItem>
      <StackItem>
        <CheckboxField
          name={FieldId.LogForwardingS3Enabled}
          label="Enable Amazon S3"
          helperText="Used for long-term storage"
        />
      </StackItem>
      {s3Enabled ? (
        <StackItem>
          <Stack hasGutter>
            <StackItem>
              <TextInputField
                name={FieldId.LogForwardingS3BucketName}
                label="Bucket name"
                formGroup={{ isRequired: true }}
                tooltip={s3BucketNameTooltip}
              />
            </StackItem>
            <StackItem>
              <TextInputField
                name={FieldId.LogForwardingS3BucketPrefix}
                label="Bucket prefix"
                tooltip={s3BucketPrefixTooltip}
              />
            </StackItem>
            <StackItem>
              <LogForwardingGroupsApplicationsSelector
                name={FieldId.LogForwardingS3SelectedItems}
                isRequired
                availableTooltip={groupsApplicationsAvailableTooltip}
                chosenTooltip={groupsApplicationsChosenTooltip}
              />
            </StackItem>
          </Stack>
        </StackItem>
      ) : null}
    </Stack>
  );
}
