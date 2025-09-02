import React from 'react';
import { Field } from 'formik';
import PropTypes from 'prop-types';

import { GridItem } from '@patternfly/react-core';

import { useFormState } from '~/components/clusters/wizards/hooks';

import ReduxVerticalFormGroup from '../../../../../../common/ReduxFormComponents_deprecated/ReduxVerticalFormGroup';
import { FieldId } from '../../constants';
import CAUpload from '../CAUpload';

function OpenIDForm({ isPending, isEditForm, idpEdited }) {
  const { getFieldProps, getFieldMeta, setFieldValue, setFieldTouched } = useFormState();

  return (
    <>
      <GridItem span={8}>
        <Field
          component={CAUpload}
          name={FieldId.OPENID_CA}
          label="CA file"
          helpText="PEM encoded certificate bundle to use to validate server certificates for the configured URL"
          isDisabled={isPending}
          W
          certValue={isEditForm ? idpEdited.open_id.ca : ''}
          input={{
            ...getFieldProps(FieldId.OPENID_CA),
            onChange: (value) => {
              setFieldValue(FieldId.OPENID_CA, value);
              setFieldTouched(FieldId.OPENID_CA, true);
            },
          }}
          fieldName="openid_ca"
          meta={getFieldMeta(FieldId.OPENID_CA)}
        />
      </GridItem>
      <GridItem span={8}>
        <Field
          component={ReduxVerticalFormGroup}
          name={FieldId.OPENID_EXTRA_SCOPES}
          label="Additional scopes"
          type="text"
          placeholder="e.g. scope1, scope2"
          disabled={isPending}
          input={{
            ...getFieldProps(FieldId.OPENID_EXTRA_SCOPES),
            onChange: (_, value) => setFieldValue(FieldId.OPENID_EXTRA_SCOPES, value),
          }}
          meta={getFieldMeta(FieldId.OPENID_EXTRA_SCOPES)}
        />
      </GridItem>
    </>
  );
}

OpenIDForm.propTypes = {
  isPending: PropTypes.bool,
  isEditForm: PropTypes.bool,
  idpEdited: PropTypes.object,
};

OpenIDForm.defaultProps = {
  isPending: false,
};

export default OpenIDForm;
