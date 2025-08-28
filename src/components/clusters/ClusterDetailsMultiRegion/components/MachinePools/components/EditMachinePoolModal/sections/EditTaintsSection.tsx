import * as React from 'react';
import { FieldArray, useField } from 'formik';

import {
  Button,
  Content,
  ContentVariants,
  FormGroup,
  Grid,
  GridItem,
} from '@patternfly/react-core';
import { PlusCircleIcon } from '@patternfly/react-icons/dist/esm/icons/plus-circle-icon';

import TextField from '~/components/common/formik/TextField';
import WithTooltip from '~/components/common/WithTooltip';
import { MachineTypesResponse } from '~/queries/types';
import { MachinePool } from '~/types/clusters_mgmt.v1';
import { ClusterFromSubscription } from '~/types/types';

import {
  isEnforcedDefaultMachinePool,
  isMinimumCountWithoutTaints,
} from '../../../machinePoolsHelper';
import FieldArrayRemoveButton from '../components/FieldArrayRemoveButton';
import TaintEffectField from '../fields/TaintEffectField';
import { EditMachinePoolValues } from '../hooks/useMachinePoolFormik';

type EditTaintsSectionProps = {
  cluster: ClusterFromSubscription;
  machinePoolId?: string;
  machinePools: MachinePool[];
  machineTypes: MachineTypesResponse;
};

const EditTaintsSection = ({
  machinePoolId,
  cluster,
  machinePools,
  machineTypes,
}: EditTaintsSectionProps) => {
  const [input] = useField<EditMachinePoolValues['taints']>('taints');
  const isDefaultMP =
    !!machinePoolId &&
    isEnforcedDefaultMachinePool(machinePoolId, machinePools, machineTypes, cluster);
  const isMinReplicaCount = machinePoolId
    ? isMinimumCountWithoutTaints({
        currentMachinePoolId: machinePoolId,
        machinePools,
        cluster,
      })
    : true;

  let taintsDisabledReason: string | undefined;
  if (isDefaultMP) {
    taintsDisabledReason = 'Machine pool ineligible for taints';
  } else if (!isMinReplicaCount) {
    taintsDisabledReason =
      'Taints cannot be added unless there are at least 2 nodes without taints across all machine pools.';
  }

  return (
    <GridItem>
      <FormGroup fieldId="taints" label="Taints" />
      <WithTooltip showTooltip={!!taintsDisabledReason} content={taintsDisabledReason}>
        <div>
          <FieldArray
            name="taints"
            render={({ push, remove }) => (
              <>
                <Grid hasGutter>
                  <GridItem span={4}>
                    <Content component={ContentVariants.small}>Key</Content>
                  </GridItem>
                  <GridItem span={4}>
                    <Content component={ContentVariants.small}>Value</Content>
                  </GridItem>
                  <GridItem span={4}>
                    <Content component={ContentVariants.small}>Effect</Content>
                  </GridItem>
                </Grid>
                <Grid hasGutter>
                  {input.value.map((_, index) => {
                    const keyField = `taints[${index}].key`;
                    const valueField = `taints[${index}].value`;
                    const effectField = `taints[${index}].effect`;

                    return (
                      // eslint-disable-next-line react/no-array-index-key
                      <React.Fragment key={index}>
                        <GridItem span={4}>
                          <TextField fieldId={keyField} isDisabled={!!taintsDisabledReason} />
                        </GridItem>
                        <GridItem span={4}>
                          <TextField fieldId={valueField} isDisabled={!!taintsDisabledReason} />
                        </GridItem>
                        <GridItem span={3}>
                          <TaintEffectField
                            fieldId={effectField}
                            isDisabled={!!taintsDisabledReason}
                          />
                        </GridItem>
                        <GridItem span={1}>
                          <FieldArrayRemoveButton
                            input={input}
                            index={index}
                            onRemove={remove}
                            onPush={() => push({ key: '', value: '', effect: 'NoSchedule' })}
                          />
                        </GridItem>
                      </React.Fragment>
                    );
                  })}
                  <GridItem span={6}>
                    <Button
                      icon={<PlusCircleIcon />}
                      onClick={() => push({ key: '', value: '', effect: 'NoSchedule' })}
                      variant="link"
                      isInline
                      isDisabled={!!taintsDisabledReason}
                    >
                      Add taint
                    </Button>
                  </GridItem>
                </Grid>
              </>
            )}
          />
        </div>
      </WithTooltip>
    </GridItem>
  );
};

export default EditTaintsSection;
