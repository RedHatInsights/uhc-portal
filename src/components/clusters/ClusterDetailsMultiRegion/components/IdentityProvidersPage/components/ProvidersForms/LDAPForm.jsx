import React from 'react';
import { Field } from 'formik';
import PropTypes from 'prop-types';

import { GridItem } from '@patternfly/react-core';

import { useFormState } from '~/components/clusters/wizards/hooks';

import { ReduxCheckbox } from '../../../../../../common/ReduxFormComponents_deprecated';
import { FieldId } from '../../constants';
import CAUpload from '../CAUpload';

const LDAPForm = ({ isEditForm, idpEdited, isPending }) => {
  const [isInsecure, setIsInsecure] = React.useState(false);
  const [caDisabledHelpText, setCaDisabledHelpText] = React.useState('');

  const { getFieldProps, getFieldMeta, setFieldValue, setFieldTouched } = useFormState();

  React.useEffect(() => {
    setIsInsecure(isEditForm ? idpEdited.ldap.insecure : false);
    setCaDisabledHelpText('');
    // Should run only once on mount and once on unmount
    // eslint-disable-next-line  react-hooks/exhaustive-deps
  }, []);

  const toggleCADisabled = (e, value) => {
    if (value) {
      setIsInsecure(true);
      setCaDisabledHelpText('Cannot be used if insecure is set.');
    } else {
      setIsInsecure(false);
      setCaDisabledHelpText('');
    }
  };

  return (
    <>
      <GridItem span={8}>
        <Field
          component={CAUpload}
          name={FieldId.LDAP_CA}
          meta={getFieldMeta(FieldId.LDAP_CA)}
          input={{
            ...getFieldProps(FieldId.LDAP_CA),
            onChange: (value) => {
              setFieldValue(FieldId.LDAP_CA, value);
              setFieldTouched(FieldId.LDAP_CA, true);
            },
          }}
          fieldName="ldap_ca"
          label="CA file"
          helpText={`PEM encoded certificate bundle to use to validate server certificates for the configured URL. ${caDisabledHelpText}`}
          isDisabled={isInsecure || isPending}
          certValue={isEditForm && !isInsecure ? idpEdited.ldap.ca : ''}
        />
      </GridItem>
      <GridItem span={8}>
        <Field
          component={ReduxCheckbox}
          name={FieldId.LDAP_INSECURE}
          meta={getFieldMeta(FieldId.LDAP_INSECURE)}
          input={{
            ...getFieldProps(FieldId.LDAP_INSECURE),
            onChange: (event, value) => {
              setFieldValue(FieldId.LDAP_INSECURE, value);
              setFieldTouched(FieldId.LDAP_INSECURE, true);
              toggleCADisabled(event, value);
            },
          }}
          label="Insecure"
          isDisabled={isPending}
        />
      </GridItem>
    </>
  );
};

LDAPForm.propTypes = {
  isPending: PropTypes.bool,
  isEditForm: PropTypes.bool,
  idpEdited: PropTypes.object,
};

LDAPForm.defaultProps = {
  isPending: false,
};

export default LDAPForm;
