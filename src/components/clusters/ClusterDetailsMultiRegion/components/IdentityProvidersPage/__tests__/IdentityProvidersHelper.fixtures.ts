import { IdentityProvider, OpenIdClaims } from '~/types/clusters_mgmt.v1';

export const githubFormDataTeams = {
  idpId: 'id',
  name: 'name',
  github_ca: 'ca',
  github_auth_mode: 'teams',
  teams: [{ teams: 'a' }, { teams: 'b' }],
  organizations: [{ organizations: 'a' }, { organizations: 'b' }],
  hostname: 'hostname',
  client_id: 'client_id',
  client_secret: 'client_secret',
  bind_password: 'bind_password',
  type: 'GithubIdentityProvider',
};

export const githubTrimFormDataTeams = {
  idpId: 'id',
  name: 'name',
  github_ca: undefined,
  github_auth_mode: 'teams',
  teams: [{ teams: 'a' }, { teams: 'b' }],
  organizations: [{ organizations: 'a' }, { organizations: 'b' }],
  hostname: 'hostname',
  client_id: 'client_id',
  client_secret: 'client_secret',
  bind_password: 'bind_password',
  type: 'GithubIdentityProvider',
};

export const githubFormDataTeamsExpected = {
  github: {
    ca: 'ca',
    client_id: 'client_id',
    client_secret: 'client_secret',
    hostname: 'hostname',
    organizations: undefined,
    teams: [{ teams: 'a' }, { teams: 'b' }],
  },
  id: 'id',
  mapping_method: 'claim',
  type: 'GithubIdentityProvider',
};

export const githubTrimFormDataTeamsExpected = {
  github: {
    ca: undefined,
    client_id: 'client_id',
    client_secret: 'client_secret',
    hostname: 'hostname',
    organizations: undefined,
    teams: [{ teams: 'a' }, { teams: 'b' }],
  },
  id: 'id',
  mapping_method: 'claim',
  type: 'GithubIdentityProvider',
};

export const githubFormDataOrganizations = {
  idpId: 'id',
  name: 'name',
  github_ca: 'ca',
  github_auth_mode: 'organizations',
  teams: [{ teams: 'a' }, { teams: 'b' }],
  organizations: [{ organizations: 'a' }, { organizations: 'b' }],
  hostname: 'hostname',
  client_id: 'client_id',
  client_secret: 'client_secret',
  type: 'GithubIdentityProvider',
};

export const githubFormDataOrganizationsExpected = {
  github: {
    ca: 'ca',
    client_id: 'client_id',
    client_secret: 'client_secret',
    hostname: 'hostname',
    organizations: [{ organizations: 'a' }, { organizations: 'b' }],
    teams: undefined,
  },
  id: 'id',
  mapping_method: 'claim',
  type: 'GithubIdentityProvider',
};

export const googleFormData = {
  idpId: 'id',
  name: 'name',
  hosted_domain: 'hosted_domain',
  client_id: 'client_id',
  client_secret: 'client_secret',
  type: 'GoogleIdentityProvider',
};

export const googleFormDataExpected = {
  google: {
    client_id: 'client_id',
    hosted_domain: 'hosted_domain',
    client_secret: 'client_secret',
  },
  id: 'id',
  mapping_method: 'claim',
  type: 'GoogleIdentityProvider',
};

export const openIdFormData = {
  idpId: 'id',
  name: 'name',
  openid_ca: 'ca',
  openid_email: [{ openid_email: 'openid_emailA' }, { openid_email: 'openid_emailB' }],
  openid_name: [{ openid_name: 'openid_nameA' }, { openid_name: 'openid_nameB' }],
  openid_preferred_username: [
    { openid_preferred_username: 'openid_preferred_usernameA' },
    { openid_preferred_username: 'openid_preferred_usernameB' },
  ],
  openid_claim_groups: [
    { openid_claim_groups: 'openid_claim_groupsA' },
    { openid_claim_groups: 'openid_claim_groupsB' },
  ],
  openid_extra_scopes: 'openid_extra_scopes',
  issuer: 'issuer',
  hostname: 'hostname',
  client_id: 'client_id',
  client_secret: 'client_secret',
  type: 'OpenIDIdentityProvider',
};

export const openIdFormDataExpected = {
  id: 'id',
  mapping_method: 'claim',
  open_id: {
    ca: 'ca',
    claims: {
      email: [{ openid_email: 'openid_emailA' }, { openid_email: 'openid_emailB' }],
      name: [{ openid_name: 'openid_nameA' }, { openid_name: 'openid_nameB' }],
      preferred_username: [
        { openid_preferred_username: 'openid_preferred_usernameA' },
        { openid_preferred_username: 'openid_preferred_usernameB' },
      ],
      groups: [
        { openid_claim_groups: 'openid_claim_groupsA' },
        { openid_claim_groups: 'openid_claim_groupsB' },
      ],
    },
    client_id: 'client_id',
    client_secret: 'client_secret',
    extra_scopes: ['openid_extra_scopes'],
    issuer: 'issuer',
  },
  type: 'OpenIDIdentityProvider',
};

export const openIdTrimFormData = {
  idpId: 'id',
  name: 'name',
  openid_email: [{ openid_email: 'openid_emailA' }, { openid_email: 'openid_emailB' }],
  openid_name: [{ openid_name: 'openid_nameA' }, { openid_name: 'openid_nameB' }],
  openid_preferred_username: [
    { openid_preferred_username: 'openid_preferred_usernameA' },
    { openid_preferred_username: 'openid_preferred_usernameB' },
  ],
  openid_claim_groups: [
    { openid_claim_groups: 'openid_claim_groupsA' },
    { openid_claim_groups: 'openid_claim_groupsB' },
  ],
  openid_extra_scopes: 'openid_extra_scopes',
  issuer: 'issuer',
  hostname: 'hostname',
  client_id: 'client_id',
  client_secret: 'client_secret',
  type: 'OpenIDIdentityProvider',
};

export const openIdTrimFormDataExpected = {
  id: 'id',
  mapping_method: 'claim',
  open_id: {
    ca: undefined,
    claims: {
      email: [{ openid_email: 'openid_emailA' }, { openid_email: 'openid_emailB' }],
      name: [{ openid_name: 'openid_nameA' }, { openid_name: 'openid_nameB' }],
      preferred_username: [
        { openid_preferred_username: 'openid_preferred_usernameA' },
        { openid_preferred_username: 'openid_preferred_usernameB' },
      ],
      groups: [
        { openid_claim_groups: 'openid_claim_groupsA' },
        { openid_claim_groups: 'openid_claim_groupsB' },
      ],
    },
    client_id: 'client_id',
    client_secret: 'client_secret',
    extra_scopes: ['openid_extra_scopes'],
    issuer: 'issuer',
  },
  type: 'OpenIDIdentityProvider',
};

export const ldapFormData = {
  idpId: 'id',
  name: 'name',
  openid_ca: 'ca',
  ldap_id: [{ ldap_id: 'ldap_idA' }, { ldap_id: 'ldap_idB' }],
  ldap_email: [{ ldap_email: 'ldap_emailA' }, { ldap_email: 'ldap_emailB' }],
  ldap_name: [{ ldap_name: 'ldap_nameA' }, { ldap_name: 'ldap_nameB' }],
  ldap_nldap_preferred_usernameame: [
    { ldap_preferred_username: 'ldap_preferred_usernameA' },
    { ldap_preferred_username: 'ldap_preferred_usernameB' },
  ],
  bind_dn: 'bind_dn',
  bind_password: 'bind_password',
  ldap_insecure: 'ldap_insecure',
  ldap_url: 'ldap_url',
  ldap_ca: 'ldap_ca',
  openid_extra_scopes: 'openid_extra_scopes',
  issuer: 'issuer',
  hostname: 'hostname',
  client_id: 'client_id',
  client_secret: 'client_secret',
  type: 'LDAPIdentityProvider',
};

export const ldapFormDataExpected = {
  id: 'id',
  ldap: {
    attributes: {
      email: [{ ldap_email: 'ldap_emailA' }, { ldap_email: 'ldap_emailB' }],
      id: [{ ldap_id: 'ldap_idA' }, { ldap_id: 'ldap_idB' }],
      name: [{ ldap_name: 'ldap_nameA' }, { ldap_name: 'ldap_nameB' }],
      preferred_username: undefined,
    },
    bind_dn: 'bind_dn',
    bind_password: 'bind_password',
    ca: '',
    insecure: 'ldap_insecure',
    url: 'ldap_url',
  },
  mapping_method: 'claim',
  type: 'LDAPIdentityProvider',
};

export const gitlabFormData = {
  idpId: 'id',
  name: 'name',
  hosted_domain: 'hosted_domain',
  gitlab_url: 'gitlab_url',
  gitlab_ca: 'gitlab_ca',
  client_id: 'client_id',
  client_secret: 'client_secret',
  type: 'GitlabIdentityProvider',
};

export const gitlabFormDataExpected = {
  gitlab: {
    ca: 'gitlab_ca',
    client_id: 'client_id',
    client_secret: 'client_secret',
    url: 'gitlab_url',
  },
  id: 'id',
  mapping_method: 'claim',
  type: 'GitlabIdentityProvider',
};

export const gitlabTrimFormData = {
  idpId: 'id',
  name: 'name',
  hosted_domain: 'hosted_domain',
  gitlab_url: 'gitlab_url',
  client_id: 'client_id',
  client_secret: 'client_secret',
  type: 'GitlabIdentityProvider',
};

export const gitlabTrimFormDataExpected = {
  gitlab: {
    ca: undefined,
    client_id: 'client_id',
    client_secret: 'client_secret',
    url: 'gitlab_url',
  },
  id: 'id',
  mapping_method: 'claim',
  type: 'GitlabIdentityProvider',
};

export const htpassFormData = {
  idpId: 'id',
  name: 'name',
  hosted_domain: 'hosted_domain',
  gitlab_url: 'gitlab_url',
  gitlab_ca: 'gitlab_ca',
  client_id: 'client_id',
  client_secret: 'client_secret',
  users: [
    { username: 'usera', password: 'passa' },
    { username: 'userb', password: 'passb' },
  ],
  type: 'HTPasswdIdentityProvider',
};

export const htpassFormDataExpected = {
  htpasswd: {
    users: {
      items: [
        {
          password: 'passa',
          username: 'usera',
        },
        {
          password: 'passb',
          username: 'userb',
        },
      ],
    },
  },
  id: 'id',
  mapping_method: undefined,
  type: 'HTPasswdIdentityProvider',
};

export const htpassNoIdpFormData = {
  name: 'name',
  hosted_domain: 'hosted_domain',
  gitlab_url: 'gitlab_url',
  gitlab_ca: 'gitlab_ca',
  client_id: 'client_id',
  client_secret: 'client_secret',
  users: [
    { username: 'usera', password: 'passa' },
    { username: 'userb', password: 'passb' },
  ],
  type: 'HTPasswdIdentityProvider',
};

export const htpassNoIdpFormDataExpected = {
  htpasswd: {
    users: {
      items: [
        {
          password: 'passa',
          username: 'usera',
        },
        {
          password: 'passb',
          username: 'userb',
        },
      ],
    },
  },
  id: undefined,
  mapping_method: undefined,
  name: 'name',
  type: 'HTPasswdIdentityProvider',
};

export const clientSecretFormData = {
  idpId: 'id',
  name: 'name',
  github_ca: 'ca',
  github_auth_mode: 'teams',
  hostname: 'hostname',
  client_id: 'client_id',
  client_secret: 'CLIENT_SECRET',
  type: 'GithubIdentityProvider',
};

export const clientSecretFormDataExpected = {
  github: {
    ca: 'ca',
    client_id: 'client_id',
    hostname: 'hostname',
    organizations: undefined,
    teams: undefined,
  },
  id: 'id',
  mapping_method: 'claim',
  type: 'GithubIdentityProvider',
};

export const bindPassFormData = {
  idpId: 'id',
  name: 'name',
  openid_ca: 'ca',
  ldap_id: [{ ldap_id: 'ldap_idA' }, { ldap_id: 'ldap_idB' }],
  ldap_email: [{ ldap_email: 'ldap_emailA' }, { ldap_email: 'ldap_emailB' }],
  ldap_name: [{ ldap_name: 'ldap_nameA' }, { ldap_name: 'ldap_nameB' }],
  ldap_nldap_preferred_usernameame: [
    { ldap_preferred_username: 'ldap_preferred_usernameA' },
    { ldap_preferred_username: 'ldap_preferred_usernameB' },
  ],
  bind_dn: 'bind_dn',
  bind_password: 'BIND_PASSWORD',
  ldap_insecure: 'ldap_insecure',
  ldap_url: 'ldap_url',
  ldap_ca: 'ldap_ca',
  openid_extra_scopes: 'openid_extra_scopes',
  issuer: 'issuer',
  hostname: 'hostname',
  client_id: 'client_id',
  client_secret: 'client_secret',
  type: 'LDAPIdentityProvider',
};

export const bindPassFormDataExpected = {
  id: 'id',
  ldap: {
    attributes: {
      email: [{ ldap_email: 'ldap_emailA' }, { ldap_email: 'ldap_emailB' }],
      id: [{ ldap_id: 'ldap_idA' }, { ldap_id: 'ldap_idB' }],
      name: [{ ldap_name: 'ldap_nameA' }, { ldap_name: 'ldap_nameB' }],
      preferred_username: undefined,
    },
    bind_dn: 'bind_dn',
    ca: '',
    insecure: 'ldap_insecure',
    url: 'ldap_url',
  },
  mapping_method: 'claim',
  type: 'LDAPIdentityProvider',
};

export const claims: OpenIdClaims = {
  name: ['openIDName 1', 'openIDName 2'],
  email: ['openIDEmail 1', 'openIDEmail 2'],
  preferred_username: ['openIDUserName 1', 'openIDUserName 2'],
};

export const nameClaimsExpected = [
  { id: 0, openid_name: 'openIDName 1' },
  { id: 1, openid_name: 'openIDName 2' },
];

export const emailClaimsExpected = [
  { id: 0, openid_email: 'openIDEmail 1' },
  { id: 1, openid_email: 'openIDEmail 2' },
];

export const preferredUsernameClaimsExpected = [
  {
    id: 0,
    openid_preferred_username: 'openIDUserName 1',
  },
  {
    id: 1,
    openid_preferred_username: 'openIDUserName 2',
  },
];

export const nameLdapAttributesExpected = [
  { id: 0, ldap_name: 'openIDName 1' },
  { id: 1, ldap_name: 'openIDName 2' },
];

export const emailLdapAttributesExpected = [
  { id: 0, ldap_email: 'openIDEmail 1' },
  { id: 1, ldap_email: 'openIDEmail 2' },
];

export const preferredUsernameLdapAttributesExpected = [
  {
    id: 0,
    ldap_preferred_username: 'openIDUserName 1',
  },
  {
    id: 1,
    ldap_preferred_username: 'openIDUserName 2',
  },
];

export const idLdapAttributesExpected = [
  { id: 0, ldap_id: { index: 'id index 1', openIDUserName: 'id 1' } },
  { id: 1, ldap_id: { index: 'id index 2', openIDUserName: 'id 2' } },
];

export const gitHubTeamsAndOrgsData = {
  teams: ['team a', 'team b'],
  organizations: ['organization a', 'organization b'],
};

export const gitHubOnlyOrgsData = {
  organizations: ['organization a', 'organization b'],
};

export const gitHubTeamsAndOrgsDataExpected = [{ teams: 'team a' }, { teams: 'team b' }];

export const gitHubOnlyOrgsDataExpected = [
  { organizations: 'organization a' },
  { organizations: 'organization b' },
];

export const providersFixtures: IdentityProvider[] = [
  {
    kind: 'IdentityProvider',
    type: 'OpenIDIdentityProvider',
    href: '/api/clusters_mgmt/v1/clusters/2aa67thu6mdpv0ujtdt71p8ie6jes8ol/identity_providers/2aa97tco0e00oqiuu12a4cv5v4h8hdu2',
    id: '2aa97tco0e00oqiuu12a4cv5v4h8hdu2',
    name: 'OpenID',
    mapping_method: 'claim',
    open_id: {
      ca: '-----BEGIN CERTIFICATE-----\ntesttesttesttesttesttesttesttesttesttesttesttest\ntesttesttesttesttesttesttesttesttesttesttesttest\ntesttesttesttesttesttesttesttesttesttesttesttest\n-----END CERTIFICATE-----',
      claims: {
        email: ['email1'],
        name: ['name 1'],
        preferred_username: ['test122'],
        groups: ['group1'],
      },
      client_id: 'test',
      issuer: 'https://example.com',
    },
  } as IdentityProvider,
  {
    kind: 'IdentityProvider',
    type: 'GitlabIdentityProvider',
    href: '/api/clusters_mgmt/v1/clusters/2aa67thu6mdpv0ujtdt71p8ie6jes8ol/identity_providers/2aa991al599m3o48udp3qarolp5hi1q7',
    id: '2aa991al599m3o48udp3qarolp5hi1q7',
    name: 'GitLab',
    mapping_method: 'claim',
    gitlab: {
      ca: '-----BEGIN CERTIFICATE-----\ntesttesttesttesttesttesttesttesttesttesttesttest\ntesttesttesttesttesttesttesttesttesttesttesttest\ntesttesttesttesttesttesttesttesttesttesttesttest\n-----END CERTIFICATE-----',
      client_id: 'rewar',
      url: 'https://gitlab.com/',
    },
  } as IdentityProvider,
  {
    kind: 'IdentityProvider',
    type: 'GoogleIdentityProvider',
    href: '/api/clusters_mgmt/v1/clusters/2aa67thu6mdpv0ujtdt71p8ie6jes8ol/identity_providers/2aaau4rpcgnc08qea4fscfvrp5g1ichd',
    id: '2aaau4rpcgnc08qea4fscfvrp5g1ichd',
    name: 'Google',
    mapping_method: 'claim',
    google: {
      client_id: 'test',
      hosted_domain: 'test',
    },
  } as IdentityProvider,
  {
    kind: 'IdentityProvider',
    type: 'GithubIdentityProvider',
    href: '/api/clusters_mgmt/v1/clusters/2aa67thu6mdpv0ujtdt71p8ie6jes8ol/identity_providers/2aaatta5nt517krk31ftcgu1697iqf9n',
    id: '2aaatta5nt517krk31ftcgu1697iqf9n',
    name: 'GitHub',
    mapping_method: 'claim',
    github: {
      ca: '-----BEGIN CERTIFICATE-----\ntesttesttesttesttesttesttesttesttesttesttesttest\ntesttesttesttesttesttesttesttesttesttesttesttest\ntesttesttesttesttesttesttesttesttesttesttesttest\n-----END CERTIFICATE-----',
      client_id: 'test',
      hostname: 'test',
      organizations: ['org1'],
    },
  } as IdentityProvider,
  {
    kind: 'IdentityProvider',
    type: 'LDAPIdentityProvider',
    href: '/api/clusters_mgmt/v1/clusters/2aa67thu6mdpv0ujtdt71p8ie6jes8ol/identity_providers/2aa828nuogqdntjaglps8u9r2pqv9bs6',
    id: '2aa828nuogqdntjaglps8u9r2pqv9bs6',
    name: 'LDAP',
    mapping_method: 'claim',
    ldap: {
      attributes: {
        id: ['dn'],
        name: ['cn'],
        preferred_username: ['uid'],
      },
      ca: '-----BEGIN CERTIFICATE-----\ntesttesttesttesttesttesttesttesttesttesttesttest\ntesttesttesttesttesttesttesttesttesttesttesttest\ntesttesttesttesttesttesttesttesttesttesttesttest\n-----END CERTIFICATE-----',
      insecure: false,
      url: 'ldap://test.com',
    },
  } as IdentityProvider,
];

export const providersExpectedFormData = [
  {
    client_id: 'test',
    client_secret: 'CLIENT_SECRET',
    idpId: '2aa97tco0e00oqiuu12a4cv5v4h8hdu2',
    issuer: 'https://example.com',
    mappingMethod: 'claim',
    name: 'OpenID',
    openid_ca:
      '-----BEGIN CERTIFICATE-----\ntesttesttesttesttesttesttesttesttesttesttesttest\ntesttesttesttesttesttesttesttesttesttesttesttest\ntesttesttesttesttesttesttesttesttesttesttesttest\n-----END CERTIFICATE-----',
    openid_email: ['email1'],
    openid_extra_scopes: '',
    openid_name: ['name 1'],
    openid_preferred_username: ['test122'],
    openid_claim_groups: ['group1'],
    selectedIDP: 'OpenIDIdentityProvider',
    type: 'OpenIDIdentityProvider',
  },
  {
    client_id: 'rewar',
    client_secret: 'CLIENT_SECRET',
    gitlab_url: 'https://gitlab.com/',
    gitlab_ca:
      '-----BEGIN CERTIFICATE-----\ntesttesttesttesttesttesttesttesttesttesttesttest\ntesttesttesttesttesttesttesttesttesttesttesttest\ntesttesttesttesttesttesttesttesttesttesttesttest\n-----END CERTIFICATE-----',
    idpId: '2aa991al599m3o48udp3qarolp5hi1q7',
    mappingMethod: 'claim',
    name: 'GitLab',
    selectedIDP: 'GitlabIdentityProvider',
    type: 'GitlabIdentityProvider',
  },
  {
    client_id: 'test',
    client_secret: 'CLIENT_SECRET',
    hosted_domain: 'test',
    idpId: '2aaau4rpcgnc08qea4fscfvrp5g1ichd',
    mappingMethod: 'claim',
    name: 'Google',
    selectedIDP: 'GoogleIdentityProvider',
    type: 'GoogleIdentityProvider',
  },
  {
    client_id: 'test',
    client_secret: 'CLIENT_SECRET',
    github_ca:
      '-----BEGIN CERTIFICATE-----\ntesttesttesttesttesttesttesttesttesttesttesttest\ntesttesttesttesttesttesttesttesttesttesttesttest\ntesttesttesttesttesttesttesttesttesttesttesttest\n-----END CERTIFICATE-----',
    hostname: 'test',
    idpId: '2aaatta5nt517krk31ftcgu1697iqf9n',
    mappingMethod: 'claim',
    name: 'GitHub',
    organizations: ['org1'],
    selectedIDP: 'GithubIdentityProvider',
    teams: [''],
    type: 'GithubIdentityProvider',
  },
  {
    bind_dn: undefined,
    bind_password: '',
    client_secret: 'CLIENT_SECRET',
    idpId: '2aa828nuogqdntjaglps8u9r2pqv9bs6',
    ldap_ca:
      '-----BEGIN CERTIFICATE-----\ntesttesttesttesttesttesttesttesttesttesttesttest\ntesttesttesttesttesttesttesttesttesttesttesttest\ntesttesttesttesttesttesttesttesttesttesttesttest\n-----END CERTIFICATE-----',
    ldap_email: [''],
    ldap_id: ['dn'],
    ldap_insecure: false,
    ldap_name: ['cn'],
    ldap_preferred_username: ['uid'],
    ldap_url: 'ldap://test.com',
    mappingMethod: 'claim',
    name: 'LDAP',
    selectedIDP: 'LDAPIdentityProvider',
    type: 'LDAPIdentityProvider',
  },
];
