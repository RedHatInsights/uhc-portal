import React from 'react';
import { Field } from 'formik';
import PropTypes from 'prop-types';

import { Divider, GridItem, Title } from '@patternfly/react-core';

import { useFormState } from '~/components/clusters/wizards/hooks';
import { FormikFieldArray } from '~/components/common/FormikFormComponents/FormikFieldArray/FormikFieldArray';

import { noop } from '../../../../../../../common/helpers';
import { required } from '../../../../../../../common/validators';
import RadioButtons from '../../../../../../common/ReduxFormComponents_deprecated/RadioButtons';
import ReduxVerticalFormGroup from '../../../../../../common/ReduxFormComponents_deprecated/ReduxVerticalFormGroup';
import { FieldId } from '../../constants';
import CAUpload from '../CAUpload';

import IDPBasicFields from './IDPBasicFields';

import './GithubForm.scss';

const GithubFormRequired = ({ isEditForm, idpEdited, isPending }) => {
  const [authMode, setAuthMode] = React.useState('organizations');
  const [hostnameRequired, setHostnameRequired] = React.useState(false);

  const { setFieldValue, getFieldProps, getFieldMeta, setFieldTouched } = useFormState();

  React.useEffect(() => {
    if (isEditForm) {
      if (idpEdited.github.ca) {
        setHostnameRequired(true);
      }
      setAuthMode(idpEdited.github.organizations ? 'organizations' : 'teams');
    } else {
      setAuthMode('organizations');
    }
    // Should run only once on mount and once on unmount
    // eslint-disable-next-line  react-hooks/exhaustive-deps
  }, []);

  const toggleHostnameRequired = (e, value) => {
    if (value && value.trim() !== '') {
      setHostnameRequired(true);
    } else {
      setHostnameRequired(false);
    }
  };

  return (
    <>
      <IDPBasicFields />
      <GridItem span={8}>
        <Field
          component={ReduxVerticalFormGroup}
          name={FieldId.HOSTNAME}
          label="Hostname"
          type="text"
          disabled={isPending}
          input={{
            ...getFieldProps(FieldId.HOSTNAME),
            onChange: (_, value) => setFieldValue(FieldId.HOSTNAME, value),
          }}
          meta={getFieldMeta(FieldId.HOSTNAME)}
          validate={hostnameRequired ? required : noop}
          isRequired={hostnameRequired}
          extendedHelpText="You can use the GitHub integration to connect to either GitHub or GitHub Enterprise. For
          GitHub Enterprise, you must provide the hostname of your instance and, optionally,
          provide a CA certificate bundle to use in requests to the server."
          helpText="Optional domain to use with a hosted instance of GitHub Enterprise."
        />
      </GridItem>
      <GridItem span={8}>
        <Field
          component={CAUpload}
          name={FieldId.GITHUB_CA}
          label="CA file"
          type="text"
          input={{
            // name, value, onBlur, onChange
            ...getFieldProps(FieldId.GITHUB_CA),
            onChange: (value) => {
              setFieldValue(FieldId.GITHUB_CA, value);
              setFieldTouched(FieldId.GITHUB_CA, true);
            },
          }}
          fieldName="github_ca"
          meta={getFieldMeta(FieldId.GITHUB_CA)}
          helpText="PEM encoded certificate bundle to use to validate server certificates for the configured GitHub Enterprise URL."
          isDisabled={isPending}
          onChange={(e, value) => toggleHostnameRequired(e, value)}
          certValue={isEditForm ? idpEdited.github.ca : ''}
        />
      </GridItem>

      <GridItem span={8}>
        <Divider />
        <Title headingLevel="h3" size="xl" className="pf-v6-u-mt-lg">
          Organizations or teams
        </Title>
        <p>
          Github authentication lets you use either GitHub organizations or GitHub teams to restrict
          access.
        </p>
        <p className="idp-github-auth-mode-selection-question">
          Do you want to use GitHub organizations, or GitHub teams?
        </p>
        <Field
          component={RadioButtons}
          name={FieldId.GITHUB_AUTH_MODE}
          defaultValue={authMode}
          input={{
            // name, value, onBlur, onChange
            ...getFieldProps(FieldId.GITHUB_AUTH_MODE),
            onChange: (value) => {
              setAuthMode(value);
              setFieldValue(FieldId.GITHUB_AUTH_MODE, value);
            },
          }}
          meta={getFieldMeta(FieldId.GITHUB_AUTH_MODE)}
          options={[
            { value: 'organizations', label: 'Use organizations' },
            { value: 'teams', label: 'Use teams' },
          ]}
        />
      </GridItem>
      {authMode === 'organizations' ? (
        <FormikFieldArray
          fieldID={FieldId.ORGANIZATIONS}
          label="Organizations"
          helpText="Only users that are members of at least one of the listed organizations will be allowed to log in."
          placeHolderText="e.g. org "
        />
      ) : (
        <FormikFieldArray
          fieldID={FieldId.TEAMS}
          label="Teams"
          helpText="Only users that are members of at least one of the listed teams will be allowed to log in. The format is <org>/<team>."
          placeHolderText="e.g. org/team "
        />
      )}
    </>
  );
};

GithubFormRequired.propTypes = {
  isPending: PropTypes.bool,
  isEditForm: PropTypes.bool,
  idpEdited: PropTypes.object,
};

GithubFormRequired.defaultProps = {
  isPending: false,
};

export default GithubFormRequired;
