import { createOperatorRolesPrefix } from '~/components/clusters/wizards/rosa/ClusterRolesScreen/clusterRolesHelper';

/**
 * Default CloudWatch log group name for ROSA log forwarding: `{clusterName}-{4-char hash}`.
 * Reuses the same generator as Custom operator role prefix (`createOperatorRolesPrefix`).
 */
export const createCloudWatchLogGroupName = (clusterName: string): string =>
  createOperatorRolesPrefix(clusterName);
