import { isSingleUserHtpasswd } from './htpasswdUtilities';

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
});
