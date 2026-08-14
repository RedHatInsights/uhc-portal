export enum SpotInterruptionMode {
  Simple = 'simple',
  Enhanced = 'enhanced',
}

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
