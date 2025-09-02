import React from 'react';
import { Formik } from 'formik';

import { render, screen } from '~/testUtils';

import { IdentityProvidersPageFormInitialValues } from './IdentityProvidersPageFormikHelpers';
import IDPForm from './IDPForm';

const defaultProps = {
  isEditForm: false,
  idpEdited: {},
  idpName: 'My GitHub IDP',
  clusterUrls: {
    console: 'https://console-openshift-console.apps.kim-rosa-4-21-1.k0pc.s1.devshift.org',
    api: 'https://api.kim-rosa-4-21-1.k0pc.s1.devshift.org:6443',
  },
  clearFields: undefined,
  idpTypeName: 'GitHub',
  formTitle: 'Add a GitHub identity provider',
  HTPasswdErrors: undefined,
  isHypershift: false,
  IDPList: [
    { type: 'HTPasswdIdentityProvider', name: 'myIDP1' },
    { type: 'HTPasswdIdentityProvider', name: 'myIDP2' },
  ],
  isPostIDPFormError: false,
  postIDPFormError: null,
  isPostIDPFormPending: false,
  selectedIPD: 'GithubIdentityProvider',
};

const buildTestComponent = (selectedIDP, children, onSubmit = jest.fn(), formValues = {}) => {
  const initialValues = IdentityProvidersPageFormInitialValues(selectedIDP);

  return (
    <Formik
      initialValues={{
        ...initialValues,
        ...formValues,
      }}
      onSubmit={onSubmit}
    >
      {children}
    </Formik>
  );
};

describe('IDPForm', () => {
  describe('GitHub', () => {
    const gitHubDefaultProps = {
      ...defaultProps,
      idpName: 'My GitHub IDP',
      idpTypeName: 'GitHub',
      formTitle: 'Add a GitHub identity provider',
      selectedIPD: 'GithubIdentityProvider',
    };
    it('displays the correct title and helper text', () => {
      render(
        buildTestComponent(gitHubDefaultProps.selectedIPD, <IDPForm {...gitHubDefaultProps} />),
      );

      expect(
        screen.getByRole('heading', { name: 'Add a GitHub identity provider' }),
      ).toBeInTheDocument();

      expect(
        screen.getByText(
          'identity provider to validate user names and passwords against GitHub or GitHub Enterprise’s OAuth authentication server',
          { exact: false },
        ),
      ).toBeInTheDocument();
    });

    it('displays correct fields', () => {
      render(
        buildTestComponent(gitHubDefaultProps.selectedIPD, <IDPForm {...gitHubDefaultProps} />),
      );

      // OAuth callback
      expect(screen.getByText('OAuth callback URL')).toBeInTheDocument();

      // Required fields =>  is GitHubForm.jsx loaded
      expect(screen.getByText('Hostname')).toBeInTheDocument();
      expect(screen.getByText('CA file')).toBeInTheDocument();
      expect(
        screen.getByText('Do you want to use GitHub organizations, or GitHub teams?'),
      ).toBeInTheDocument();

      // No Advanced options
    });

    it('displays mapping method if edit for', () => {
      const newGitHubProps = {
        ...gitHubDefaultProps,
        isEditForm: true,
        idpEdited: {
          mapping_method: 'myMappingMethod',
          github: { ca: '' },
        },
      };

      render(buildTestComponent(newGitHubProps.selectedIPD, <IDPForm {...newGitHubProps} />));

      expect(screen.getByText('Mapping method')).toBeInTheDocument();
    });
  });

  describe('LDAP', () => {
    const ldapDefaultProps = {
      ...defaultProps,
      idpName: 'My LDAP IDP',
      idpTypeName: 'LDAP',
      formTitle: 'Add an LDAP identity provider',
      selectedIDP: 'LDAPIdentityProvider',
    };
    it('displays the correct title and helper text', () => {
      render(buildTestComponent(ldapDefaultProps.selectedIDP, <IDPForm {...ldapDefaultProps} />));

      expect(
        screen.getByRole('heading', { name: 'Add an LDAP identity provider' }),
      ).toBeInTheDocument();

      expect(
        screen.getByText(
          'identity provider to validate user names and passwords against an LDAPv3 server',
          { exact: false },
        ),
      ).toBeInTheDocument();
    });

    it('displays correct fields', () => {
      render(buildTestComponent(ldapDefaultProps.selectedIPD, <IDPForm {...ldapDefaultProps} />));

      // No OAuth callback
      expect(screen.queryByText('OAuth callback URL')).not.toBeInTheDocument();

      // Required fields => is LDAPFormRequired.jsx load
      expect(screen.getByText('LDAP URL')).toBeInTheDocument();
      expect(screen.getByText('Bind DN')).toBeInTheDocument();
      expect(screen.getByText('Bind password')).toBeInTheDocument();

      // Advanced options => is LDAPForm.jsx loaded
      expect(screen.getByText('CA file')).toBeInTheDocument();
      expect(screen.getByText('Insecure')).toBeInTheDocument();
    });

    it('displays mapping method if edit for', () => {
      const newLDAPProps = {
        ...ldapDefaultProps,
        isEditForm: true,
        idpEdited: {
          mapping_method: 'myMappingMethod',
          ldap: { ca: '' },
        },
      };

      render(buildTestComponent(newLDAPProps.selectedIDP, <IDPForm {...newLDAPProps} />));

      expect(screen.getByText('Mapping method')).toBeInTheDocument();
    });
  });

  describe('GoogleIdentityProvider', () => {
    const googleDefaultProps = {
      ...defaultProps,
      idpName: 'My Google IDP',
      idpTypeName: 'GOOGLE',
      formTitle: 'Add a Google identity provider',
      selectedIDP: 'GoogleIdentityProvider',
    };
    it('displays the correct title and helper text', () => {
      render(
        buildTestComponent(googleDefaultProps.selectedIDP, <IDPForm {...googleDefaultProps} />),
      );

      expect(
        screen.getByRole('heading', { name: 'Add a Google identity provider' }),
      ).toBeInTheDocument();

      expect(
        screen.getByText('Google’s OpenID Connect integration', { exact: false }),
      ).toBeInTheDocument();
    });

    it('displays correct fields', () => {
      render(
        buildTestComponent(googleDefaultProps.selectedIPD, <IDPForm {...googleDefaultProps} />),
      );

      //  OAuth callback
      expect(screen.getByText('OAuth callback URL')).toBeInTheDocument();

      // Required fields => is GoogleFormRequired.jsx loaded
      expect(screen.getByText('Hosted domain')).toBeInTheDocument();

      // No Advanced options
    });

    it('displays mapping method if edit for', () => {
      const newGoogleProps = {
        ...googleDefaultProps,
        isEditForm: true,
        idpEdited: {
          mapping_method: 'myMappingMethod',
        },
      };

      render(buildTestComponent(newGoogleProps.selectedIDP, <IDPForm {...newGoogleProps} />));

      expect(screen.getByText('Mapping method')).toBeInTheDocument();
    });
  });

  describe('OpenIDIdentityProvider', () => {
    const openIdDefaultProps = {
      ...defaultProps,
      idpName: 'My OpenID IDP',
      idpTypeName: 'OPENID',
      formTitle: 'Add an OpenID identity provider',
      selectedIDP: 'OpenIDIdentityProvider',
    };
    it('displays the correct title and helper text', () => {
      render(
        buildTestComponent(openIdDefaultProps.selectedIDP, <IDPForm {...openIdDefaultProps} />),
      );

      expect(
        screen.getByRole('heading', { name: 'Add an OpenID identity provider' }),
      ).toBeInTheDocument();

      expect(
        screen.getByText('integrate with an OpenID Connect identity provider', { exact: false }),
      ).toBeInTheDocument();
    });

    it('displays correct fields', () => {
      render(
        buildTestComponent(openIdDefaultProps.selectedIPD, <IDPForm {...openIdDefaultProps} />),
      );

      // OAuth callback
      expect(screen.getByText('OAuth callback URL')).toBeInTheDocument();

      // Required fields => is OpenIDFormRequired.jsx loaded
      expect(screen.getByText('Issuer URL')).toBeInTheDocument();

      // Advanced options => is OpenIDForm.jsx loaded
      expect(screen.getByText('CA file')).toBeInTheDocument();
      expect(screen.getByText('Additional scopes')).toBeInTheDocument();
    });

    it('displays mapping method if edit for', () => {
      const newOpenIdProps = {
        ...openIdDefaultProps,
        isEditForm: true,
        idpEdited: {
          mapping_method: 'myMappingMethod',
          open_id: { ca: '' },
        },
      };

      render(buildTestComponent(newOpenIdProps.selectedIDP, <IDPForm {...newOpenIdProps} />));

      expect(screen.getByText('Mapping method')).toBeInTheDocument();
    });
  });

  describe('GitlabIdentityProvider', () => {
    const gitLabDefaultProps = {
      ...defaultProps,
      idpName: 'My GitLab IDP',
      idpTypeName: 'GITLAB',
      formTitle: 'Add a GitLab identity provider',
      selectedIDP: 'GitlabIdentityProvider',
    };
    it('displays the correct title and helper text', () => {
      render(
        buildTestComponent(gitLabDefaultProps.selectedIDP, <IDPForm {...gitLabDefaultProps} />),
      );

      expect(
        screen.getByRole('heading', { name: 'Add a GitLab identity provider' }),
      ).toBeInTheDocument();

      expect(
        screen.getByText('or any other GitLab instance as an identity provider', { exact: false }),
      ).toBeInTheDocument();
    });

    it('displays correct fields', () => {
      render(
        buildTestComponent(gitLabDefaultProps.selectedIPD, <IDPForm {...gitLabDefaultProps} />),
      );

      // OAuth callback
      expect(screen.getByText('OAuth callback URL')).toBeInTheDocument();

      // Required fields => is GitLabForm.jsx loaded
      expect(screen.getByText('URL')).toBeInTheDocument();
      expect(screen.getByText('CA file')).toBeInTheDocument();

      // No Advanced options
    });

    it('displays mapping method if edit for', () => {
      const newGitLabProps = {
        ...gitLabDefaultProps,
        isEditForm: true,
        idpEdited: {
          mapping_method: 'myMappingMethod',
          gitlab: { ca: '' },
        },
      };

      render(buildTestComponent(newGitLabProps.selectedIDP, <IDPForm {...newGitLabProps} />));

      expect(screen.getByText('Mapping method')).toBeInTheDocument();
    });
  });

  describe('HTPasswdIdentityProvider', () => {
    const htpasswdDefaultProps = {
      ...defaultProps,
      idpName: 'My htpasswd IDP',
      idpTypeName: 'HTPASSWD',
      formTitle: 'Add an HTPasswd identity provider',
      selectedIDP: 'HTPasswdIdentityProvider',
    };
    it('displays the correct title and helper text', () => {
      render(
        buildTestComponent(htpasswdDefaultProps.selectedIDP, <IDPForm {...htpasswdDefaultProps} />),
      );

      expect(
        screen.getByRole('heading', { name: 'Add an HTPasswd identity provider' }),
      ).toBeInTheDocument();

      expect(
        screen.getByText('create one or multiple static users that can log in to your cluster', {
          exact: false,
        }),
      ).toBeInTheDocument();
    });

    it('displays correct fields', () => {
      render(
        buildTestComponent(htpasswdDefaultProps.selectedIPD, <IDPForm {...htpasswdDefaultProps} />),
      );

      // No OAuth callback
      expect(screen.queryByText('OAuth callback URL')).not.toBeInTheDocument();

      // Required fields => is HtPasswdForm.jsx loaded
      expect(screen.getByText(/Users list/)).toBeInTheDocument();

      // No Advanced options
    });

    it('does not displays mapping method ', () => {
      const newHtpasswdProps = {
        ...htpasswdDefaultProps,
        isEditForm: true,
        idpEdited: {
          mapping_method: 'myMappingMethod',
        },
      };

      render(buildTestComponent(newHtpasswdProps.selectedIDP, <IDPForm {...newHtpasswdProps} />));

      expect(screen.queryByText('Mapping method')).not.toBeInTheDocument();
    });
  });

  it('displays error when duplicate name is entered', async () => {
    const { user } = render(
      buildTestComponent(defaultProps.formTitle, <IDPForm {...defaultProps} />),
    );

    const nameInput = screen.getByDisplayValue(defaultProps.idpTypeName);

    await user.clear(nameInput);

    expect(
      screen.queryByText(
        `The name "${defaultProps.IDPList[0].name}" is already taken. Identity provider names must not be duplicate.`,
      ),
    ).not.toBeInTheDocument();

    await user.type(nameInput, defaultProps.IDPList[0].name);
    await user.tab();

    expect(
      screen.getByText(
        `The name "${defaultProps.IDPList[0].name}" is already taken. Identity provider names must not be duplicate.`,
      ),
    ).toBeInTheDocument();
  });

  it('displays learn more link if not edit form', () => {
    const newProps = {
      ...defaultProps,
      isEditForm: false,
      idpName: 'GitHub',
    };

    render(buildTestComponent(newProps.formTitle, <IDPForm {...newProps} />));

    expect(
      screen.getByRole('link', {
        name: /Learn more about GitHub identity providers/,
        exact: false,
      }),
    ).toBeInTheDocument();
  });

  it('does not display learn more link if edit form', () => {
    const newProps = {
      ...defaultProps,
      isEditForm: true,
      idpName: 'GitHub',
      idpEdited: { github: { ca: 'my ca' } },
    };

    render(buildTestComponent(newProps.formTitle, <IDPForm {...newProps} />));

    expect(
      screen.queryByRole('link', {
        name: /Learn more about GitHub identity providers/,
        exact: false,
      }),
    ).not.toBeInTheDocument();
  });
});
