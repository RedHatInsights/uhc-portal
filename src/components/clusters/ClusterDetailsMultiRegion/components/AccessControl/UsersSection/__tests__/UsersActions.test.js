import { clusterService } from '../../../../../../../services';
import UsersActions from '../UsersActions';
import UsersConstants from '../UsersConstants';

jest.mock('../../../../../../../services/clusterService');

describe('ClusterDetails UserActions', () => {
  let mockDispatch;
  beforeEach(() => {
    mockDispatch = jest.fn();
  });

  describe('getUsers', () => {
    it('dispatches successfully', () => {
      UsersActions.getUsers('fake id')(mockDispatch);
      expect(mockDispatch).toHaveBeenCalledWith({
        payload: expect.anything(),
        type: UsersConstants.GET_USERS,
      });
    });

    it('calls clusterService.getUsers', () => {
      UsersActions.getUsers('fake id')(mockDispatch);
      expect(clusterService.getClusterGroupUsers).toHaveBeenCalledWith('fake id');
    });
  });

  describe('addUser', () => {
    it('dispatches successfully', () => {
      UsersActions.addUser('fake id', 'fake-group', 'fake-user')(mockDispatch);
      expect(mockDispatch).toHaveBeenCalledWith({
        payload: expect.anything(),
        type: UsersConstants.ADD_USER,
      });
    });

    it('calls clusterService.addClusterGroupUser', () => {
      UsersActions.addUser('fake id', 'fake-group', 'fake-user')(mockDispatch);
      expect(clusterService.addClusterGroupUser).toHaveBeenCalledWith(
        'fake id',
        'fake-group',
        'fake-user',
      );
    });
  });

  describe('deleteUser', () => {
    it('dispatches successfully', () => {
      UsersActions.deleteUser('fake id', 'fake-group', 'fake-user')(mockDispatch);
      expect(mockDispatch).toHaveBeenCalledWith({
        payload: expect.anything(),
        type: UsersConstants.DELETE_USER,
      });
    });

    it('calls clusterService.getClusterGroupUsers', () => {
      UsersActions.deleteUser('fake id', 'fake-group', 'fake-user')(mockDispatch);
      expect(clusterService.deleteClusterGroupUser).toHaveBeenCalledWith(
        'fake id',
        'fake-group',
        'fake-user',
      );
    });
  });
});
