import axios from 'axios';

import apiRequest from '~/services/apiRequest';
import { ScheduleType, UpgradeType } from '~/types/clusters_mgmt.v1/enums';

import clusterService from './clusterService';

type MockedJest = jest.Mocked<typeof axios> & jest.Mock;
const apiRequestMock = apiRequest as unknown as MockedJest;

const getApiGetParams = () => apiRequestMock.get.mock.calls[0][1]?.params;

describe('clusterService', () => {
  beforeEach(() => {
    apiRequestMock.get.mockResolvedValue({ versions: ['a list of versions'] });
  });
  afterEach(() => {
    jest.resetAllMocks();
  });

  it('call to get versions includes product=hcp when isHCP param is set', async () => {
    const isHCP = true;
    await clusterService.getInstallableVersions({ isRosa: true, isHCP });

    expect(apiRequestMock.get).toHaveBeenCalledTimes(1);
    expect(getApiGetParams().product).toEqual('hcp');
  });

  it('call to get versions includes rosa_enabled if isRosa is true', async () => {
    const isRosa = true;
    await clusterService.getInstallableVersions({ isRosa });

    expect(apiRequestMock.get).toHaveBeenCalledTimes(1);
    expect(getApiGetParams().search).toContain("rosa_enabled='t'");
  });

  it('call to get versions does not includes rosa_enabled if isRosa is false', async () => {
    const isRosa = false;
    await clusterService.getInstallableVersions({ isRosa });

    expect(apiRequestMock.get).toHaveBeenCalledTimes(1);
    expect(getApiGetParams().search).not.toContain("rosa_enabled='t'");
  });

  it('call to get versions includes gcp_marketplace_enabled if isGCP is true', async () => {
    const isMarketplaceGcp = true;
    await clusterService.getInstallableVersions({ isMarketplaceGcp });

    expect(apiRequestMock.get).toHaveBeenCalledTimes(1);
    expect(getApiGetParams().search).toContain("gcp_marketplace_enabled='t'");
  });

  it('call to get versions does not includes gcp_marketplace_enabled if isGCP is false', async () => {
    const isMarketplaceGcp = false;
    await clusterService.getInstallableVersions({ isMarketplaceGcp });

    expect(apiRequestMock.get).toHaveBeenCalledTimes(1);
    expect(getApiGetParams().search).not.toContain("gcp_marketplace_enabled='t'");
  });

  it.each([
    ['includes', true],
    ['does not include', false],
  ])('call to get versions %s wif_enabled param if isWIF is "%s"', async (_title, isWIF) => {
    await clusterService.getInstallableVersions({ isWIF });

    expect(apiRequestMock.get).toHaveBeenCalledTimes(1);
    expect(getApiGetParams().search.includes("wif_enabled='t'")).toBe(isWIF);
  });

  it('call to get GCP WIF config contains a WIF Id path param', async () => {
    const wifId = '12345';
    await clusterService.getGCPWifConfig(wifId);

    expect(apiRequestMock.get).toHaveBeenCalledTimes(1);
    const mockPostCallParams = apiRequestMock.get.mock.calls[0];
    expect(mockPostCallParams[0]).toEqual(`/api/clusters_mgmt/v1/gcp/wif_configs/${wifId}`);
  });

  it('call to post a node pool upgrade policy', async () => {
    apiRequestMock.post.mockResolvedValue('success');
    const clusterId = 'myCluster';
    const nodePoolId = 'myPool1';
    const schedule = {
      next_run: 'now + 6 minutes',
      node_pool_id: nodePoolId,
      schedule_type: ScheduleType.manual,
      upgrade_type: UpgradeType.NodePool,
      version: '4.14.1',
    };

    await clusterService.postNodePoolUpgradeSchedule(clusterId, nodePoolId, schedule);
    expect(apiRequestMock.post).toHaveBeenCalledTimes(1);
    const mockPostCallParams = apiRequestMock.post.mock.calls[0];
    expect(mockPostCallParams[0]).toEqual(
      '/api/clusters_mgmt/v1/clusters/myCluster/node_pools/myPool1/upgrade_policies',
    );

    expect(mockPostCallParams[1]).toEqual(schedule);
  });

  it('call to get a node pool upgrade policy', async () => {
    const clusterId = 'myCluster';
    const nodePoolId = 'myPool1';

    apiRequestMock.get.mockResolvedValue({ items: [], page: 1, size: 0, total: 0 });

    await clusterService.getNodePoolUpgradePolicies(clusterId, nodePoolId);
    expect(apiRequestMock.get).toHaveBeenCalledTimes(1);
    const mockGetCallParams = apiRequestMock.get.mock.calls[0];

    expect(mockGetCallParams[0]).toEqual(
      '/api/clusters_mgmt/v1/clusters/myCluster/node_pools/myPool1/upgrade_policies',
    );
  });

  it('call to get technology preview data', async () => {
    apiRequestMock.get.mockResolvedValue({});

    await clusterService.getTechPreviewStatus('myProduct', 'myType');
    expect(apiRequestMock.get).toHaveBeenCalledTimes(1);
    const mockGetCallParams = apiRequestMock.get.mock.calls[0];

    expect(mockGetCallParams[0]).toEqual(
      '/api/clusters_mgmt/v1/products/myProduct/technology_previews/myType',
    );
  });

  it('call to get enabled add ons', async () => {
    apiRequestMock.get.mockResolvedValue({});

    await clusterService.getEnabledAddOns('myClusterId');
    expect(apiRequestMock.get).toHaveBeenCalledTimes(1);
    const mockGetCallParams = apiRequestMock.get.mock.calls[0];

    expect(mockGetCallParams[0]).toEqual(
      '/api/clusters_mgmt/v1/clusters/myClusterId/addon_inquiries',
    );
    expect(getApiGetParams().search).toContain("enabled='t'");
  });
  describe('External Authentication', () => {
    it('call to get an external authentication prodiver detail', async () => {
      const clusterId = 'myCluster';
      const myProvider = 'myProvider';

      apiRequestMock.get.mockResolvedValue({ items: [], page: 1, size: 0, total: 0 });

      await clusterService.getExternalAuthDetails(clusterId, myProvider);
      expect(apiRequestMock.get).toHaveBeenCalledTimes(1);
      const mockGetCallParams = apiRequestMock.get.mock.calls[0];

      expect(mockGetCallParams[0]).toEqual(
        '/api/clusters_mgmt/v1/clusters/myCluster/external_auth_config/external_auths/myProvider',
      );
    });

    it('call to delete an external authentication prodiver', async () => {
      const clusterId = 'myCluster';
      const myProvider = 'myProvider';

      apiRequestMock.get.mockResolvedValue({ items: [], page: 1, size: 0, total: 0 });

      await clusterService.deleteExternalAuth(clusterId, myProvider);
      expect(apiRequestMock.delete).toHaveBeenCalledTimes(1);
      const mockGetCallParams = apiRequestMock.delete.mock.calls[0];

      expect(mockGetCallParams[0]).toEqual(
        '/api/clusters_mgmt/v1/clusters/myCluster/external_auth_config/external_auths/myProvider',
      );
    });

    it('call to post a new external authentication prodiver', async () => {
      const clusterId = 'myCluster';
      const myProvider = 'myProvider';
      const myProviderDetails = {
        id: myProvider,
        issuer: {
          url: 'https:redhat.com',
          audiences: ['abc'],
        },
        claim: {
          mappings: {
            username: {
              claim: 'email',
            },
            groups: {
              claim: 'groups',
            },
          },
        },
      };

      await clusterService.postExternalAuth(clusterId, myProviderDetails);
      expect(apiRequestMock.post).toHaveBeenCalledTimes(1);
      const mockGetCallParams = apiRequestMock.post.mock.calls[0];

      expect(mockGetCallParams[0]).toEqual(
        '/api/clusters_mgmt/v1/clusters/myCluster/external_auth_config/external_auths',
      );
    });
  });
  describe('Break Glass Credentials', () => {
    it('call to get all break glass credentials', async () => {
      const clusterId = 'myCluster';

      apiRequestMock.get.mockResolvedValue({ items: [], page: 1, size: 0, total: 0 });

      await clusterService.getBreakGlassCredentials(clusterId);
      expect(apiRequestMock.get).toHaveBeenCalledTimes(1);
      const mockGetCallParams = apiRequestMock.get.mock.calls[0];

      expect(mockGetCallParams[0]).toEqual(
        '/api/clusters_mgmt/v1/clusters/myCluster/break_glass_credentials',
      );
    });
    it('call to get detail of break glass credential', async () => {
      const clusterId = 'myCluster';
      const credentialId = 'myCredential';

      apiRequestMock.get.mockResolvedValue({ items: [], page: 1, size: 0, total: 0 });

      await clusterService.getBreakGlassCredentialDetails(clusterId, credentialId);
      expect(apiRequestMock.get).toHaveBeenCalledTimes(1);
      const mockGetCallParams = apiRequestMock.get.mock.calls[0];

      expect(mockGetCallParams[0]).toEqual(
        '/api/clusters_mgmt/v1/clusters/myCluster/break_glass_credentials/myCredential',
      );
    });

    it('call to delete break glass credential', async () => {
      const clusterId = 'myCluster';

      apiRequestMock.get.mockResolvedValue({ items: [], page: 1, size: 0, total: 0 });

      await clusterService.revokeBreakGlassCredentials(clusterId);
      expect(apiRequestMock.delete).toHaveBeenCalledTimes(1);
      const mockGetCallParams = apiRequestMock.delete.mock.calls[0];

      expect(mockGetCallParams[0]).toEqual(
        '/api/clusters_mgmt/v1/clusters/myCluster/break_glass_credentials',
      );
    });

    it('call to post a new break glass credential', async () => {
      const clusterId = 'myCluster';
      const credentialId = 'myCredential';

      const myCredDetails = {
        username: credentialId,
      };

      await clusterService.postBreakGlassCredentials(clusterId, myCredDetails);
      expect(apiRequestMock.post).toHaveBeenCalledTimes(1);
      const mockGetCallParams = apiRequestMock.post.mock.calls[0];

      expect(mockGetCallParams[0]).toEqual(
        '/api/clusters_mgmt/v1/clusters/myCluster/break_glass_credentials',
      );
    });
  });

  describe('Control plane log forwarders', () => {
    it('call to post a control plane log forwarder', async () => {
      apiRequestMock.post.mockResolvedValue({ data: { id: 'lf-1' } });
      const clusterId = 'myCluster';
      const body = { s3: { bucket_name: 'my-bucket' }, applications: ['etcd'] };

      await clusterService.postClusterControlPlaneLogForwarder(clusterId, body);
      expect(apiRequestMock.post).toHaveBeenCalledTimes(1);
      expect(apiRequestMock.post.mock.calls[0][0]).toEqual(
        '/api/clusters_mgmt/v1/clusters/myCluster/control_plane/log_forwarders',
      );
      expect(apiRequestMock.post.mock.calls[0][1]).toEqual(body);
    });

    it('call to patch a control plane log forwarder', async () => {
      apiRequestMock.patch.mockResolvedValue({ data: { id: 'lf-1' } });
      const clusterId = 'myCluster';
      const logForwarderId = 'lf-1';
      const body = { s3: { bucket_name: 'updated-bucket' }, applications: ['etcd'] };

      await clusterService.patchClusterControlPlaneLogForwarder(clusterId, logForwarderId, body);
      expect(apiRequestMock.patch).toHaveBeenCalledTimes(1);
      expect(apiRequestMock.patch.mock.calls[0][0]).toEqual(
        '/api/clusters_mgmt/v1/clusters/myCluster/control_plane/log_forwarders/lf-1',
      );
      expect(apiRequestMock.patch.mock.calls[0][1]).toEqual(body);
    });

    it('call to delete a control plane log forwarder', async () => {
      apiRequestMock.delete.mockResolvedValue({});
      const clusterId = 'myCluster';
      const logForwarderId = 'lf-1';

      await clusterService.deleteClusterControlPlaneLogForwarder(clusterId, logForwarderId);
      expect(apiRequestMock.delete).toHaveBeenCalledTimes(1);
      expect(apiRequestMock.delete.mock.calls[0][0]).toEqual(
        '/api/clusters_mgmt/v1/clusters/myCluster/control_plane/log_forwarders/lf-1',
      );
    });
  });
});
