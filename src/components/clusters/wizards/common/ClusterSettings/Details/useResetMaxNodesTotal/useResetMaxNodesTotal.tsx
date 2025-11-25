import { MAX_NODES_INSUFFICIEN_VERSION as MAX_NODES_180 } from '~/components/clusters/common/machinePools/constants';
import { getMaxNodesTotalDefaultAutoscaler } from '~/components/clusters/common/machinePools/utils';
import { FieldId } from '~/components/clusters/wizards/common/constants';
import { useFormState } from '~/components/clusters/wizards/hooks/useFormState';
import { MAX_NODES_TOTAL_249 } from '~/queries/featureGates/featureConstants';
import { useFeatureGate } from '~/queries/featureGates/useFetchFeatureGate';
import { Version } from '~/types/clusters_mgmt.v1';

type ResetMaxNodesTotalParams = {
  clusterVersion?: Version;
  isMultiAz?: boolean;
};

function useResetMaxNodesTotal() {
  const allow249Nodes = useFeatureGate(MAX_NODES_TOTAL_249);
  const { getFieldProps, setFieldValue } = useFormState();

  const resetMaxNodesTotal = ({ clusterVersion, isMultiAz }: ResetMaxNodesTotalParams) => {
    const newVersion = clusterVersion ?? getFieldProps(FieldId.ClusterVersion).value;
    const newIsMultiAz = isMultiAz ?? getFieldProps(FieldId.MultiAz).value === 'true';

    const maxNodesTotalDefault = allow249Nodes
      ? getMaxNodesTotalDefaultAutoscaler(newVersion?.raw_id, newIsMultiAz)
      : MAX_NODES_180;

    setFieldValue('cluster_autoscaling.resource_limits.max_nodes_total', maxNodesTotalDefault);
  };

  return { resetMaxNodesTotal };
}

export { useResetMaxNodesTotal };
