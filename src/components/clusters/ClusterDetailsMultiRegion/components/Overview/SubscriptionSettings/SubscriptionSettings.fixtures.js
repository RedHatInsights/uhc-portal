const openModal = jest.fn();

const canUpdateSubscription = true;
const canSubscribeOCP = true;

const subscription = {
  id: '1FDpnxsGxqFFFp2VNIWp5VajPc8',
  kind: 'Subscription',
  href: '/api/accounts_mgmt/v1/subscriptions/1FDpnxsGxqFFFp2VNIWp5VajPc8',
  plan: {
    id: 'OCP',
    kind: 'Plan',
    href: '/api/accounts_mgmt/v1/plans/OCP',
    type: 'OCP',
  },
  support_level: 'Premium',
  service_level: 'L1-L3',
  usage: 'Production',
  product_bundle: 'Openshift',
  system_units: 'Cores/vCPU',
  cpu_total: 16,
  socket_total: 8,
  registry_credential: {
    id: '1EaZd2cDHH6ibIb1FFqav2Mles6',
    kind: 'RegistryCredential',
    href: '/api/accounts_mgmt/v1/registry_credentials/1EaZd2cDHH6ibIb1FFqav2Mles6',
  },
  cluster_id: '1IztzhAGrbjtKkMbiPewJanhTXk',
  external_cluster_id: 'test-liza',
  last_telemetry_date: '0001-01-01T00:00:00Z',
  created_at: '2019-01-02T18:28:14.851121Z',
  updated_at: '2019-01-02T18:28:14.851121Z',
};

export { subscription, openModal, canUpdateSubscription, canSubscribeOCP };
