import React from 'react';

import {
  DescriptionListDescription,
  DescriptionListGroup,
  DescriptionListTerm,
  Label,
  LabelGroup,
  Spinner,
  Stack,
  StackItem,
  Title,
} from '@patternfly/react-core';

import { FieldId } from '~/components/clusters/wizards/rosa/constants';
import { useFetchLogForwardingGroups } from '~/queries/RosaWizardQueries/useFetchLogForwardingGroups';

import type { LogForwardingGroupTreeNode } from './logForwardingGroupTreeData';
import { groupSelectedLogForwardingItems } from './logForwardingReviewHelpers';

type FormValuesShape = {
  [FieldId.LogForwardingS3Enabled]?: boolean;
  [FieldId.LogForwardingS3BucketName]?: string;
  [FieldId.LogForwardingS3BucketPrefix]?: string;
  [FieldId.LogForwardingS3SelectedItems]?: string[];
  [FieldId.LogForwardingCloudWatchEnabled]?: boolean;
  [FieldId.LogForwardingCloudWatchLogGroupName]?: string;
  [FieldId.LogForwardingCloudWatchRoleArn]?: string;
  [FieldId.LogForwardingCloudWatchSelectedItems]?: string[];
};

const noneLabel = <span className="pf-v6-u-disabled-color-100">None</span>;

/** PatternFly LabelGroup replaces `${remaining}` in this string when collapsing overflow labels. */
const LABEL_GROUP_OVERFLOW_PLACEHOLDER = '{remaining}';
const LABEL_GROUP_OVERFLOW_TEXT = `$${LABEL_GROUP_OVERFLOW_PLACEHOLDER} more`;

const selectedAppsDescription = (
  selectedIds: string[] | undefined,
  tree: LogForwardingGroupTreeNode[],
  treeLoading: boolean,
) => {
  const ids = selectedIds ?? [];
  if (ids.length === 0) {
    return noneLabel;
  }
  if (treeLoading) {
    return <Spinner size="sm" aria-label="Loading selected applications" />;
  }
  const grouped = groupSelectedLogForwardingItems(tree, ids);
  if (!grouped.length) {
    return <>{ids.join(', ')}</>;
  }
  return (
    <Stack hasGutter>
      {grouped.map(({ groupLabel, applicationLabels }) => (
        <StackItem key={groupLabel}>
          <LabelGroup
            numLabels={3}
            collapsedText={LABEL_GROUP_OVERFLOW_TEXT}
            isCompact
            aria-label={`Applications for ${groupLabel}`}
            categoryName={groupLabel}
          >
            {applicationLabels.map((text) => (
              <Label key={`${groupLabel}-${text}`} variant="filled" isCompact>
                {text}
              </Label>
            ))}
          </LabelGroup>
        </StackItem>
      ))}
    </Stack>
  );
};

export function LogForwardingReviewDetails({ formValues }: { formValues: FormValuesShape }) {
  const { data: logForwardingTree = [], isLoading: isLogForwardingTreeLoading } =
    useFetchLogForwardingGroups();
  const s3On = !!formValues[FieldId.LogForwardingS3Enabled];
  const cwOn = !!formValues[FieldId.LogForwardingCloudWatchEnabled];

  return (
    <>
      <DescriptionListGroup>
        <DescriptionListTerm>
          <Title headingLevel="h4">Amazon S3</Title>
        </DescriptionListTerm>
        <DescriptionListDescription>
          <span className="pf-v6-u-screen-reader">Amazon S3 log forwarding</span>
        </DescriptionListDescription>
      </DescriptionListGroup>
      <DescriptionListGroup>
        <DescriptionListTerm>Configuration</DescriptionListTerm>
        <DescriptionListDescription>{s3On ? 'Enabled' : 'Disabled'}</DescriptionListDescription>
      </DescriptionListGroup>
      {s3On ? (
        <>
          <DescriptionListGroup>
            <DescriptionListTerm>Bucket name</DescriptionListTerm>
            <DescriptionListDescription>
              {formValues[FieldId.LogForwardingS3BucketName]?.trim() || noneLabel}
            </DescriptionListDescription>
          </DescriptionListGroup>
          <DescriptionListGroup>
            <DescriptionListTerm>Bucket prefix</DescriptionListTerm>
            <DescriptionListDescription>
              {formValues[FieldId.LogForwardingS3BucketPrefix]?.trim() ? (
                formValues[FieldId.LogForwardingS3BucketPrefix]?.trim()
              ) : (
                <span className="pf-v6-u-disabled-color-100">None</span>
              )}
            </DescriptionListDescription>
          </DescriptionListGroup>
          <DescriptionListGroup>
            <DescriptionListTerm>Selected groups and applications</DescriptionListTerm>
            <DescriptionListDescription>
              {selectedAppsDescription(
                formValues[FieldId.LogForwardingS3SelectedItems],
                logForwardingTree,
                isLogForwardingTreeLoading,
              )}
            </DescriptionListDescription>
          </DescriptionListGroup>
        </>
      ) : null}

      <DescriptionListGroup>
        <DescriptionListTerm>
          <Title headingLevel="h4">CloudWatch</Title>
        </DescriptionListTerm>
        <DescriptionListDescription>
          <span className="pf-v6-u-screen-reader">CloudWatch log forwarding</span>
        </DescriptionListDescription>
      </DescriptionListGroup>
      <DescriptionListGroup>
        <DescriptionListTerm>Configuration</DescriptionListTerm>
        <DescriptionListDescription>{cwOn ? 'Enabled' : 'Disabled'}</DescriptionListDescription>
      </DescriptionListGroup>
      {cwOn ? (
        <>
          <DescriptionListGroup>
            <DescriptionListTerm>Log group name</DescriptionListTerm>
            <DescriptionListDescription>
              {formValues[FieldId.LogForwardingCloudWatchLogGroupName]?.trim() || noneLabel}
            </DescriptionListDescription>
          </DescriptionListGroup>
          <DescriptionListGroup>
            <DescriptionListTerm>Role ARN</DescriptionListTerm>
            <DescriptionListDescription>
              {formValues[FieldId.LogForwardingCloudWatchRoleArn]?.trim() || noneLabel}
            </DescriptionListDescription>
          </DescriptionListGroup>
          <DescriptionListGroup>
            <DescriptionListTerm>Selected groups and applications</DescriptionListTerm>
            <DescriptionListDescription>
              {selectedAppsDescription(
                formValues[FieldId.LogForwardingCloudWatchSelectedItems],
                logForwardingTree,
                isLogForwardingTreeLoading,
              )}
            </DescriptionListDescription>
          </DescriptionListGroup>
        </>
      ) : null}
    </>
  );
}
