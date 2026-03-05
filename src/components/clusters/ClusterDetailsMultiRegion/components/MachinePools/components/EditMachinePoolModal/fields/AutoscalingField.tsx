import * as React from 'react';
import { useField } from 'formik';

import { Checkbox, FormGroup } from '@patternfly/react-core';

import links from '~/common/installLinks.mjs';
import { isROSA } from '~/components/clusters/common/clusterStates';
import { constants } from '~/components/clusters/common/CreateOSDFormConstants';
import ExternalLink from '~/components/common/ExternalLink';
import PopoverHint from '~/components/common/PopoverHint';
import useCanClusterAutoscale from '~/hooks/useCanClusterAutoscale';
import { ClusterFromSubscription } from '~/types/types';

const fieldId = 'autoscaling';

type AutoscalingFieldProps = {
  cluster: ClusterFromSubscription;
};

const AutoscalingField = ({ cluster }: AutoscalingFieldProps) => {
  const clusterFromSubscription = cluster as ClusterFromSubscription;
  const [field] = useField(fieldId);
  const canAutoScale = useCanClusterAutoscale(
    clusterFromSubscription.product?.id,
    clusterFromSubscription.subscription?.cluster_billing_model,
    clusterFromSubscription.subscription?.capabilities,
  );

  const isRosa = isROSA(cluster);
  const autoScalingUrl = isRosa ? links.ROSA_AUTOSCALING : links.APPLYING_AUTOSCALING;

  return canAutoScale ? (
    <FormGroup label="Scaling">
      <Checkbox
        {...field}
        label={
          <>
            Enable autoscaling{' '}
            <PopoverHint
              hint={
                <>
                  {constants.autoscaleHint}{' '}
                  <ExternalLink href={autoScalingUrl}>
                    Learn more about autoscaling
                    {isRosa ? ' with ROSA' : ''}
                  </ExternalLink>
                </>
              }
            />
          </>
        }
        isChecked={field.value as boolean}
        onChange={(event, checked) => {
          field.onChange(event);
        }}
        id={fieldId}
        description="Autoscaling automatically adds and removes worker (compute) nodes from the cluster based on resource requirements."
      />
    </FormGroup>
  ) : null;
};

export default AutoscalingField;
