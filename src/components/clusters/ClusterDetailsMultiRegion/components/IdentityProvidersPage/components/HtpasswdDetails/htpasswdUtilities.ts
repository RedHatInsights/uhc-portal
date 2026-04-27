import { HtPasswdIdentityProvider } from '~/types/clusters_mgmt.v1';

export const isSingleUserHtpasswd = (htpasswd: HtPasswdIdentityProvider) => !!htpasswd?.username;

export const singleUserHtpasswdMessage =
  'Single user htpasswd IDPs cannot be modified. Delete the IDP and recreate it as a multi user htpasswd IDP.';
