console.log('🔍 MOCK LOADED: clusterService.ts');

const mockClusterService = {
  getInstallableVersions: (params) => {
    console.log('GETTING INSTALLABLE VERSIONS FROM MOCK with params:', params);
    return Promise.resolve({
      data: {
        items: [
          { id: 'openshift-v4.13.0', raw_id: '4.13.0', rosa_enabled: true, hosted_control_plane_enabled: true, channel_group: 'stable' },
          { id: 'openshift-v4.12.0', raw_id: '4.12.0', rosa_enabled: true, hosted_control_plane_enabled: true, channel_group: 'stable' },
          { id: 'openshift-v4.11.0', raw_id: '4.11.0', rosa_enabled: true, hosted_control_plane_enabled: true, channel_group: 'stable' },
        ],
      },
    });
  },
  // Add any other methods that are called on the service with mock implementations
  getCloudProviders: () => Promise.resolve({ data: { items: [] } }),
  getMachineTypesByRegionARN: () => Promise.resolve({ data: { items: [] } }),
  getFlavour: (flavourId) => {
    console.log(`Mock getFlavour called for: ${flavourId}`);
    return Promise.resolve({
      data: {
        id: flavourId,
        name: `Mock Flavour ${flavourId}`,
        nodes: {
          master: 3,
          infra: 3,
          compute: 3,
        },
        network: {
          type: 'OVNKubernetes',
        },
      },
    });
  },
};

// This is the key: we mock the factory function itself.
export const getClusterServiceForRegion = (region) => {
  console.log(`Mock getClusterServiceForRegion called for region: ${region}`);
  return mockClusterService;
};

// Export the service object for direct imports.
export const clusterService = mockClusterService;

export default mockClusterService;
