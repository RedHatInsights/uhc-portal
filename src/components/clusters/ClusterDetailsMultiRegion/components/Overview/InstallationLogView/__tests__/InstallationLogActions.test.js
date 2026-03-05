import * as clusterService from '~/services/clusterService';

import { installationLogActions } from '../InstallationLogActions';
import { installationLogConstants } from '../InstallationLogConstants';

const mockGetClusterServiceForRegion = jest.spyOn(clusterService, 'getClusterServiceForRegion');
const mockedGetLogs = jest.fn();

describe('installationLogActions', () => {
  mockedGetLogs.mockResolvedValue('hello world');
  mockGetClusterServiceForRegion.mockReturnValue({ getLogs: mockedGetLogs });

  let mockDispatch;
  beforeEach(() => {
    mockDispatch = jest.fn();
  });

  it('dispatches successfully', () => {
    installationLogActions.getLogs()(mockDispatch);
    expect(mockDispatch).toBeCalledWith({
      payload: expect.anything(),
      type: installationLogConstants.GET_LOGS,
    });
  });

  it('calls clusterService.getLogs', () => {
    const fakeId = '1234';
    installationLogActions.getLogs(fakeId)(mockDispatch);
    expect(mockedGetLogs).toBeCalledWith(fakeId, 0, 'install');
  });

  it('calls clusterService.getLogs with offset', () => {
    const fakeId = '1234';
    const offset = 50;
    installationLogActions.getLogs(fakeId, offset, 'install')(mockDispatch);
    expect(mockedGetLogs).toBeCalledWith(fakeId, offset, 'install');
  });

  it('dispatches successfully', () => {
    installationLogActions.clearLogs()(mockDispatch);
    expect(mockDispatch).toBeCalledWith({
      type: installationLogConstants.CLEAR_LOGS,
    });
  });
});
