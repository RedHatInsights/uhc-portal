export const MACHINE_CIDR_DEFAULT = '10.0.0.0/16';
export const SERVICE_CIDR_DEFAULT = '172.30.0.0/16';
export const POD_CIDR_DEFAULT = '10.128.0.0/14';
export const HOST_PREFIX_DEFAULT = '/23';

/** Default OVN-Kubernetes internal subnets for ROSA HCP (OpenShift ≥ 4.18). */
export const JOIN_SUBNET_DEFAULT = '100.64.0.0/16';
export const TRANSIT_SUBNET_DEFAULT = '100.88.0.0/16';
/** OCP ≥ 4.17 new-install default (was 169.254.169.0/29 before 4.17). */
export const MASQUERADE_SUBNET_DEFAULT = '169.254.0.0/17';
export const HTTP_PROXY_PLACEHOLDER = 'http://<user>:<password>@<ipaddr>:<port>';
export const HTTPS_PROXY_PLACEHOLDER = 'http(s)://<user>:<password>@<ipaddr>:<port>';
export const TRUST_BUNDLE_PLACEHOLDER = `-----BEGIN CERTIFICATE-----
<MY_TRUSTED_CA_CERT>
-----END CERTIFICATE-----`;
export const TRUST_BUNDLE_HELPER_TEXT =
  "An additional trust bundle is a PEM encoded X.509 certificate bundle that will be added to the nodes' trusted certificate store.";
export const DISABLED_NO_PROXY_PLACEHOLDER =
  'HTTP/HTTPS URL must be provided in order to use No proxy domain';
export const NO_PROXY_PLACEHOLDER = 'domain.com, second.domain.com';
export const NO_PROXY_HELPER_TEXT =
  'Preface a domain with . to match subdomains only. For example, .y.com matches x.y.com, but not y.com. Use * to bypass proxy for all destinations.';
