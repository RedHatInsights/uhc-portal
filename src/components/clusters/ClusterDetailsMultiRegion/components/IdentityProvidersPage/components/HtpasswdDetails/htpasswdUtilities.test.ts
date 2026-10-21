import { groupBulkDeleteHtpasswdUserErrors, isSingleUserHtpasswd } from './htpasswdUtilities';

describe('htpasswdUtilities', () => {
  describe('isSingleUserHtpasswd', () => {
    it('will return true if singleUserHtpasswd', () => {
      const htpasswd = {
        // password?: string;
        username: 'mySingleUserHtpasswdUser',
        // users?: components["schemas"]["HTPasswdUser"][];
      };

      expect(isSingleUserHtpasswd(htpasswd)).toBeTruthy();
    });

    it('will return false if multiUserHtpasswd', () => {
      const htpasswd = {
        users: [
          {
            id: 'myId',
            username: 'myUserName',
          },
        ],
      };

      expect(isSingleUserHtpasswd(htpasswd)).toBeFalsy();
    });
  });

  describe('groupBulkDeleteHtpasswdUserErrors', () => {
    it('groups failures that share the same root cause into one entry', () => {
      const result = groupBulkDeleteHtpasswdUserErrors([
        {
          username: 'user1',
          userId: 'abc123',
          error: {
            errorMessage:
              "Failed to delete HTPasswd user 'abc123' from cluster 'cluster1': IAM role missing",
            operationID: 'op-1',
          },
        },
        {
          username: 'user2',
          userId: 'def456',
          error: {
            errorMessage:
              "Failed to delete HTPasswd user 'def456' from cluster 'cluster1': IAM role missing",
            operationID: 'op-2',
          },
        },
        {
          username: 'user3',
          userId: 'ghi789',
          error: {
            errorMessage:
              "Failed to delete HTPasswd user 'ghi789' from cluster 'cluster1': IAM role missing",
            operationID: 'op-3',
          },
        },
      ]);

      expect(result).toHaveLength(1);
      expect(result[0].usernames).toEqual(['user1', 'user2', 'user3']);
      expect(result[0].error.errorMessage).toBe(
        "Failed to delete HTPasswd user 'abc123, def456, ghi789' from cluster 'cluster1': IAM role missing",
      );
      expect(result[0].error.operationID).toBe('op-1');
    });

    it('keeps distinct error messages in separate groups', () => {
      const result = groupBulkDeleteHtpasswdUserErrors([
        {
          username: 'user1',
          error: { errorMessage: 'Permission denied' },
        },
        {
          username: 'user2',
          error: { errorMessage: 'User not found' },
        },
      ]);

      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({
        usernames: ['user1'],
        error: { errorMessage: 'Permission denied' },
      });
      expect(result[1]).toEqual({
        usernames: ['user2'],
        error: { errorMessage: 'User not found' },
      });
    });
  });
});
