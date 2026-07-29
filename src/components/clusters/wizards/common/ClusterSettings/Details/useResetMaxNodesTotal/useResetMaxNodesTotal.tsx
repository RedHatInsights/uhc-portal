import { getMaxNodesTotalDefaultAutoscaler } from '~/components/clusters/common/machinePools/utils';
import { FieldId } from '~/components/clusters/wizards/common/constants';
import { useFormState } from '~/components/clusters/wizards/hooks/useFormState';
import { Version } from '~/types/clusters_mgmt.v1';

type ResetMaxNodesTotalParams = {
  clusterVersion?: Version;
  isMultiAz?: boolean;
};

function useResetMaxNodesTotal() {
  const { getFieldProps, setFieldValue } = useFormState();

  const resetMaxNodesTotal = ({ clusterVersion, isMultiAz }: ResetMaxNodesTotalParams) => {
    const newVersion = clusterVersion ?? getFieldProps(FieldId.ClusterVersion).value;
    const newIsMultiAz = isMultiAz ?? getFieldProps(FieldId.MultiAz).value === 'true';

    const maxNodesTotalDefault = getMaxNodesTotalDefaultAutoscaler(
      newVersion?.raw_id,
      newIsMultiAz,
    );

    setFieldValue('cluster_autoscaling.resource_limits.max_nodes_total', maxNodesTotalDefault);
  };

  return { resetMaxNodesTotal };
}

export { useResetMaxNodesTotal };
