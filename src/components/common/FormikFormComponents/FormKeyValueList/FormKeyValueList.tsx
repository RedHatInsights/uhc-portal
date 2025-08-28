import React, { useEffect } from 'react';
import { ArrayHelpers, Field } from 'formik';

import { Button, Grid, GridItem } from '@patternfly/react-core';
import { MinusCircleIcon } from '@patternfly/react-icons/dist/esm/icons/minus-circle-icon';
import { PlusCircleIcon } from '@patternfly/react-icons/dist/esm/icons/plus-circle-icon';

import { getRandomID, nodeKeyValueTooltipText } from '~/common/helpers';
import { validateLabelKey, validateLabelValue } from '~/common/validators';
import { FieldId } from '~/components/clusters/wizards/common/constants';
import { useFormState } from '~/components/clusters/wizards/hooks';

import ButtonWithTooltip from '../../ButtonWithTooltip';

import FormKeyLabelKey from './FormKeyLabelKey';
import FormKeyLabelValue from './FormKeyLabelValue';

import './FormKeyValueList.scss';

const FormKeyValueList = ({ push, remove }: ArrayHelpers) => {
  const {
    values: { [FieldId.NodeLabels]: nodeLabels },
    setFieldValue,
    setFieldTouched,
    getFieldProps,
    getFieldMeta,
    validateForm,
  } = useFormState();

  const hasInvalidKeys = (fieldsArray: any[]) =>
    !fieldsArray || fieldsArray.some((field) => !field.key);

  useEffect(() => {
    if (!nodeLabels?.length) {
      setFieldValue(FieldId.NodeLabels, [{ id: getRandomID() }]);
    }
    validateForm();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nodeLabels, setFieldValue]);

  return (
    <Grid hasGutter>
      <GridItem span={4} className="pf-v6-c-form__label pf-v6-c-form__label-text">
        Key
      </GridItem>
      <GridItem span={4} className="pf-v6-c-form__label pf-v6-c-form__label-text">
        Value
      </GridItem>
      <GridItem span={4} />
      {(nodeLabels as any[])?.map((label, index) => {
        const isRemoveDisabled = index === 0 && nodeLabels.length === 1;
        const fieldNameLabelKey = `${FieldId.NodeLabels}[${index}].key`;
        const fieldNameLabelValue = `${FieldId.NodeLabels}[${index}].value`;

        return (
          /* Adding index to fix issue when machine pool entries with same subnets are removed */
          // eslint-disable-next-line react/no-array-index-key
          <React.Fragment key={`${label.id}`}>
            <GridItem span={4}>
              <Field
                name={fieldNameLabelKey}
                type="text"
                component={FormKeyLabelKey}
                index={index}
                validate={(value: string) => {
                  // since nodeLabels are not up to date on validation
                  const newNodeLabels = [...nodeLabels];
                  newNodeLabels[index] = { ...newNodeLabels[index], key: value };
                  return validateLabelKey(
                    value,
                    { node_labels: newNodeLabels },
                    undefined,
                    fieldNameLabelKey,
                  );
                }}
                input={{
                  ...getFieldProps(fieldNameLabelKey),
                  onChange: (value: string) => {
                    setFieldValue(fieldNameLabelKey, value, false);
                    setFieldTouched(fieldNameLabelKey, true, false);
                  },
                }}
                meta={getFieldMeta(fieldNameLabelKey)}
              />
            </GridItem>
            <GridItem span={4}>
              <Field
                name={fieldNameLabelValue}
                type="text"
                component={FormKeyLabelValue}
                index={index}
                validate={(value: string) => {
                  // since nodeLabels are not up to date on validation
                  const newNodeLabels = [...nodeLabels];
                  newNodeLabels[index] = { ...newNodeLabels[index], value };
                  return validateLabelValue(
                    value,
                    { node_labels: newNodeLabels },
                    undefined,
                    fieldNameLabelKey,
                  );
                }}
                input={{
                  ...getFieldProps(fieldNameLabelValue),
                  onChange: (value: string) => {
                    setFieldValue(fieldNameLabelValue, value, false);
                    setFieldTouched(fieldNameLabelValue, true, false);
                  },
                }}
                meta={getFieldMeta(fieldNameLabelValue)}
              />
            </GridItem>
            <GridItem span={4}>
              <Button
                onClick={() => remove(index)}
                icon={<MinusCircleIcon />}
                variant="link"
                isDisabled={isRemoveDisabled}
                aria-label="Remove item"
                className={
                  isRemoveDisabled
                    ? 'formKeyValueList-removeBtn-disabled'
                    : 'formKeyValueList-removeBtn'
                }
              />
            </GridItem>
          </React.Fragment>
        );
      })}
      <GridItem>
        <ButtonWithTooltip
          onClick={() => push({ id: getRandomID() })}
          icon={<PlusCircleIcon />}
          variant="link"
          isInline
          className="formKeyValueList-addBtn"
          disableReason={hasInvalidKeys(nodeLabels) && nodeKeyValueTooltipText}
        >
          Add additional label
        </ButtonWithTooltip>
      </GridItem>
    </Grid>
  );
};

export default FormKeyValueList;
