/* eslint-disable camelcase */
// TODO: set the proper typing for the different fields
export type IDPFormDataType = {
  idpId?: any;
  type?: string;
  name?: any;
  client_id?: any;
  client_secret?: any;
  mappingMethod?: any;
  selectedIDP?: any;
  // gitlab
  gitlab_url?: any;
  gitlab_ca?: any;
  // openid
  issuer?: any;
  openid_name?: any;
  openid_email?: any;
  openid_preferred_username?: any;
  openid_claim_groups?: any;
  openid_extra_scopes?: any; // idpEdited[editedType].extra_scopes
  openid_ca?: any;
  // google
  hosted_domain?: any;
  // ldap
  ldap_id?: any;
  ldap_preferred_username?: any;
  ldap_name?: any;
  ldap_email?: any;
  ldap_url?: any;
  ldap_ca?: any;
  bind_dn?: any;
  bind_password?: any;
  ldap_insecure?: any;
  // github
  hostname?: any;
  teams?: any;
  organizations?: any;
  github_auth_mode?: any;
  github_ca?: any;
  users?: {
    username?: string;
    password?: string;
  }[];
};
