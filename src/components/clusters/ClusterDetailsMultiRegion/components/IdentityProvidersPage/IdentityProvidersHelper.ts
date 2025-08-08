/* eslint-disable camelcase */
import isEmpty from 'lodash/isEmpty';

import {
  GithubIdentityProvider,
  IdentityProvider,
  LdapAttributes,
  OpenIdClaims,
} from '~/types/clusters_mgmt.v1';

import { strToCleanArray } from '../../../../../common/helpers';

import { GitHubTeamsAndOrgsDataType } from './model/GitHubTeamsAndOrgsDataType';
import { IDPFormDataType } from './model/IDPFormDataType';
import { LdapAttributesType } from './model/LdapAttributesType';
import { OpenIdClaimsType } from './model/OpenIdClaimsType';

const IDPformValues = {
  GITHUB: 'GithubIdentityProvider',
  GOOGLE: 'GoogleIdentityProvider',
  OPENID: 'OpenIDIdentityProvider',
  LDAP: 'LDAPIdentityProvider',
  GITLAB: 'GitlabIdentityProvider',
  HTPASSWD: 'HTPasswdIdentityProvider',
};

const mappingMethodsformValues = {
  CLAIM: 'claim',
  LOOKUP: 'lookup',
  GENERATE: 'generate',
  ADD: 'add',
};

const IDPTypeNames = {
  [IDPformValues.GITHUB]: 'GitHub',
  [IDPformValues.GOOGLE]: 'Google',
  [IDPformValues.OPENID]: 'OpenID',
  [IDPformValues.LDAP]: 'LDAP',
  [IDPformValues.GITLAB]: 'GitLab',
  [IDPformValues.HTPASSWD]: 'htpasswd',
};

const singularFormIDP = {
  [IDPformValues.GITHUB]: 'a GitHub',
  [IDPformValues.GOOGLE]: 'a Google',
  [IDPformValues.OPENID]: 'an OpenID',
  [IDPformValues.LDAP]: 'an LDAP',
  [IDPformValues.GITLAB]: 'a GitLab',
  [IDPformValues.HTPASSWD]: 'an HTPasswd',
};

const IDPObjectNames: { [p: string]: keyof IdentityProvider } = {
  [IDPformValues.GITHUB]: 'github',
  [IDPformValues.GOOGLE]: 'google',
  [IDPformValues.OPENID]: 'open_id',
  [IDPformValues.LDAP]: 'ldap',
  [IDPformValues.GITLAB]: 'gitlab',
  [IDPformValues.HTPASSWD]: 'htpasswd',
};

const mappingMethods = [
  {
    name: mappingMethodsformValues.CLAIM,
    value: mappingMethodsformValues.CLAIM,
  },
  {
    name: mappingMethodsformValues.LOOKUP,
    value: mappingMethodsformValues.LOOKUP,
  },
  {
    name: mappingMethodsformValues.GENERATE,
    value: mappingMethodsformValues.GENERATE,
  },
  {
    name: mappingMethodsformValues.ADD,
    value: mappingMethodsformValues.ADD,
  },
];

const idpOauthNeedsPort = (IDPName: string) => IDPName === IDPTypeNames[IDPformValues.OPENID];

/**
 * getOauthCallbackURL returns the OAuth callback URL for a given cluster base URL and IDP Name.
 * Format for non-Hypershift clusters:
 *  - General case: https://oauth-openshift.<console_url>/oauth2callback/<idp_name>
 * Format for Hypershift clusters:
 *  - General case: https://oauth.<api_url_without_port>/oauth2callback/<idp_name>
 *  - OpenID: https://oauth.<api_url_including_port>/oauth2callback/<idp_name>
 *
 * @param {Object} clusterUrls an object containing the console and API URLs
 * @param {String} IDPName an IDP name.
 * @param {Boolean} isHypershift indicates if it's a Hypershift cluster
 * @returns {String} The OAuth callback URL for this IDP.
 */
const getOauthCallbackURL = (
  clusterUrls: { api: string; console: string },
  IDPName: string,
  isHypershift: boolean,
) => {
  const clusterOauthBaseURL = isHypershift ? clusterUrls.api : clusterUrls.console;
  if (!IDPName || !clusterOauthBaseURL) {
    return '';
  }
  const URLWithSlash = clusterOauthBaseURL.endsWith('/')
    ? clusterOauthBaseURL
    : `${clusterOauthBaseURL}/`;

  const URLParts = URLWithSlash.split('.');
  URLParts[0] = `https://oauth${isHypershift ? '' : '-openshift'}`;

  if (isHypershift && !idpOauthNeedsPort(IDPName)) {
    const lastPart = URLParts[URLParts.length - 1];
    if (lastPart.indexOf(':') !== -1) {
      // eslint-disable-next-line prefer-destructuring
      URLParts[URLParts.length - 1] = `${lastPart.split(':')[0]}/`;
    }
  }

  return `${URLParts.join('.')}oauth2callback/${IDPName}`;
};

/**
 * Does this IDP needs an OAuth callback URL? Currernly only LDAP doesn't, but the helper function
 * is here to make us future proof. If we introduce another IDP that doesn't need the callback URL,
 * this function will need to be modified to account for it.
 * @param {String} IDPType the identity provider type
 */
const IDPNeedsOAuthURL = (IDPType?: string) =>
  ![IDPformValues.LDAP, IDPformValues.HTPASSWD].includes(IDPType ?? '');

/**
 * Generate a usable IDP name, based on the IDP Type and already-configured IDPs.
 * It'll default to the IDP type name, and add numbers if there's already one configured
 * until it finds an unused name. If you have GitHub, GitHub-1 and GitHub-3,
 * the function should pick GitHub-2.
 *
 * @param {String} IDPType An IDP Type name as defined in IDPTypeNames
 * @param {Array<Object>} IDPList An array of IDP objects returned from the server
 */
const generateIDPName = (IDPType: string, IDPList: IdentityProvider[]) => {
  const idpNameList = IDPList.map((idp) => idp.name);
  let idpNumber = 0;

  const baseName = IDPTypeNames[IDPType];
  if (!idpNameList.includes(baseName)) {
    return baseName;
  }

  let idpName = `${baseName}-${idpNumber + 1}`;
  while (idpNameList.includes(idpName)) {
    idpNumber += 1;
    idpName = `${baseName}-${idpNumber + 1}`;
  }
  return idpName;
};

const getldapca = (formData: IDPFormDataType) => {
  if (formData.ldap_ca) {
    return !formData.ldap_insecure ? formData.ldap_ca.trim() : '';
  }
  return formData.ldap_ca;
};

const getCreateIDPRequestData = (formData: IDPFormDataType) => {
  const githubData = () => ({
    client_id: formData.client_id.trim(),
    client_secret: formData.client_secret.trim(),
    organizations:
      formData.github_auth_mode === 'organizations' ? formData.organizations : undefined,
    teams: formData.github_auth_mode === 'teams' ? formData.teams : undefined,
    hostname: formData.hostname,
    ca: formData.github_ca ? formData.github_ca.trim() : formData.github_ca,
  });

  const googleData = () => ({
    client_id: formData.client_id.trim(),
    client_secret: formData.client_secret.trim(),
    hosted_domain: formData.hosted_domain,
  });

  const ldapData = () => ({
    attributes: {
      id: formData.ldap_id,
      email: formData.ldap_email,
      name: formData.ldap_name,
      preferred_username: formData.ldap_preferred_username,
    },
    bind_dn: formData.bind_dn,
    bind_password: formData.bind_password,
    insecure: formData.ldap_insecure,
    url: formData.ldap_url,
    ca: getldapca(formData),
  });

  const gitlabData = () => ({
    client_id: formData.client_id.trim(),
    client_secret: formData.client_secret.trim(),
    url: formData.gitlab_url,
    ca: formData.gitlab_ca ? formData.gitlab_ca.trim() : formData.gitlab_ca,
  });

  const openIdData = () => ({
    ca: formData.openid_ca ? formData.openid_ca.trim() : formData.openid_ca,
    claims: {
      email: formData.openid_email,
      name: formData.openid_name,
      preferred_username: formData.openid_preferred_username,
      groups: formData.openid_claim_groups,
    },
    client_id: formData.client_id.trim(),
    client_secret: formData.client_secret.trim(),
    extra_scopes: strToCleanArray(formData.openid_extra_scopes),
    issuer: formData.issuer,
  });

  const htpasswdData = () => ({
    users: {
      items: formData.users?.map((user) => ({
        username: user.username,
        password: user.password,
      })),
    },
  });

  const IDPs: { [key: string]: { name: string; data: (...args: any) => any } } = {
    GithubIdentityProvider: { name: 'github', data: githubData },
    GoogleIdentityProvider: { name: 'google', data: googleData },
    OpenIDIdentityProvider: { name: 'open_id', data: openIdData },
    LDAPIdentityProvider: { name: 'ldap', data: ldapData },
    GitlabIdentityProvider: { name: 'gitlab', data: gitlabData },
    HTPasswdIdentityProvider: { name: 'htpasswd', data: htpasswdData },
  };

  const basicData = {
    type: formData.type,
    name: formData.name,
    id: formData.idpId,
    mapping_method: undefined,
  };

  const selectedIDPData = IDPs[formData.type!!].data();
  const selectedIDPName = IDPs[formData.type!!].name;

  if (selectedIDPName !== 'htpasswd') {
    basicData.mapping_method = formData.mappingMethod || mappingMethodsformValues.CLAIM;
  }

  if (formData.idpId && formData.idpId !== '') {
    delete basicData.name;
    if (selectedIDPData.client_secret === 'CLIENT_SECRET') {
      delete selectedIDPData.client_secret;
    }
    if (selectedIDPData.bind_password && selectedIDPData.bind_password === 'BIND_PASSWORD') {
      delete selectedIDPData.bind_password;
    }
  }

  const requestData = {
    ...basicData,
    [selectedIDPName]: { ...selectedIDPData },
  };
  return requestData;
};

const getOpenIdClaims = (
  claims: OpenIdClaims | undefined,
  type: keyof OpenIdClaims,
): OpenIdClaimsType[] => {
  const claimsToIterate = claims?.[type];
  if (claimsToIterate?.length) {
    switch (type) {
      case 'name':
        return claimsToIterate.map((openid_name, id: number) => ({
          id,
          openid_name,
        }));
      case 'email':
        return claimsToIterate.map((openid_email, id: number) => ({
          id,
          openid_email,
        }));
      case 'preferred_username':
        return claimsToIterate.map((openid_preferred_username, id: number) => ({
          id,
          openid_preferred_username,
        }));
      case 'groups':
        return claimsToIterate.map((openid_claim_groups, id: number) => ({
          id,
          openid_claim_groups,
        }));
      default: {
        break;
      }
    }
  }

  return [];
};

const getldapAttributes = (
  attributes: LdapAttributes,
  type: keyof LdapAttributes,
): LdapAttributesType[] => {
  const attributeType = attributes ? attributes[type] : undefined;
  if (attributeType) {
    switch (type) {
      case 'name':
        return attributeType.map((ldap_name, id: number) => ({
          id,
          ldap_name,
        }));
      case 'email':
        return attributeType.map((ldap_email, id: number) => ({
          id,
          ldap_email,
        }));
      case 'preferred_username':
        return attributeType.map((ldap_preferred_username, id: number) => ({
          id,
          ldap_preferred_username,
        }));
      case 'id':
        return attributeType.map((ldap_id, id: number) => ({
          id,
          ldap_id,
        }));
      default:
        break;
    }
  }
  return [];
};

const getGitHubTeamsAndOrgsData = (idP: GithubIdentityProvider): GitHubTeamsAndOrgsDataType[] => {
  if (idP.teams) {
    return idP.teams.map((teams, id) => ({
      teams,
    }));
  }
  if (idP.organizations) {
    return idP.organizations.map((organizations, id) => ({
      organizations,
    }));
  }

  return [];
};

/**
 * Returns `true` if the provided array of `ReduxFieldArray` values has only empty values,
 * false otherwise.
 * @param {Array} arr array of `ReduxFieldArray` values
 * @param {String} key Field name of the `ReduxFieldArray`
 */

const isEmptyReduxArray = (arr: any, key: string) =>
  arr
    ? arr.map((currentValue: any) => isEmpty(currentValue[key])).every((item: any) => item)
    : false;

type IDPTypeKeys = keyof typeof IDPObjectNames;
type IDPTypeValues = (typeof IDPObjectNames)[IDPTypeKeys];
const CLIENT_SECRET = 'CLIENT_SECRET'; // Predefined value

/**
 * Utility function to prepare IDP edit form initial values.
 * @param idpEdited the identity provider being edited
 * @param editedType the type of identity provider
 */
const getInitialValuesForEditing = (idpEdited: IdentityProvider, editedType: IDPTypeValues) => {
  if (!editedType) {
    return {};
  }
  const baseValues = {
    idpId: idpEdited.id,
    type: idpEdited.type,
    name: idpEdited.name,
    client_secret: CLIENT_SECRET,
    mappingMethod: idpEdited.mapping_method,
    selectedIDP: idpEdited.type,
  };

  switch (editedType) {
    case 'gitlab':
      return {
        ...baseValues,
        gitlab_ca: idpEdited[editedType]?.ca,
        gitlab_url: idpEdited[editedType]?.url,
        client_id: idpEdited[editedType]?.client_id,
      };
    case 'open_id':
      return {
        ...baseValues,
        issuer: idpEdited[editedType]?.issuer,
        openid_name: idpEdited[editedType]?.claims?.name,
        openid_email: idpEdited[editedType]?.claims?.email,
        openid_preferred_username: idpEdited[editedType]?.claims?.preferred_username,
        openid_claim_groups: idpEdited[editedType]?.claims?.groups,
        openid_extra_scopes: idpEdited[editedType]?.extra_scopes
          ? idpEdited[editedType]?.extra_scopes?.join()
          : '',
        openid_ca: idpEdited[editedType]?.ca,
        client_id: idpEdited[editedType]?.client_id,
      };
    case 'google':
      return {
        ...baseValues,
        hosted_domain: idpEdited[editedType]?.hosted_domain,
        client_id: idpEdited[editedType]?.client_id,
      };
    case 'ldap':
      return {
        ...baseValues,
        ldap_id: idpEdited[editedType]?.attributes?.id ?? [''],
        ldap_preferred_username: idpEdited[editedType]?.attributes?.preferred_username ?? [''],
        ldap_name: idpEdited[editedType]?.attributes?.name ?? [''],
        ldap_email: idpEdited[editedType]?.attributes?.email ?? [''],
        ldap_url: idpEdited[editedType]?.url,
        bind_dn: idpEdited[editedType]?.bind_dn,
        bind_password: idpEdited[editedType]?.bind_dn ? 'BIND_PASSWORD' : '',
        ldap_ca: idpEdited[editedType]?.ca,
        ldap_insecure: idpEdited[editedType]?.insecure,
      };
    case 'github':
      return {
        ...baseValues,
        hostname: idpEdited[editedType]?.hostname,
        teams: idpEdited[editedType]?.teams ?? [''],
        organizations: idpEdited[editedType]?.organizations ?? [''],
        github_ca: idpEdited[editedType]?.ca,
        client_id: idpEdited[editedType]?.client_id,
      };
    default:
      break;
  }

  return baseValues;
};

export {
  getCreateIDPRequestData,
  getOauthCallbackURL,
  IDPNeedsOAuthURL,
  IDPTypeNames,
  singularFormIDP,
  mappingMethods,
  IDPformValues,
  mappingMethodsformValues,
  generateIDPName,
  IDPObjectNames,
  getldapAttributes,
  getOpenIdClaims,
  getGitHubTeamsAndOrgsData,
  isEmptyReduxArray,
  getldapca,
  getInitialValuesForEditing,
};
