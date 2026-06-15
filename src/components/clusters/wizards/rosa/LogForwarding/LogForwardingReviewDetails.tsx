import React from 'react';

import {
  DescriptionListDescription,
  DescriptionListGroup,
  DescriptionListTerm,
  Title,
} from '@patternfly/react-core';

import { FieldId } from '~/components/clusters/wizards/rosa/constants';
import ErrorBox from '~/components/common/ErrorBox';
import { buildLogForwardingTree } from '~/components/common/GroupsApplicationsSelector/logForwardingGroupTreeFromApi';
import {
  logForwardingNoneLabel,
  LogForwardingSelectedAppsDescription,
} from '~/components/common/GroupsApplicationsSelector/LogForwardingSelectedAppsDescription';
import { useFetchLogForwardingApplications } from '~/queries/RosaWizardQueries/useFetchLogForwardingApplications';
import { useFetchLogForwardingGroups } from '~/queries/RosaWizardQueries/useFetchLogForwardingGroups';

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

const applicationsLoadWarningMessage =
  'Could not load all applications. Some options may be missing from the list.';

export function LogForwardingReviewDetails({ formValues }: { formValues: FormValuesShape }) {
  const s3On = !!formValues[FieldId.LogForwardingS3Enabled];
  const cwOn = !!formValues[FieldId.LogForwardingCloudWatchEnabled];
  const { data: groupsTree = [], isLoading: isLogForwardingTreeLoading } =
    useFetchLogForwardingGroups({ s3On, cwOn });
  const {
    data: applications = [],
    isError: isAppsError,
    error: appsError,
  } = useFetchLogForwardingApplications({ s3On, cwOn });
  const logForwardingTree = buildLogForwardingTree(groupsTree, applications);
  const s3BucketPrefixRaw = formValues[FieldId.LogForwardingS3BucketPrefix];
  const s3BucketPrefixTrimmed =
    typeof s3BucketPrefixRaw === 'string' ? s3BucketPrefixRaw.trim() : '';

  return (
    <>
      {isAppsError && (s3On || cwOn) ? (
        <DescriptionListGroup>
          <DescriptionListTerm>
            <span className="pf-v6-u-screen-reader">Applications catalog</span>
          </DescriptionListTerm>
          <DescriptionListDescription>
            <ErrorBox
              variant="warning"
              message={applicationsLoadWarningMessage}
              response={appsError ?? {}}
            />
          </DescriptionListDescription>
        </DescriptionListGroup>
      ) : null}
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
              {formValues[FieldId.LogForwardingS3BucketName]?.trim() || logForwardingNoneLabel}
            </DescriptionListDescription>
          </DescriptionListGroup>
          <DescriptionListGroup>
            <DescriptionListTerm>Bucket prefix</DescriptionListTerm>
            <DescriptionListDescription>
              {s3BucketPrefixTrimmed || logForwardingNoneLabel}
            </DescriptionListDescription>
          </DescriptionListGroup>
          <DescriptionListGroup>
            <DescriptionListTerm>Selected groups and applications</DescriptionListTerm>
            <DescriptionListDescription>
              <LogForwardingSelectedAppsDescription
                selectedIds={formValues[FieldId.LogForwardingS3SelectedItems] ?? []}
                tree={logForwardingTree}
                treeLoading={isLogForwardingTreeLoading}
              />
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
              {formValues[FieldId.LogForwardingCloudWatchLogGroupName]?.trim() ||
                logForwardingNoneLabel}
            </DescriptionListDescription>
          </DescriptionListGroup>
          <DescriptionListGroup>
            <DescriptionListTerm>Role ARN</DescriptionListTerm>
            <DescriptionListDescription>
              {formValues[FieldId.LogForwardingCloudWatchRoleArn]?.trim() || logForwardingNoneLabel}
            </DescriptionListDescription>
          </DescriptionListGroup>
          <DescriptionListGroup>
            <DescriptionListTerm>Selected groups and applications</DescriptionListTerm>
            <DescriptionListDescription>
              <LogForwardingSelectedAppsDescription
                selectedIds={formValues[FieldId.LogForwardingCloudWatchSelectedItems] ?? []}
                tree={logForwardingTree}
                treeLoading={isLogForwardingTreeLoading}
              />
            </DescriptionListDescription>
          </DescriptionListGroup>
        </>
      ) : null}
    </>
  );
}
