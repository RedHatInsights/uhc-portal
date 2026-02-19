import React, { useEffect } from 'react';
import { Field, setNestedObjectValues } from 'formik';

import { Alert, Button, Grid, GridItem } from '@patternfly/react-core';
import { MinusCircleIcon } from '@patternfly/react-icons/dist/esm/icons/minus-circle-icon';
import { PlusCircleIcon } from '@patternfly/react-icons/dist/esm/icons/plus-circle-icon';

import { scrollToFirstField } from '~/common/helpers';
import { validateMultipleMachinePoolsSubnets } from '~/common/validators';
import { getMatchingAvailabilityZones, inferRegionFromSubnets } from '~/common/vpcHelpers';
import { SubnetSelectField } from '~/components/clusters/common/SubnetSelectField';
import { emptyAWSSubnet } from '~/components/clusters/wizards/common/constants';
import { FormSubnet } from '~/components/clusters/wizards/common/FormSubnet';
import { getScrollErrorIds } from '~/components/clusters/wizards/form/utils';
import { useFormState } from '~/components/clusters/wizards/hooks';
import { FieldId } from '~/components/clusters/wizards/rosa/constants';
import { useUpdateMinComputeNodeCount } from '~/hooks/useUpdateMinComputeNodeCount';
import { CloudVpc } from '~/types/clusters_mgmt.v1';

import './MachinePoolSubnetsForm.scss';

type MachinePoolSubnetsFormProps = {
  selectedVPC?: CloudVpc;
  warning?: string;
  allMachinePoolSubnets: FormSubnet[];
};

const MachinePoolSubnetsForm = ({
  selectedVPC,
  warning,
  allMachinePoolSubnets,
}: MachinePoolSubnetsFormProps) => {
  const {
    values,
    getFieldProps,
    setFieldValue,
    setFieldTouched,
    getFieldMeta,
    validateForm,
    setTouched,
  } = useFormState();
  const { updateMinComputeNodeCount } = useUpdateMinComputeNodeCount();

  useEffect(
    () => {
      const updateFormErrors = async () => {
        const errors = await validateForm(values);
        if (Object.keys(errors || {}).length > 0) {
          setTouched(setNestedObjectValues(errors, true));
          scrollToFirstField(getScrollErrorIds(errors));
        }
      };

      if (allMachinePoolSubnets?.length) {
        updateFormErrors();
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [allMachinePoolSubnets, setTouched, validateForm],
  );

  const region = selectedVPC ? inferRegionFromSubnets(selectedVPC) : undefined;
  const allowedAZs =
    region && selectedVPC ? getMatchingAvailabilityZones(region, selectedVPC, ['private']) : [];

  const addMachinePool = (machinePoolSubnet: FormSubnet) =>
    setFieldValue(
      FieldId.MachinePoolsSubnets,
      [...allMachinePoolSubnets, machinePoolSubnet],
      false,
    );

  const removeMachinePool = (machinePoolsSubnetsIndex: number) => {
    const newMachinePoolsSubnets = allMachinePoolSubnets.filter(
      (e, i) => i !== machinePoolsSubnetsIndex,
    );
    const newPoolsLength = newMachinePoolsSubnets.length;

    setFieldValue(FieldId.MachinePoolsSubnets, newMachinePoolsSubnets);
    const fieldNameSubnetId = `${FieldId.MachinePoolsSubnets}[${machinePoolsSubnetsIndex}].privateSubnetId`;
    setFieldTouched(fieldNameSubnetId, false, false);

    updateMinComputeNodeCount({ newPoolsLength });
  };

  useEffect(() => {
    if (allMachinePoolSubnets === undefined || allMachinePoolSubnets.length === 0) {
      setFieldValue(FieldId.MachinePoolsSubnets, [emptyAWSSubnet()]);
    }
  }, [allMachinePoolSubnets, setFieldValue]);

  return (
    <Grid hasGutter>
      {warning && (
        <GridItem>
          <Alert variant="warning" isPlain isInline title={warning} />
        </GridItem>
      )}
      <GridItem span={2} className="pf-v6-c-form__label pf-v6-c-form__label-text">
        Machine pool
      </GridItem>
      <GridItem span={4} className="pf-v6-c-form__label pf-v6-c-form__label-text">
        Private subnet name
      </GridItem>
      <GridItem span={6} />

      {allMachinePoolSubnets?.map((subnet, index) => {
        const isRemoveDisabled = allMachinePoolSubnets.length === 1;
        const fieldNameSubnetId = `${FieldId.MachinePoolsSubnets}[${index}].privateSubnetId`;

        return selectedVPC ? (
          // eslint-disable-next-line react/no-array-index-key
          <React.Fragment key={`${subnet.privateSubnetId}_${index}`}>
            <GridItem span={2}>Machine pool {index + 1}</GridItem>
            <GridItem span={4}>
              <Field
                component={SubnetSelectField}
                name={fieldNameSubnetId}
                validate={(subnetId: string) =>
                  validateMultipleMachinePoolsSubnets(subnetId, {
                    machinePoolsSubnets: allMachinePoolSubnets,
                  })
                }
                isRequired
                privacy="private"
                selectedVPC={selectedVPC}
                allowedAZs={allowedAZs}
                withAutoSelect={false}
                usedSubnetIds={allMachinePoolSubnets
                  .map((mp) => mp.privateSubnetId)
                  .filter((id) => id && id !== subnet.privateSubnetId)}
                input={{
                  ...getFieldProps(fieldNameSubnetId),
                  onChange: async (subnetId: string) => {
                    await setFieldValue(fieldNameSubnetId, subnetId, false);
                    validateForm();
                  },
                }}
                meta={getFieldMeta(fieldNameSubnetId)}
              />
            </GridItem>
            <GridItem span={1}>
              <Button
                onClick={() => removeMachinePool(index)}
                icon={<MinusCircleIcon />}
                variant="link"
                isDisabled={isRemoveDisabled}
                className={
                  isRemoveDisabled
                    ? 'machinePoolSubnetsForm-removeBtn-disabled'
                    : 'machinePoolSubnetsForm-removeBtn'
                }
                aria-label="Remove machine pool"
                data-testid={`remove-machine-pool-${index}`}
              />
            </GridItem>
            <GridItem span={5} />
          </React.Fragment>
        ) : null;
      })}
      <GridItem>
        <Button
          onClick={() => addMachinePool(emptyAWSSubnet())}
          icon={<PlusCircleIcon />}
          variant="link"
          isInline
          className="machinePoolSubnetsForm-addBtn"
          isDisabled={!selectedVPC?.id}
        >
          Add machine pool
        </Button>
      </GridItem>
    </Grid>
  );
};

export default MachinePoolSubnetsForm;
