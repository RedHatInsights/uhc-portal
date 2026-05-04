import React, { useEffect } from 'react';
import type { ArrayHelpers } from 'formik';
import { Field, FormikValues } from 'formik';

import { Button, Grid, GridItem } from '@patternfly/react-core';
import { MinusCircleIcon } from '@patternfly/react-icons/dist/esm/icons/minus-circle-icon';
import { PlusCircleIcon } from '@patternfly/react-icons/dist/esm/icons/plus-circle-icon';

import { getRandomID } from '~/common/helpers';
import { validateLabelKey, validateLabelValue } from '~/common/validators';
import { FieldId } from '~/components/clusters/wizards/common/constants';
import { useFormState } from '~/components/clusters/wizards/hooks';

import ButtonWithTooltip from '../../ButtonWithTooltip';

import FormKeyLabelKey from './FormKeyLabelKey';
import FormKeyLabelValue from './FormKeyLabelValue';

import './FormKeyValueList.scss';

const DEFAULT_ADD_BUTTON_DISABLED_TOOLTIP = 'Enter a key for each row before adding another.';
const KEY_WITHOUT_VALUE_TOOLTIP = 'Enter a value for each key before adding another row.';
const DEFAULT_KEY_INPUT_ARIA_LABEL = 'Key-value list key';

type KeyValueRow = { id?: string; key?: string; value?: string };

/**
 * Key/value rows for the array at `arrayFieldName` (Formik `FieldArray`).
 * Pass `push` and `remove` from `FieldArray` render props (or equivalent).
 * The list auto-normalizes `values[arrayFieldName]`: if it is missing, not an array,
 * or empty, the component seeds `[{ id }]`; rows missing `id` get one via `setFieldValue`.
 */
export interface FormKeyValueListProps extends Pick<ArrayHelpers, 'push' | 'remove'> {
  arrayFieldName?: string;
  keyColumnLabel?: string;
  valueColumnLabel?: string;
  addButtonLabel?: string;
  keyInputAriaLabel?: string;
  valueInputAriaLabel?: string;
  validateKey?: (
    key: string,
    allValues: Record<string, unknown>,
    props?: unknown,
    name?: string,
  ) => string | undefined;
  validateValue?: (
    value: string,
    allValues: Record<string, unknown>,
    props?: unknown,
    name?: string,
  ) => string | undefined;
  addButtonDisabledTooltip?: string;
  /** Shown when a row has a key but no value; add stays disabled until the value is filled. */
  addButtonKeyWithoutValueTooltip?: string;
  /**
   * When `false`, the add button stays disabled if any row has a non-empty key and an empty value
   * (in addition to `validateKey` / `validateValue`). Use for flows that require a full pair per row
   * (e.g. exclude-namespace selectors). When `true`, only validators gate adding a row—`validateLabelValue`
   * allows an empty value, so users can add another row while still filling values (e.g. optional node labels).
   * @default true
   */
  allowKeyWithoutValue?: boolean;
}

const FormKeyValueList = ({
  push,
  remove,
  arrayFieldName = FieldId.NodeLabels,
  keyColumnLabel = 'Key',
  valueColumnLabel = 'Value',
  addButtonLabel = 'Add additional label',
  keyInputAriaLabel = DEFAULT_KEY_INPUT_ARIA_LABEL,
  valueInputAriaLabel,
  validateKey = validateLabelKey,
  validateValue = validateLabelValue,
  addButtonDisabledTooltip = DEFAULT_ADD_BUTTON_DISABLED_TOOLTIP,
  addButtonKeyWithoutValueTooltip = KEY_WITHOUT_VALUE_TOOLTIP,
  allowKeyWithoutValue = true,
}: FormKeyValueListProps) => {
  const { values, setFieldValue, setFieldTouched, getFieldProps, getFieldMeta, validateForm } =
    useFormState();

  const fieldRows = (values as FormikValues)[arrayFieldName] as KeyValueRow[];
  const rows = Array.isArray(fieldRows) ? fieldRows : [];

  const hasInvalidKeys = (fieldsArray: KeyValueRow[]) =>
    !fieldsArray || fieldsArray.some((field) => !(field.key ?? '').trim());

  /** `validateLabelValue` allows empty string; pair completeness is still required before adding a row. */
  const hasKeyWithoutValue = (fieldsArray: KeyValueRow[]) =>
    fieldsArray.some((row) => !!(row.key ?? '').trim() && !(row.value ?? '').trim());

  /** Rows with any input must pass `validateKey` / `validateValue` (same as each `Field`) before another row can be added. */
  const firstContentValidationError = (fieldsArray: KeyValueRow[]): string | undefined => {
    for (let index = 0; index < fieldsArray.length; index += 1) {
      const row = fieldsArray[index];
      const hasKey = !!(row.key ?? '').trim();
      const hasValue = !!(row.value ?? '').trim();
      if (hasKey || hasValue) {
        const fieldNameLabelKey = `${arrayFieldName}[${index}].key`;
        const fieldNameLabelValue = `${arrayFieldName}[${index}].value`;
        const newRows = [...fieldsArray];
        const syntheticValues = { ...values, [arrayFieldName]: newRows } as FormikValues;

        const keyErr = validateKey(
          newRows[index]?.key ?? '',
          syntheticValues,
          undefined,
          fieldNameLabelKey,
        );
        if (keyErr) {
          return keyErr;
        }
        const valueErr = validateValue(
          newRows[index]?.value ?? '',
          syntheticValues,
          undefined,
          fieldNameLabelValue,
        );
        if (valueErr) {
          return valueErr;
        }
      }
    }
    return undefined;
  };

  useEffect(() => {
    if (!Array.isArray(fieldRows) || fieldRows.length === 0) {
      setFieldValue(arrayFieldName, [{ id: getRandomID() }], false);
    } else if (fieldRows.some((row) => !row?.id)) {
      setFieldValue(
        arrayFieldName,
        fieldRows.map((row) => (row?.id ? row : { ...row, id: getRandomID() })),
        false,
      );
    }
    validateForm();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fieldRows, setFieldValue, arrayFieldName]);

  return (
    <Grid hasGutter>
      <GridItem span={4} className="pf-v6-c-form__label pf-v6-c-form__label-text">
        {keyColumnLabel}
      </GridItem>
      <GridItem span={4} className="pf-v6-c-form__label pf-v6-c-form__label-text">
        {valueColumnLabel}
      </GridItem>
      <GridItem span={4} />
      {rows.map((label, index) => {
        const isRemoveDisabled = index === 0 && rows.length === 1;
        const fieldNameLabelKey = `${arrayFieldName}[${index}].key`;
        const fieldNameLabelValue = `${arrayFieldName}[${index}].value`;
        const rowKey = label.id ?? `${arrayFieldName}-row-${index}`;

        return (
          /* Prefer stable row id; index fallback only until useEffect backfills ids (avoids duplicate "undefined" keys). */
          <React.Fragment key={rowKey}>
            <GridItem span={4}>
              <Field
                name={fieldNameLabelKey}
                type="text"
                component={FormKeyLabelKey}
                index={index}
                keyInputAriaLabel={keyInputAriaLabel}
                validate={(value: string) => {
                  const newRows = [...rows];
                  newRows[index] = { ...newRows[index], key: value };
                  return validateKey(
                    value,
                    { ...values, [arrayFieldName]: newRows } as FormikValues,
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
                valueAriaLabel={valueInputAriaLabel}
                validate={(value: string) => {
                  const newRows = [...rows];
                  newRows[index] = { ...newRows[index], value };
                  return validateValue(
                    value,
                    { ...values, [arrayFieldName]: newRows } as FormikValues,
                    undefined,
                    fieldNameLabelValue,
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
          disableReason={
            (hasInvalidKeys(rows) && addButtonDisabledTooltip) ||
            firstContentValidationError(rows) ||
            (!allowKeyWithoutValue && hasKeyWithoutValue(rows) && addButtonKeyWithoutValueTooltip)
          }
        >
          {addButtonLabel}
        </ButtonWithTooltip>
      </GridItem>
    </Grid>
  );
};

export default FormKeyValueList;
