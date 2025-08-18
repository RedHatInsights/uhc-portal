import * as React from 'react';
import { FieldArray, useField } from 'formik';

import {
  Alert,
  AlertVariant,
  Content,
  ContentVariants,
  FormGroup,
  Grid,
  GridItem,
} from '@patternfly/react-core';
import { PlusCircleIcon } from '@patternfly/react-icons/dist/esm/icons/plus-circle-icon';

import ButtonWithTooltip from '~/components/common/ButtonWithTooltip';
import { FormGroupHelperText } from '~/components/common/FormGroupHelperText';
import TextField from '~/components/common/formik/TextField';
import { ENABLE_AWS_TAGS_EDITING } from '~/queries/featureGates/featureConstants';

import FieldArrayRemoveButton from '../components/FieldArrayRemoveButton';
import { EditMachinePoolValues } from '../hooks/useMachinePoolFormik';

import './EditLabelsSection.scss';

export const AWS_TAG_MAX_COUNT = 17; // only exported for testing

const canNotEditMessage = 'This option cannot be edited from its original setting selection.';

const EditAWSTagsSection = ({ isNewMachinePool }: { isNewMachinePool: boolean }) => {
  const [input] = useField<EditMachinePoolValues['awsTags']>('awsTags');

  const tooManyAwsTags = input?.value?.length >= AWS_TAG_MAX_COUNT;

  const disabled = !isNewMachinePool && !ENABLE_AWS_TAGS_EDITING;

  const tooManyTagsDisableReason = `You have reached the maximum number of AWS Tags of ${AWS_TAG_MAX_COUNT}`;
  const awsTagsDisabledDisableReason =
    'Modifying or adding AWS Tags are not available for existing machine pools';

  let disableReason: string | undefined;
  if (tooManyAwsTags) {
    disableReason = tooManyTagsDisableReason;
  } else if (!isNewMachinePool && !ENABLE_AWS_TAGS_EDITING) {
    disableReason = awsTagsDisabledDisableReason;
  }

  return (
    <GridItem>
      <FormGroup fieldId="awsTags" label="AWS Tags">
        <FormGroupHelperText>
          <div className="uhc-labels-section__description">
            AWS Tags are attached to AWS resources to provide metadata. Adding AWS Tags below will
            let you organize, manage, and identify resources.
          </div>
        </FormGroupHelperText>
      </FormGroup>

      <FieldArray
        name="awsTags"
        render={({ push, remove }) => (
          <>
            <Grid hasGutter>
              {disabled ? (
                <GridItem span={12}>
                  <Alert
                    variant={AlertVariant.warning}
                    isInline
                    isPlain
                    title={canNotEditMessage}
                  />
                </GridItem>
              ) : null}
              <GridItem span={4}>
                <Content component={ContentVariants.small} id="awsTags-key-label">
                  Key
                </Content>
              </GridItem>
              <GridItem span={8}>
                <Content component={ContentVariants.small} id="awsTags-value-label">
                  Value
                </Content>
              </GridItem>
            </Grid>
            <Grid hasGutter>
              {input.value.map((_, index) => {
                const keyField = `awsTags[${index}].key`;
                const valueField = `awsTags[${index}].value`;

                return (
                  // eslint-disable-next-line react/no-array-index-key
                  <React.Fragment key={index}>
                    <GridItem span={4}>
                      <TextField
                        fieldId={keyField}
                        isReadOnly={disabled}
                        ariaLabelledBy="awsTags-key-label"
                      />
                    </GridItem>
                    <GridItem span={4}>
                      <TextField
                        fieldId={valueField}
                        isReadOnly={disabled}
                        ariaLabelledBy="awsTags-value-label"
                      />
                    </GridItem>
                    <GridItem span={4}>
                      <FieldArrayRemoveButton
                        input={input}
                        index={index}
                        onRemove={remove}
                        onPush={() => push({ key: '', value: '' })}
                        disabled={disabled}
                      />
                    </GridItem>
                  </React.Fragment>
                );
              })}
              <GridItem span={6}>
                <ButtonWithTooltip
                  icon={<PlusCircleIcon />}
                  onClick={() => push({ key: '', value: '' })}
                  variant="link"
                  isInline
                  isAriaDisabled={disabled || tooManyAwsTags}
                  disableReason={disableReason}
                >
                  Add AWS Tag
                </ButtonWithTooltip>
              </GridItem>
            </Grid>
          </>
        )}
      />
    </GridItem>
  );
};

export default EditAWSTagsSection;
