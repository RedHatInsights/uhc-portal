const getClusters = jest.fn();
getClusters.mockResolvedValue({});

const postNewCluster = jest.fn();
postNewCluster.mockResolvedValue({});

const getClusterDetails = jest.fn();
getClusterDetails.mockResolvedValue({});

const editCluster = jest.fn();
editCluster.mockResolvedValue({});

const deleteCluster = jest.fn();
deleteCluster.mockResolvedValue({});

const getCloudProviders = jest.fn();
getCloudProviders.mockResolvedValue({});

const getLogs = jest.fn();
getLogs.mockResolvedValue({});

const getClusterGroupUsers = jest.fn();
getClusterGroupUsers.mockResolvedValue({});

const addClusterGroupUser = jest.fn();
addClusterGroupUser.mockResolvedValue({});

const deleteClusterGroupUser = jest.fn();
deleteClusterGroupUser.mockResolvedValue({});

const getClusterStatus = jest.fn();
getClusterStatus.mockResolvedValue({});

const getMachineTypes = jest.fn();
getMachineTypes.mockResolvedValue({});

const getMachinePools = jest.fn();
getMachinePools.mockResolvedValue({});

const getNodePools = jest.fn();
getNodePools.mockResolvedValue({});

const deleteMachinePool = jest.fn();
deleteMachinePool.mockResolvedValue({});

const clearGetMachinePoolsResponse = jest.fn();
clearGetMachinePoolsResponse.mockResolvedValue({});

const getInstallableVersions = jest.fn();
getInstallableVersions.mockResolvedValue([]);

const getMachineTypesByRegionARN = jest.fn();
getMachineTypesByRegionARN.mockResolvedValue([]);

const updateDeleteProtection = jest.fn();
updateDeleteProtection.mockResolvedValue({});

const getClusterControlPlaneLogForwarders = jest.fn();
getClusterControlPlaneLogForwarders.mockResolvedValue({ data: { items: [] } });

const getLogForwardingGroups = jest.fn();
getLogForwardingGroups.mockResolvedValue({ data: { items: [] } });

const clusterService = {
  getClusters,
  postNewCluster,
  getClusterDetails,
  editCluster,
  getCloudProviders,
  deleteCluster,
  getLogs,
  getClusterGroupUsers,
  addClusterGroupUser,
  deleteClusterGroupUser,
  getClusterStatus,
  getMachineTypes,
  getMachinePools,
  getNodePools,
  deleteMachinePool,
  clearGetMachinePoolsResponse,
  getInstallableVersions,
  getMachineTypesByRegionARN,
  getClusterControlPlaneLogForwarders,
  getLogForwardingGroups,
};

export default clusterService;
