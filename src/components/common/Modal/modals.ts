/**
 * Modal names, to be passed to openModal and shouldShowModal.
 * @enum {String}
 */
const modals = {
  ADD_NOTIFICATION_CONTACT: 'add-notification-contact',
  ARCHIVE_CLUSTER: 'archive-cluster',
  DELETE_CLUSTER: 'delete-cluster',
  DELETE_MACHINE_POOL: 'delete-machine-pool',
  DELETE_PROTECTION: 'delete-protection',
  EDIT_APPLICATION_INGRESS: 'edit-application-ingress',
  EDIT_CLUSTER_AUTOSCALING_V2: 'edit-cluster-autoscaling-v2',
  EDIT_CLUSTER_INGRESS: 'edit-cluster-ingress',
  EDIT_CLUSTER_WIDE_PROXY: 'EDIT_CLUSTER_WIDE_PROXY',
  EDIT_CONSOLE_URL: 'edit-console-url',
  EDIT_DISPLAY_NAME: 'edit-display-name',
  EDIT_MACHINE_POOL: 'edit-machine-pool',
  EDIT_SUBSCRIPTION_SETTINGS: 'edit-subscription-settings',
  ACCESS_REQUEST_DETAILS: 'accessRequest-details',
  HIBERNATE_CLUSTER: 'hibernate-cluster',
  OCM_ROLES: 'ocm-roles',
  REGISTER_CLUSTER_ERROR: 'register-cluster-error',
  RESUME_CLUSTER: 'resume-cluster',
  SCALE_CLUSTER: 'edit-cluster',
  TRANSFER_CLUSTER_OWNERSHIP: 'transfer-cluster-ownership',
  TRANSFER_CLUSTER_OWNERSHIP_AUTO: 'transfer-cluster-ownership-auto',
  UNARCHIVE_CLUSTER: 'unarchive-cluster',
  UPDATE_MACHINE_POOL_VERSION: 'update-machine-pool-version',
  UPGRADE_TRIAL_CLUSTER: 'upgrade-trial-cluster',
  UPGRADE_WIZARD: 'upgrade-wizard',
  ADD_HTPASSWD_USER: 'ADD_HTPASSWD_USER',
  EDIT_HTPASSWD_USER: 'EDIT_HTPASSWD_USER',
  BULK_DELETE_HTPASSWD_USER: 'BULK_DELETE_HTPASSWD_USER',
  DELETE_HTPASSWD_USER: 'DELETE_HTPASSWD_USER',
};
export default modals;
