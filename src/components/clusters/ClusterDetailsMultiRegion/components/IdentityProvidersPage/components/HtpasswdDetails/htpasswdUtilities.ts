import { HtPasswdIdentityProvider } from '~/types/clusters_mgmt.v1';

export const isSingleUserHtpasswd = (htpasswd: HtPasswdIdentityProvider) => !!htpasswd?.username;

export const singleUserHtpasswdMessage =
  'Single user HTPasswd IDPs cannot be modified. Delete the IDP and recreate it as a multi user HTPasswd IDP.';
