import * as React from 'react';
import { useField } from 'formik';

import { FormGroup, NumberInput } from '@patternfly/react-core';

import { normalizeProductID } from '~/common/normalize';
import { normalizedProducts } from '~/common/subscriptionTypes';
import { isHypershiftCluster } from '~/components/clusters/common/clusterStates';
import {
  getWorkerNodeVolumeSizeMaxGiB,
  getWorkerNodeVolumeSizeMinGiB,
} from '~/components/clusters/common/machinePools/utils';
import { FormGroupHelperText } from '~/components/common/FormGroupHelperText';
import PopoverHint from '~/components/common/PopoverHint';
import WithTooltip from '~/components/common/WithTooltip';
import useFormikOnChange from '~/hooks/useFormikOnChange';
import { ClusterFromSubscription } from '~/types/types';

import './DiskSizeField.scss';

const fieldId = 'diskSize';

type DiskSizeFieldProps = {
  cluster: ClusterFromSubscription;
  isEdit: boolean;
};

const DiskSizeField = ({ cluster, isEdit }: DiskSizeFieldProps) => {
  const isHypershift = isHypershiftCluster(cluster);

  const showDiskSize = normalizeProductID(cluster.product?.id) === normalizedProducts.ROSA;
  const [field, { error, touched }] = useField<number>(fieldId);
  const onChange = useFormikOnChange(fieldId);

  const minWorkerVolumeSizeGiB = getWorkerNodeVolumeSizeMinGiB(isHypershift);
  const maxWorkerVolumeSizeGiB = getWorkerNodeVolumeSizeMaxGiB(cluster.version?.raw_id || '');

  return showDiskSize ? (
    <FormGroup
      fieldId={fieldId}
      label="Root disk size"
      isRequired
      labelHelp={
        <PopoverHint
          hint={`Root disks are AWS EBS volumes attached as the primary disk for AWS EC2 instances. The root disk size for this machine pool group of nodes must be between ${minWorkerVolumeSizeGiB}GiB and ${maxWorkerVolumeSizeGiB}GiB.`}
        />
      }
    >
      <WithTooltip
        showTooltip={isEdit}
        content="This option cannot be edited from its original setting selection."
      >
        <NumberInput
          {...field}
          onPlus={() => onChange(field.value + 1)}
          onMinus={() => onChange(field.value - 1)}
          onChange={(e) => {
            const newValue = (e.target as any).value;
            onChange(Number(newValue));
          }}
          id={fieldId}
          min={minWorkerVolumeSizeGiB}
          max={maxWorkerVolumeSizeGiB}
          unit={<span className="ocm-disk-size_unit">GiB</span>}
          isDisabled={isEdit}
        />
      </WithTooltip>

      <FormGroupHelperText touched={touched} error={error} />
    </FormGroup>
  ) : null;
};

export default DiskSizeField;
