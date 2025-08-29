import React from 'react';
import { Field, FieldArray } from 'formik';
import { pullAt } from 'lodash';
import { PropTypes } from 'prop-types';

import { Button, GridItem } from '@patternfly/react-core';
import { MinusCircleIcon, PlusCircleIcon } from '@patternfly/react-icons/dist/esm/icons';

import { FieldId } from '~/components/clusters/ClusterDetailsMultiRegion/components/IdentityProvidersPage/constants';
import { useFormState } from '~/components/clusters/wizards/hooks';

import ButtonWithTooltip from '../../ButtonWithTooltip';
import { ReduxVerticalFormGroup } from '../../ReduxFormComponents_deprecated';

import './CompoundFieldArray.scss';

export const LabelGridItem = ({ fieldSpan, label, isRequired, helpText }) => (
  <GridItem className="field-array-title" span={fieldSpan}>
    <p className="pf-v6-c-form__label-text" id="field-array-label">
      {label}
      {isRequired ? <span className="pf-v6-c-form__label-required">*</span> : null}
    </p>
    {helpText ? (
      <p className="pf-v6-c-form__helper-text" id="field-array-help-text">
        {helpText}
      </p>
    ) : null}
  </GridItem>
);

LabelGridItem.propTypes = {
  fieldSpan: PropTypes.number.isRequired,
  label: PropTypes.string,
  isRequired: PropTypes.bool,
  helpText: PropTypes.string,
};

const AddMoreButtonGridItem = ({
  addNewField,
  areFieldsFilled,
  title = 'Add more',
  label,
  addMoreButtonDisabled = false,
}) => {
  const isDisabled =
    !areFieldsFilled?.length || areFieldsFilled?.includes(false) || addMoreButtonDisabled;

  return (
    <GridItem className="field-grid-item">
      <Button
        label={label}
        onClick={addNewField}
        icon={<PlusCircleIcon />}
        variant="link"
        isDisabled={isDisabled}
      >
        {title}
      </Button>
    </GridItem>
  );
};

AddMoreButtonGridItem.propTypes = {
  addNewField: PropTypes.func.isRequired,
  areFieldsFilled: PropTypes.arrayOf(PropTypes.bool).isRequired,
  title: PropTypes.string,
  addMoreButtonDisabled: PropTypes.bool,
  label: PropTypes.string,
};

const MinusButtonGridItem = ({ index, fields, onClick, minusButtonDisabledMessage }) => {
  const isOnlyItem = index === 0 && fields.length === 1;
  const disableReason = minusButtonDisabledMessage || 'To delete the item, add another item first.';
  return (
    <GridItem data-testid="remove-users" className="field-grid-item minus-button" span={1}>
      <ButtonWithTooltip
        disableReason={isOnlyItem && disableReason}
        tooltipProps={{ position: 'right', distance: 0 }}
        onClick={onClick}
        icon={<MinusCircleIcon />}
        variant="link"
        aria-label="Remove"
        className="compound-field-array__minus-button"
      />
    </GridItem>
  );
};

MinusButtonGridItem.propTypes = {
  index: PropTypes.number.isRequired,
  fields: PropTypes.array.isRequired,
  onClick: PropTypes.func.isRequired,
  minusButtonDisabledMessage: PropTypes.string,
};

const FieldArrayErrorGridItem = ({ isLast, errorMessage, touched, isGroupError }) => {
  if (errorMessage && isLast && (touched || isGroupError)) {
    return (
      <GridItem className="field-grid-item pf-v6-c-form__helper-text pf-m-error">
        {errorMessage}
      </GridItem>
    );
  }
  return null;
};

FieldArrayErrorGridItem.propTypes = {
  isLast: PropTypes.bool.isRequired,
  errorMessage: PropTypes.string,
  touched: PropTypes.bool,
  isGroupError: PropTypes.bool,
};

const FieldGridItemComponent = (props) => {
  const { index, fieldSpan, compoundFields, disabled, onFieldChange } = props;
  const compoundFieldSpan = Math.max(Math.floor(fieldSpan / compoundFields.length), 1);
  const { getFieldProps, getFieldMeta, setFieldValue, values } = useFormState();

  React.useEffect(() => {
    setFieldValue(FieldId.USERS, values.users);
  }, [values, setFieldValue]);

  return (
    <>
      <GridItem className="field-grid-item" span={compoundFieldSpan}>
        <Field
          component={ReduxVerticalFormGroup}
          {...compoundFields[0]}
          id={`users.${index}.username`}
          name={`users.${index}.username`}
          type="text"
          disabled={disabled || compoundFields[0]?.disabled}
          input={{
            ...getFieldProps(`users.${index}.username`),
            onChange: (_, value) => {
              onFieldChange(_, value, index, `users.${index}.username`);
              setFieldValue(`users.${index}.username`, value);
            },
            onBlur: (event) => {
              const { onBlur } = getFieldProps(`users.${index}.username`);
              onBlur(event);
            },
          }}
          meta={getFieldMeta(`users.${index}.username`)}
          placeholder={
            compoundFields[0].getPlaceholderText
              ? compoundFields[0].getPlaceholderText(index)
              : undefined
          }
          helpText={
            compoundFields[0].helpText ||
            (compoundFields[0].getHelpText && compoundFields[0].getHelpText(index)) ||
            undefined
          }
        />
      </GridItem>
      <GridItem className="field-grid-item" span={compoundFieldSpan}>
        <Field
          component={ReduxVerticalFormGroup}
          {...compoundFields[1]}
          id={`users.${index}.password`}
          name={`users.${index}.password`}
          type="password"
          disabled={disabled}
          input={{
            ...getFieldProps(`users.${index}.password`),
            onChange: (_, value) => {
              onFieldChange(_, value, index, `users.${index}.password`);
              setFieldValue(`users.${index}.password`, value);
            },
            onBlur: (event) => {
              const { onBlur } = getFieldProps(`users.${index}.password`);
              onBlur(event);
            },
          }}
          meta={getFieldMeta(`users.${index}.password`)}
          placeholder={
            compoundFields[1].getPlaceholderText
              ? compoundFields[1].getPlaceholderText(index)
              : undefined
          }
          helpText={
            compoundFields[1].helpText ||
            (compoundFields[1].getHelpText && compoundFields[1].getHelpText(index)) ||
            undefined
          }
        />
      </GridItem>
      <GridItem className="field-grid-item" span={compoundFieldSpan}>
        <Field
          component={ReduxVerticalFormGroup}
          {...compoundFields[2]}
          id={`users.${index}.password-confirm`}
          name={`users.${index}.password-confirm`}
          type="password"
          disabled={disabled}
          input={{
            ...getFieldProps(`users.${index}.password-confirm`),
            onChange: (_, value) => {
              onFieldChange(_, value, index, `users.${index}.password-confirm`);
              setFieldValue(`users.${index}.password-confirm`, value);
            },
            onBlur: (event) => {
              const { onBlur } = getFieldProps(`users.${index}.password-confirm`);
              onBlur(event);
            },
          }}
          meta={getFieldMeta(`users.${index}.password-confirm`)}
          placeholder={
            compoundFields[2].getPlaceholderText
              ? compoundFields[2].getPlaceholderText(index)
              : undefined
          }
          helpText={
            compoundFields[2].helpText ||
            (compoundFields[2].getHelpText && compoundFields[2].getHelpText(index)) ||
            undefined
          }
          formGroupClass="confirm-password-field"
        />
      </GridItem>
    </>
  );
};

FieldGridItemComponent.propTypes = {
  compoundFields: PropTypes.array.isRequired,
  index: PropTypes.number,
  fieldSpan: PropTypes.number,
  disabled: PropTypes.bool,
  onFieldChange: PropTypes.func,
  setTouched: PropTypes.func,
};

export const CompoundFieldArray = (props) => {
  const {
    label,
    isRequired,
    helpText,
    fieldSpan,
    addMoreTitle,
    compoundFields,
    addMoreButtonDisabled,
    minusButtonDisabledMessage,
    isGroupError,
    onlySingleItem,
  } = props;
  const [areFieldsFilled, setAreFieldsFilled] = React.useState([]);
  const [touched, setTouched] = React.useState(false);

  const {
    setFieldTouched,
    getFieldMeta,
    values: { [FieldId.USERS]: usersData },
  } = useFormState();

  const addNewField = (insert) => {
    insert(0, { username: '', password: '', 'password-confirm': '' });
    setAreFieldsFilled((areFieldsFilled) => {
      const newFilledStatus = [false, ...areFieldsFilled];
      return newFilledStatus;
    });
  };

  React.useEffect(
    () => {
      if (usersData?.length === 0) {
        addNewField();
      } else {
        setAreFieldsFilled(usersData?.map((field) => !!field));
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [usersData],
  );

  const onFieldChange = (e, value, index, fieldName) => {
    setFieldTouched(fieldName, true);
    setAreFieldsFilled((areFieldsFilled) => {
      const newFilledStatus = [...areFieldsFilled];
      newFilledStatus[index] = !!value;
      return newFilledStatus;
    });
  };

  const removeField = (index, remove) => {
    remove(index);
    setAreFieldsFilled((areFieldsFilled) => {
      const newFilledStatus = [...areFieldsFilled];
      pullAt(newFilledStatus, index);
      return newFilledStatus;
    });
  };

  return (
    <FieldArray
      name={FieldId.USERS}
      render={({ remove, insert }) => (
        <>
          {onlySingleItem ? null : (
            <>
              <LabelGridItem
                fieldSpan={fieldSpan}
                label={`${label} (${usersData?.length})`}
                isRequired={isRequired}
                helpText={helpText}
              />
              <AddMoreButtonGridItem
                addNewField={() => addNewField(insert)}
                areFieldsFilled={areFieldsFilled}
                label={addMoreTitle}
                title={addMoreTitle}
                addMoreButtonDisabled={addMoreButtonDisabled}
              />
            </>
          )}

          {usersData?.map((_, index) => (
            <React.Fragment key={`${usersData[index]}`}>
              <FieldGridItemComponent
                compoundFields={compoundFields}
                item={`${usersData[index]}`}
                index={index}
                onFieldChange={onFieldChange}
                setTouched={setTouched}
                fieldSpan={fieldSpan}
                {...props}
              />
              {onlySingleItem ? null : (
                <MinusButtonGridItem
                  index={index}
                  fields={usersData}
                  onClick={() => removeField(index, remove)}
                  minusButtonDisabledMessage={minusButtonDisabledMessage}
                />
              )}
              <FieldArrayErrorGridItem
                isLast={index === usersData.length - 1}
                errorMessage={getFieldMeta('users').error}
                touched={touched}
                isGroupError={isGroupError}
              />
            </React.Fragment>
          ))}
        </>
      )}
    />
  );
};

CompoundFieldArray.propTypes = {
  label: PropTypes.string,
  isRequired: PropTypes.bool,
  helpText: PropTypes.string,
  fieldSpan: PropTypes.number,
  addMoreTitle: PropTypes.string,
  compoundFields: PropTypes.array,
  addMoreButtonDisabled: PropTypes.bool,
  minusButtonDisabledMessage: PropTypes.string,
  isGroupError: PropTypes.bool,
  onlySingleItem: PropTypes.bool,
};
