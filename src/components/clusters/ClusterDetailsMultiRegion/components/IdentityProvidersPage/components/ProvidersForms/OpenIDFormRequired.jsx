import React from 'react';
import { Field } from 'formik';
import PropTypes from 'prop-types';

import { Alert, FormFieldGroup, FormSection, GridItem } from '@patternfly/react-core';

import { useFormState } from '~/components/clusters/wizards/hooks';
import { FormikFieldArray } from '~/components/common/FormikFormComponents/FormikFieldArray/FormikFieldArray';

import { checkOpenIDIssuer } from '../../../../../../../common/validators';
import ReduxVerticalFormGroup from '../../../../../../common/ReduxFormComponents_deprecated/ReduxVerticalFormGroup';
import { FieldId } from '../../constants';
import { hasAtLeastOneOpenIdClaimField } from '../IdentityProvidersPageFormikHelpers';

import IDPBasicFields from './IDPBasicFields';

const OpenIDFormRequired = ({ isPending = false }) => {
  const { getFieldProps, getFieldMeta, setFieldValue, values } = useFormState();

  return (
    <>
      <IDPBasicFields />
      <GridItem span={8}>
        <Field
          component={ReduxVerticalFormGroup}
          name={FieldId.ISSUER}
          label="Issuer URL"
          type="text"
          disabled={isPending}
          validate={checkOpenIDIssuer}
          input={{
            ...getFieldProps(FieldId.ISSUER),
            onChange: (_, value) => setFieldValue(FieldId.ISSUER, value),
          }}
          meta={getFieldMeta(FieldId.ISSUER)}
          isRequired
          helpText="The URL that the OpenID provider asserts as the issuer identifier. It must use the https scheme with no URL query parameters or fragment."
        />
      </GridItem>
      <FormSection title="Claim mappings *" titleElement="h2">
        {!hasAtLeastOneOpenIdClaimField(values) && (
          <Alert variant="danger" title="At least one claim field must be entered" />
        )}
        <FormFieldGroup>
          <FormikFieldArray
            fieldID={FieldId.OPENID_EMAIL}
            label="Email"
            type="text"
            placeHolderText="e.g. email"
            disabled={isPending}
            helpText="The list of attributes whose values should be used as the email address."
          />
          <FormikFieldArray
            fieldID={FieldId.OPENID_NAME}
            label="Name"
            type="text"
            placeHolderText="e.g. name"
            disabled={isPending}
            helpText="The end user's full name including all name parts, ordered according to the end user's locale and preferences."
          />
          <FormikFieldArray
            fieldID={FieldId.OPENID_PREFFERED_USERNAME}
            label="Preferred username"
            type="text"
            placeHolderText="e.g. preferred_username"
            disabled={isPending}
            helpText="Shorthand name by which the end user wishes to be referred to at the RP, such as janedone or j.doe."
          />
          <FormikFieldArray
            fieldID={FieldId.OPENID_CLAIM_GROUPS}
            label="Groups"
            type="text"
            placeHolderText="e.g. dev-ops-admins"
            disabled={isPending}
            helpText="List of custom group labels"
          />
        </FormFieldGroup>
      </FormSection>
    </>
  );
};

OpenIDFormRequired.propTypes = {
  isPending: PropTypes.bool,
};

export default OpenIDFormRequired;
