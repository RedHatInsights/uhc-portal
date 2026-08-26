import semver from 'semver';

export enum SpotInterruptionMode {
  Simple = 'simple',
  Enhanced = 'enhanced',
}

export const ENHANCED_SPOT_MIN_VERSION = '4.22.0';

export const ENHANCED_SPOT_VERSION_DISABLED_REASON =
  'Enhanced Spot instances require OpenShift version 4.22 or above';

export const SPOT_INTERRUPTION_MODE_ENHANCED_LABEL = 'Spot instances Enhanced';
export const SPOT_INTERRUPTION_MODE_SIMPLE_LABEL = 'Spot instances Simple';

type ClusterAwsSpotInterruptionHandling = {
  aws?: {
    termination_handler_queue_url?: string | null;
    spot_termination_handler_queue_url?: string | null;
  };
};

export const getSpotInterruptionHandlerQueueUrl = (
  cluster: ClusterAwsSpotInterruptionHandling,
): string | undefined => {
  const queueUrl = cluster?.aws?.termination_handler_queue_url;
  return queueUrl || undefined;
};

export const getSpotInterruptionHandlingModeLabel = (
  cluster: ClusterAwsSpotInterruptionHandling,
): string =>
  getSpotInterruptionHandlerQueueUrl(cluster)
    ? SPOT_INTERRUPTION_MODE_ENHANCED_LABEL
    : SPOT_INTERRUPTION_MODE_SIMPLE_LABEL;

export const isEnhancedSpotVersionSupported = (clusterVersion?: string): boolean => {
  const coercedVersion = semver.coerce(clusterVersion);
  return coercedVersion ? semver.gte(coercedVersion, ENHANCED_SPOT_MIN_VERSION) : false;
};

export const SQS_QUEUE_URL_PLACEHOLDER =
  'https://sqs.us-east-1.amazonaws.com/123456789012/rosa-cluster-spot';

export const SPOT_INTERRUPTION_INTRO = 'Configure how Spot instance interruptions are handled.';

export const SIMPLE_SPOT_DESCRIPTION =
  'No AWS prerequisites. Reactive interruption handling via MachineHealthCheck only. Best for testing and/or workloads resilient to interruptions.';

export const ENHANCED_SPOT_DESCRIPTION =
  'Requires SQS queue, EventBridge rule, and resource policy. Proactive graceful draining during the 2-minute interruption window.';

export const SQS_QUEUE_URL_HELPER_TEXT =
  'Receives EC2 Spot Instance interruption notices via EventBridge.';

export const DEFAULT_SPOT_INTERRUPTION_PREREQ_ALERT =
  'Ensure your SQS queue, EventBridge rule, and resource policy are configured before enabling Enhanced Spot instances.';
