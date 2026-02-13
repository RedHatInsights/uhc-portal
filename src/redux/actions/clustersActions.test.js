import { accountsService, clusterService } from '../../services';
import * as clusterServiceModule from '../../services/clusterService';
import { clustersConstants } from '../constants';
import { INVALIDATE_ACTION } from '../reduxHelpers';

import { clustersActions } from './clustersActions';

jest.mock('../../services/accountsService');
jest.mock('../../services/authorizationsService');
jest.mock('../../services/clusterService', () => {
  const mockClusterService = {
    postNewCluster: jest.fn(),
    getInstallableVersions: jest.fn(),
  };
  return {
    __esModule: true,
    default: mockClusterService,
    getClusterServiceForRegion: jest.fn(() => mockClusterService),
  };
});

describe('clustersActions', () => {
  let mockDispatch;
  beforeEach(() => {
    mockDispatch = jest.fn();
  });

  describe('invalidateClusters', () => {
    it('dispatches successfully', () => {
      const result = clustersActions.invalidateClusters();
      expect(result).toEqual(
        expect.objectContaining({
          type: INVALIDATE_ACTION(clustersConstants.GET_CLUSTERS),
        }),
      );
    });
  });

  describe('createCluster', () => {
    it('dispatches successfully', () => {
      const fakeParams = { fake: 'params' };
      clustersActions.createCluster(fakeParams)(mockDispatch);
      expect(mockDispatch).toHaveBeenCalledWith({
        payload: expect.anything(),
        type: clustersConstants.CREATE_CLUSTER,
      });
    });

    it('calls clusterService.postNewCluster', () => {
      const fakeParams = { fake: 'params' };
      clustersActions.createCluster(fakeParams)(mockDispatch);
      expect(clusterService.postNewCluster).toHaveBeenCalledWith(fakeParams);
    });

    it('calls regionalClusterService.postNewCluster when regionalId exists', () => {
      const fakeCluster = { fake: 'params' };
      const fakeUpgradeSchedule = { fake: 'params' };
      const fakeRegionalId = 'aws.ap-southeast-1.stage';
      const mockedPostNewCluster = jest.fn();
      const mockGetClusterServiceForRegion = jest.spyOn(
        clusterServiceModule,
        'getClusterServiceForRegion',
      );
      mockGetClusterServiceForRegion.mockReturnValue({
        postNewCluster: mockedPostNewCluster,
      });
      mockedPostNewCluster.mockResolvedValue({ data: { id: 'cluster-id' } });

      clustersActions.createCluster(fakeCluster, fakeUpgradeSchedule, fakeRegionalId)(mockDispatch);

      expect(mockGetClusterServiceForRegion).toHaveBeenCalledWith(fakeRegionalId);
      expect(mockedPostNewCluster).toHaveBeenCalledWith(fakeCluster);
    });
  });

  describe('fetchClusterDetails', () => {
    it('dispatches successfully', () => {
      const result = clustersActions.fetchClusterDetails();
      expect(result).toEqual({
        type: clustersConstants.GET_CLUSTER_DETAILS,
        payload: expect.anything(),
      });
    });

    it('calls clusterService.getClusterDetails', () => {
      const fakeParams = { fake: 'params' };
      clustersActions.fetchClusterDetails(fakeParams);
      expect(accountsService.getSubscription).toHaveBeenCalledWith(fakeParams);
    });
  });

  describe('resetCreatedClusterResponse', () => {
    it('dispatches successfully', () => {
      const result = clustersActions.resetCreatedClusterResponse();
      expect(result).toEqual({
        type: clustersConstants.RESET_CREATED_CLUSTER_RESPONSE,
      });
    });
  });

  describe('getInstallableVersions', () => {
    it('calls cluster service getInstallableVersions action with HCP', () => {
      const isRosa = true;
      const isMarketplaceGcp = true;
      const isHCP = true;
      clustersActions.getInstallableVersions({ isRosa, isMarketplaceGcp, isHCP });
      expect(clusterService.getInstallableVersions).toHaveBeenCalledWith({
        isRosa,
        isMarketplaceGcp,
        isHCP,
      });
    });
  });
});
