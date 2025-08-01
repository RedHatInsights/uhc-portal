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

  const showAWSTags = useFeatureGate(AWS_TAGS_NEW_MP) && isROSAHCP;
  const showAwsTagsInEditModal =
    showAWSTags && !isNewMachinePool && ENABLE_AWS_TAGS_VIEW_IN_EDIT_MODAL;
  const editAWSTagsInEditModal =
    showAWSTags && !isNewMachinePool && ENABLE_AWS_TAGS_EDITING_IN_EDIT_MODAL;

  return (
    <GridItem>
      <FormGroup fieldId="labels" label="Node labels">
        <FormGroupHelperText>
          <div className="uhc-labels-section__description">
            Labels help you organize and select resources. Adding labels below will let you query
            for objects that have similar, overlapping or dissimilar labels.
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

                if (isAwsTag && (!showAWSTags || (!showAwsTagsInEditModal && !isNewMachinePool))) {
                  return null;
                }

                const isReadOnly = isAwsTag && showAwsTagsInEditModal && !editAWSTagsInEditModal;

                const showCheckbox =
                  showAWSTags &&
                  (isNewMachinePool ||
                    editAWSTagsInEditModal ||
                    (isAwsTag && !editAWSTagsInEditModal));

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
                      {!isAwsTag || isNewMachinePool || editAWSTagsInEditModal ? (
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
                  {showAWSTags && (isNewMachinePool || ENABLE_AWS_TAGS_EDITING_IN_EDIT_MODAL)
                    ? ' or AWS Tag'
                    : ''}
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
