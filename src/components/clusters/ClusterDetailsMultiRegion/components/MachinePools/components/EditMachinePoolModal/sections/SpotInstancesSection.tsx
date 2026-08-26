import * as React from 'react';
import { useField } from 'formik';

import { Form, FormGroup, GridItem, Radio } from '@patternfly/react-core';

import { SPOT_CAPACITY_RESERVATION_CONFLICT_REASON } from '~/components/clusters/common/machinePools/constants';
import PopoverHint from '~/components/common/PopoverHint';
import { ClusterFromSubscription } from '~/types/types';

import MaxPriceField from '../fields/MaxPriceField';
import SpotInterruptionHandlingModeField from '../fields/SpotInterruptionHandlingModeField';
import UseSpotInstancesField from '../fields/UseSpotInstancesField';
import { EditMachinePoolValues } from '../hooks/useMachinePoolFormik';

type SpotInstancesSectionProps = {
  isEdit: boolean;
  isHypershift?: boolean;
  cluster?: ClusterFromSubscription;
};

const SpotInstancesSection = ({ isEdit, isHypershift, cluster }: SpotInstancesSectionProps) => {
  const [capacityReservationPreferenceField] = useField<
    EditMachinePoolValues['capacityReservationPreference']
  >('capacityReservationPreference');
  const hasCapacityReservation = !!(
    capacityReservationPreferenceField.value && capacityReservationPreferenceField.value !== 'none'
  );

  const [onDemandTypeField] = useField<EditMachinePoolValues['spotInstanceType']>({
    name: 'spotInstanceType',
    value: 'onDemand',
    type: 'radio',
  });

  const [maximumTypeField] = useField<EditMachinePoolValues['spotInstanceType']>({
    name: 'spotInstanceType',
    value: 'maximum',
    type: 'radio',
  });

  const isSpotDisabled = isEdit || hasCapacityReservation;

  const spotDisabledReason =
    !isEdit && hasCapacityReservation ? SPOT_CAPACITY_RESERVATION_CONFLICT_REASON : undefined;

  return (
    <GridItem>
      <FormGroup fieldId="spotInstances" label="Cost saving" />
      <UseSpotInstancesField
        isDisabled={isSpotDisabled}
        disabledReason={spotDisabledReason}
        footer={
          isHypershift && cluster ? (
            <SpotInterruptionHandlingModeField cluster={cluster} />
          ) : undefined
        }
      >
        <Form>
          <Radio
            {...onDemandTypeField}
            isChecked={onDemandTypeField.checked}
            id="spotinstance-ondemand"
            onChange={(e, _) => onDemandTypeField.onChange(e)}
            label="Use On-Demand instance price"
            description="The maximum price defaults to charge up to the On-Demand Instance price."
            isDisabled={isSpotDisabled}
          />
          <Radio
            {...maximumTypeField}
            isChecked={maximumTypeField.checked}
            onChange={(e, _) => maximumTypeField.onChange(e)}
            id="spotinstance-max"
            label={
              <>
                Set maximum price{' '}
                <PopoverHint
                  headerContent="Maximum hourly price for a Spot Instance"
                  hint="This value should be lower or equal to the On-Demand Instance price. This cannot be changed after the machine pool is created."
                />
              </>
            }
            description="Specify the maximum hourly price for a Spot Instance."
            isDisabled={isSpotDisabled}
            body={
              maximumTypeField.checked && (
                <MaxPriceField isEdit={isEdit} isHypershift={isHypershift} />
              )
            }
          />
        </Form>
      </UseSpotInstancesField>
    </GridItem>
  );
};

export default SpotInstancesSection;
