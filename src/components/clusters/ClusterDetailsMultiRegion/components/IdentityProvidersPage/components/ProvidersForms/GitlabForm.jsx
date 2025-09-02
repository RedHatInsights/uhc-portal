import React from 'react';
import { Field } from 'formik';
import PropTypes from 'prop-types';

import { GridItem } from '@patternfly/react-core';

import { useFormState } from '~/components/clusters/wizards/hooks';

import { required, validateUrlHttpsAndHttp } from '../../../../../../../common/validators';
import ReduxVerticalFormGroup from '../../../../../../common/ReduxFormComponents_deprecated/ReduxVerticalFormGroup';
import { FieldId } from '../../constants';
import CAUpload from '../CAUpload';

import IDPBasicFields from './IDPBasicFields';

const GitlabFormRequired = ({ isPending, isEditForm, idpEdited }) => {
  const { getFieldProps, getFieldMeta, setFieldValue, setFieldTouched } = useFormState();
  return (
    <>
      <IDPBasicFields />

      <GridItem span={8}>
        <Field
          component={ReduxVerticalFormGroup}
          name={FieldId.GITLAB_URL}
          meta={getFieldMeta(FieldId.GITLAB_URL)}
          input={{
            ...getFieldProps(FieldId.GITLAB_URL),
            onChange: (_, value) => setFieldValue(FieldId.GITLAB_URL, value),
          }}
          label="URL"
          type="text"
          validate={[required, validateUrlHttpsAndHttp]}
          isRequired
          disabled={isPending}
          helpText="The URL of your GitLab provider.This would be https://gitlab.com/ if you do not have hosted GitLab."
        />
      </GridItem>

      <GridItem span={8}>
        <Field
          component={CAUpload}
          name={FieldId.GITLAB_CA}
          meta={getFieldMeta(FieldId.GITLAB_CA)}
          input={{
            ...getFieldProps(FieldId.GITLAB_CA),
            onChange: (value) => {
              setFieldValue(FieldId.GITLAB_CA, value);
              setFieldTouched(FieldId.GITLAB_CA, true);
            },
          }}
          fieldName="gitlab_ca"
          label="CA file"
          type="text"
          disabled={isPending}
          helpText="PEM encoded certificate bundle to use to validate server certificates for the configured Gitlab URL."
          certValue={isEditForm ? idpEdited.gitlab.ca : ''}
        />
      </GridItem>
    </>
  );
};

GitlabFormRequired.propTypes = {
  isPending: PropTypes.bool,
  isEditForm: PropTypes.bool,
  idpEdited: PropTypes.object,
};

GitlabFormRequired.defaultProps = {
  isPending: false,
};

export default GitlabFormRequired;
