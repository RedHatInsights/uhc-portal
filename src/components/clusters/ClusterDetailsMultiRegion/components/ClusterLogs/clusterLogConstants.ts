import { ClusterLogLog_type as ClusterLogType, ClusterLogSeverity } from '~/types/service_logs.v1';

const GET_CLUSTER_LOGS = 'GET_CLUSTER_LOGS';
const RESET_CLUSTER_HISTORY = 'RESET_CLUSTER_HISTORY';

// HCC severity labels only (ROSA-725 / OCMUI-4306). Legacy Info/Warning/Major are no longer
// offered in the UI; ClusterLogSeverity may still list them from the OpenAPI model.
const SEVERITY_TYPES: string[] = [
  ClusterLogSeverity.Debug,
  ClusterLogSeverity.Low,
  ClusterLogSeverity.Moderate,
  ClusterLogSeverity.Important,
  ClusterLogSeverity.Critical,
];

const LOG_TYPES: string[] = Object.values(ClusterLogType).sort((a, b) =>
  a.localeCompare(b, undefined, { sensitivity: 'case' }),
);

const clusterLogConstants = {
  GET_CLUSTER_LOGS,
  SEVERITY_TYPES,
  LOG_TYPES,
  RESET_CLUSTER_HISTORY,
};

export { GET_CLUSTER_LOGS, LOG_TYPES, RESET_CLUSTER_HISTORY, SEVERITY_TYPES };
export default clusterLogConstants;
