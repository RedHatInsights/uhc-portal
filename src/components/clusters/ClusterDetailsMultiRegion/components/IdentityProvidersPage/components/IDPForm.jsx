import React from 'react';
import { Field } from 'formik';
import PropTypes from 'prop-types';

import {
  ClipboardCopy,
  ExpandableSection,
  Form,
  Grid,
  GridItem,
  Title,
} from '@patternfly/react-core';

import { useFormState } from '~/components/clusters/wizards/hooks';

import links from '../../../../../../common/installLinks.mjs';
import { checkIdentityProviderName, composeValidators } from '../../../../../../common/validators';
import ErrorBox from '../../../../../common/ErrorBox';
import ExternalLink from '../../../../../common/ExternalLink';
import {
  ReduxSelectDropdown,
  ReduxVerticalFormGroup,
} from '../../../../../common/ReduxFormComponents_deprecated';
import { FieldId } from '../constants';
import {
  generateIDPName,
  getOauthCallbackURL,
  IDPformValues,
  IDPNeedsOAuthURL,
  mappingMethods,
  mappingMethodsformValues,
} from '../IdentityProvidersHelper';

import {
  GithubForm,
  GitlabForm,
  GoogleFormRequired,
  HTPasswdForm,
  LDAPForm,
  LDAPFormRequired,
  OpenIDForm,
  OpenIDFormRequired,
} from './ProvidersForms';

const IDPForm = ({
  selectedIDP,
  isEditForm,
  idpEdited,
  idpName,
  clusterUrls,
  clearFields,
  idpTypeName,
  formTitle,
  HTPasswdErrors,
  isHypershift,
  IDPList,
  isPostIDPFormError,
  postIDPFormError,
  isPostIDPFormPending,
}) => {
  const [IDPName, setIDPName] = React.useState('');
  const [isExpanded, setIsExpanded] = React.useState(false);

  const { setFieldValue, getFieldProps, getFieldMeta, values } = useFormState();
  const selectedIdpName = values[FieldId.NAME];
  const selectedMappingMethod = values[FieldId.MAPPING_METHOD];

  const checkIfExpandable = (selectedIDP, idpEdited) => {
    if (selectedIDP === IDPformValues.OPENID) {
      if (idpEdited.open_id.openid_extra_scopes !== '' || idpEdited.open_id.openid_ca !== '') {
        return idpEdited.open_id.openid_extra_scopes !== '' || idpEdited.open_id.openid_ca !== '';
      }
    } else if (selectedIDP === IDPformValues.LDAP) {
      if (idpEdited.ldap.ldap_ca !== '' || idpEdited.ldap.ldap_insecure !== '') {
        return idpEdited.ldap.ldap_ca !== '' || idpEdited.ldap.ldap_insecure !== '';
      }
    }
    return false;
  };

  React.useEffect(() => {
    setIDPName(selectedIdpName);
    if (isEditForm) {
      setIsExpanded(checkIfExpandable(selectedIDP, idpEdited));
    }
    // eslint-disable-next-line  react-hooks/exhaustive-deps
  }, [isExpanded, isEditForm, selectedIdpName, selectedIDP, idpEdited]);

  React.useEffect(() => {
    if (!isEditForm) {
      const generatedName = generateIDPName(selectedIDP, IDPList);
      if (generatedName !== IDPName) {
        // eslint-disable-next-line react/no-did-update-set-state
        setFieldValue(FieldId.NAME, generatedName);
        setIDPName(generatedName);
      }
    }
    // eslint-disable-next-line  react-hooks/exhaustive-deps
  }, [selectedIDP, idpName, IDPList, isEditForm, setFieldValue]);

  const checkDuplicateName = (IDPName) => {
    const idpNameList = IDPList.map((idp) => idp.name);
    if (idpNameList.includes(IDPName) && !isEditForm) {
      return `The name "${IDPName}" is already taken. Identity provider names must not be duplicate.`;
    }
    return undefined;
  };

  const updateIsExpanded = () => setIsExpanded(!isExpanded);

  let submissionError;

  if (isPostIDPFormError) {
    submissionError = (
      <ErrorBox
        title={`Error ${isEditForm ? 'updating' : 'creating'} Identity Provider`}
        response={postIDPFormError.error}
      />
    );
  }

  const providersAdvancedOptions = {
    OpenIDIdentityProvider: OpenIDForm,
    LDAPIdentityProvider: LDAPForm,
  };

  const providersRequiredFields = {
    LDAPIdentityProvider: LDAPFormRequired,
    OpenIDIdentityProvider: OpenIDFormRequired,
    GithubIdentityProvider: GithubForm,
    GoogleIdentityProvider: GoogleFormRequired,
    GitlabIdentityProvider: GitlabForm,
    HTPasswdIdentityProvider: HTPasswdForm,
  };

  const providerDocumentationLink = {
    LDAPIdentityProvider: links.IDP_LDAP,
    OpenIDIdentityProvider: links.IDP_OPENID,
    GithubIdentityProvider: links.IDP_GITHUB,
    GoogleIdentityProvider: links.IDP_GOOGLE,
    GitlabIdentityProvider: links.IDP_GITLAB,
    HTPasswdIdentityProvider: links.IDP_HTPASSWD,
  };

  const SelectedProviderRequiredFields = providersRequiredFields[selectedIDP];
  const SelectedProviderAdvancedOptions = providersAdvancedOptions[selectedIDP];

  const span = selectedIDP === IDPformValues.HTPASSWD ? 11 : 8;

  const topText = (idp) => {
    let text = null;
    switch (idp) {
      case IDPformValues.HTPASSWD:
        text = (
          <>
            Define an <code>htpasswd</code> identity provider for your managed cluster to create one
            or multiple static users that can log in to your cluster and troubleshoot it. If these
            users need elevated permissions, add it to an{' '}
            <ExternalLink href={links.OSD_DEDICATED_ADMIN_ROLE}>administrative group</ExternalLink>{' '}
            within your organization.
          </>
        );
        break;
      case IDPformValues.OPENID:
        text = (
          <>
            Configure an <code>oidc</code> identity provider to integrate with an OpenID Connect
            identity provider using an{' '}
            <ExternalLink href="http://openid.net/specs/openid-connect-core-1_0.html#CodeFlowAuth">
              Authorization Code Flow
            </ExternalLink>
            .
          </>
        );
        break;
      case IDPformValues.LDAP:
        text = (
          <>
            Configure the <code>ldap</code> identity provider to validate user names and passwords
            against an LDAPv3 server, using simple bind authentication.
          </>
        );
        break;
      case IDPformValues.GITHUB:
        text = (
          <>
            Configure a <code>github</code> identity provider to validate user names and passwords
            against GitHub or GitHub Enterprise’s OAuth authentication server.
          </>
        );
        break;
      case IDPformValues.GITLAB:
        text = (
          <>
            Configure a <code>gitlab</code> identity provider to use{' '}
            <ExternalLink href="https://gitlab.com/">GitLab.com</ExternalLink> or any other GitLab
            instance as an identity provider.
          </>
        );
        break;
      case IDPformValues.GOOGLE:
        text = (
          <>
            Configure a <code>google</code> identity provider using{' '}
            <ExternalLink href="https://developers.google.com/identity/protocols/OpenIDConnect">
              Google’s OpenID Connect integration
            </ExternalLink>
            .
          </>
        );
        break;
      default:
        return null;
    }
    return <GridItem span={span + 1}>{text}</GridItem>;
  };

  return (
    <Form>
      <Grid id="identity-provider-form" hasGutter>
        <GridItem span={span}>
          <Title headingLevel="h3" size="xl">
            {formTitle}
          </Title>
        </GridItem>
        {submissionError && <GridItem span={8}>{submissionError}</GridItem>}
        {topText(selectedIDP)}
        {!isEditForm && (
          <GridItem span={span}>
            <ExternalLink href={providerDocumentationLink[selectedIDP]}>
              Learn more about {idpTypeName} identity providers
            </ExternalLink>
          </GridItem>
        )}
        <GridItem span={span}>
          <Field
            component={ReduxVerticalFormGroup}
            name={FieldId.NAME}
            label="Name"
            type="text"
            input={{
              ...getFieldProps(FieldId.NAME),
              onChange: (_, value) => {
                setFieldValue(FieldId.NAME, value);
              },
              onBlur: (event) => {
                const { onBlur } = getFieldProps(FieldId.NAME);
                onBlur(event);
              },
            }}
            meta={getFieldMeta(FieldId.NAME)}
            validate={composeValidators(checkIdentityProviderName, checkDuplicateName)}
            isRequired
            disabled={isPostIDPFormPending || isEditForm}
            helpText="Unique name for the identity provider. This cannot be changed later."
          />
        </GridItem>
        {IDPNeedsOAuthURL(selectedIDP) && (
          <GridItem span={span}>
            <div>
              <span className="pf-v6-c-form__label pf-v6-c-form__label-text pf-v6-u-mb-sm">
                OAuth callback URL
              </span>
              <ClipboardCopy isReadOnly>
                {getOauthCallbackURL(clusterUrls, IDPName, isHypershift)}
              </ClipboardCopy>
            </div>
          </GridItem>
        )}
        {selectedIDP !== IDPformValues.HTPASSWD && (
          <GridItem span={span}>
            <Field
              component={ReduxSelectDropdown}
              options={mappingMethods}
              name={FieldId.MAPPING_METHOD}
              label="Mapping method"
              input={{
                ...getFieldProps(FieldId.MAPPING_METHOD),
                onChange: (value) => setFieldValue(FieldId.MAPPING_METHOD, value),
              }}
              meta={getFieldMeta(FieldId.MAPPING_METHOD)}
              helpText="Specifies how new identities are mapped to users when they log in. Claim is recommended in most cases."
              value={idpEdited.mapping_method}
            />
          </GridItem>
        )}
        {SelectedProviderRequiredFields && (
          <SelectedProviderRequiredFields
            isPending={isPostIDPFormPending}
            // make google required form optional when mapping method is lookup
            isRequired={
              selectedIDP === IDPformValues.GOOGLE &&
              !(selectedMappingMethod === mappingMethodsformValues.LOOKUP)
            }
            isEditForm={isEditForm}
            idpEdited={idpEdited}
            clearFields={clearFields}
            HTPasswdErrors={HTPasswdErrors}
          />
        )}
        {SelectedProviderAdvancedOptions && (
          <GridItem span={span}>
            <ExpandableSection
              toggleTextCollapsed="Show advanced options"
              toggleTextExpanded="Hide advanced options"
              isExpanded={isExpanded}
              onToggle={updateIsExpanded}
            >
              <SelectedProviderAdvancedOptions
                isPending={isPostIDPFormPending}
                isEditForm={isEditForm}
                idpEdited={idpEdited}
              />
            </ExpandableSection>
          </GridItem>
        )}
      </Grid>
    </Form>
  );
};

IDPForm.propTypes = {
  isPostIDPFormPending: PropTypes.bool,
  isPostIDPFormError: PropTypes.bool,
  postIDPFormError: PropTypes.object,
  clusterUrls: PropTypes.shape({
    console: PropTypes.string,
    api: PropTypes.string,
  }).isRequired,
  selectedIDP: PropTypes.string,
  clearFields: PropTypes.func.isRequired,
  IDPList: PropTypes.array.isRequired,
  isEditForm: PropTypes.bool,
  isHypershift: PropTypes.bool,
  idpEdited: PropTypes.object,
  idpName: PropTypes.string,
  HTPasswdErrors: PropTypes.func.isRequired,
  idpTypeName: PropTypes.string,
  formTitle: PropTypes.string,
};

IDPForm.defaultProps = {
  selectedIDP: 'GithubIdentityProvider',
};

export default IDPForm;
