export const s3BucketNameTooltip =
  'The unique identifier for the S3 bucket where your logs will be stored. Must be globally unique across all of AWS.';

export const s3BucketPrefixTooltip =
  'An optional path (e.g., logs/cluster-01/) to organize your data. This helps you categorize log files within a shared bucket for easier searching and management.';

export const cloudWatchLogGroupTooltip =
  'The name of the folder in AWS CloudWatch where your logs will be stored.';

export const cloudWatchRoleArnTooltip =
  'The Amazon Resource Name (ARN) for the IAM role that allows the service to write logs to your chosen destination.';

export const groupsApplicationsAvailableTooltip =
  'When you select a group, the log forwarder collects all the applications in that group. You can also select individual applications. A group represents a collection of related services (like control plane or audit), while an application is a specific service within that group.';

export const groupsApplicationsChosenTooltip =
  'A summary of all the log sources you have chosen to forward. Review this list to ensure you are capturing the data you need.';
