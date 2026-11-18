import clusterStates from '../../../../common/clusterStates';

const shouldShowLogs = (cluster) =>
  cluster.managed &&
  cluster.canUpdateSubscription &&
  (cluster.state === clusterStates.waiting ||
    cluster.state === clusterStates.pending ||
    cluster.state === clusterStates.installing ||
    cluster.state === clusterStates.validating ||
    cluster.state === clusterStates.error ||
    cluster.state === clusterStates.uninstalling);

export default shouldShowLogs;
