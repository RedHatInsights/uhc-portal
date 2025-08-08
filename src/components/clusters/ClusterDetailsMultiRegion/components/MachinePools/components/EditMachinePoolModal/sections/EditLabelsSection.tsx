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

import { FormGroupHelperText } from '~/components/common/FormGroupHelperText';
import TextField from '~/components/common/formik/TextField';
import Checkbox from '~/components/common/FormikFormComponents/Checkbox';
import {
  AWS_TAGS_NEW_MP,
  ENABLE_AWS_TAGS_EDITING_IN_EDIT_MODAL,
  ENABLE_AWS_TAGS_VIEW_IN_EDIT_MODAL,
} from '~/queries/featureGates/featureConstants';
import { useFeatureGate } from '~/queries/featureGates/useFetchFeatureGate';

import FieldArrayRemoveButton from '../components/FieldArrayRemoveButton';
import { EditMachinePoolValues } from '../hooks/useMachinePoolFormik';

import './EditLabelsSection.scss';

const AWS_TAG_MAX_COUNT = 25;

const EditLabelsSection = ({
  isNewMachinePool = false,
  isROSAHCP = false,
}: {
  isNewMachinePool: boolean;
  isROSAHCP: boolean;
}) => {
  const [input] = useField<EditMachinePoolValues['labels']>('labels');

  const showAWSTagsFeatureGate = useFeatureGate(AWS_TAGS_NEW_MP) && isROSAHCP;

  const canViewAwsTagsInEditModal =
    showAWSTagsFeatureGate && !isNewMachinePool && ENABLE_AWS_TAGS_VIEW_IN_EDIT_MODAL;
  const canEditAwsTagsInEditModal =
    showAWSTagsFeatureGate && !isNewMachinePool && ENABLE_AWS_TAGS_EDITING_IN_EDIT_MODAL;
  const showAwsTags = (isNewMachinePool && showAWSTagsFeatureGate) || canViewAwsTagsInEditModal;

  return (
    <GridItem>
      <FormGroup fieldId="labels" label={`Node labels${showAwsTags ? ' and AWS Tags' : ''}`}>
        <FormGroupHelperText>
          <div className="uhc-labels-section__description">
            Labels {showAwsTags ? 'and AWS Tags ' : ''} help you organize and select resources.
            Adding labels {showAwsTags ? 'or AWS Tags' : ''} below will let you query for objects
            that have similar, overlapping or dissimilar labels{showAwsTags ? ' or AWS Tags' : ''}.
          </div>
        </FormGroupHelperText>
      </FormGroup>
      <FieldArray
        name="labels"
        render={({ push, remove }) => (
          <>
            <Grid hasGutter>
              <GridItem span={4}>
                <Content component={ContentVariants.small}>Key</Content>
              </GridItem>
              <GridItem span={8}>
                <Content component={ContentVariants.small}>Value</Content>
              </GridItem>
            </Grid>
            <Grid hasGutter>
              {input.value.map((label, index) => {
                const keyField = `labels[${index}].key`;
                const valueField = `labels[${index}].value`;
                const isAwsTagField = `labels[${index}].isAwsTag`;
                const isAwsTag = label.isAwsTag ?? false;

                // Hide AWS tags if feature is not enabled or if in edit modal without view permission
                if (
                  isAwsTag &&
                  (!showAWSTagsFeatureGate || (!isNewMachinePool && !canViewAwsTagsInEditModal))
                ) {
                  return null;
                }

                const isReadOnly =
                  isAwsTag && canViewAwsTagsInEditModal && !canEditAwsTagsInEditModal;

                const showCheckbox =
                  showAWSTagsFeatureGate &&
                  (isNewMachinePool ||
                    canEditAwsTagsInEditModal ||
                    (isAwsTag && canViewAwsTagsInEditModal));

                const tooManyAwsTags =
                  !isAwsTag &&
                  input.value.filter((label) => label.isAwsTag).length >= AWS_TAG_MAX_COUNT;
                return (
                  // eslint-disable-next-line react/no-array-index-key
                  <React.Fragment key={index}>
                    <GridItem span={4}>
                      <TextField fieldId={keyField} isReadOnly={isReadOnly} />
                    </GridItem>
                    <GridItem span={4}>
                      <TextField fieldId={valueField} isReadOnly={isReadOnly} />
                    </GridItem>

                    {showCheckbox ? (
                      <GridItem span={2}>
                        <Checkbox
                          label="AWS Tag"
                          fieldId={isAwsTagField}
                          isDisabled={isReadOnly || tooManyAwsTags}
                        />
                      </GridItem>
                    ) : null}

                    <GridItem span={showCheckbox ? 2 : 4}>
                      {!isAwsTag || isNewMachinePool || canEditAwsTagsInEditModal ? (
                        <FieldArrayRemoveButton
                          input={input}
                          index={index}
                          onRemove={remove}
                          onPush={() => push({ key: '', value: '', isAwsTag: false })}
                        />
                      ) : null}
                    </GridItem>
                  </React.Fragment>
                );
              })}

              <GridItem span={6}>
                <Button
                  icon={<PlusCircleIcon />}
                  onClick={() => push({ key: '', value: '', isAwsTag: false })}
                  variant="link"
                  isInline
                >
                  Add label
                  {showAwsTags ? ' or AWS Tag' : ''}
                </Button>
              </GridItem>
            </Grid>
          </>
        )}
      />
    </GridItem>
  );
};

export default EditLabelsSection;
