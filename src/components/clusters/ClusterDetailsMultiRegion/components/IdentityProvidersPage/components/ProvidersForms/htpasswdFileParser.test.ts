import { parseHTPasswdFile } from './htpasswdFileParser';

describe('htpasswdFileParser', () => {
  describe('parseHTPasswdFile', () => {
    it('parses a valid single-user file', () => {
      const result = parseHTPasswdFile('admin:$2y$05$hash123');
      expect(result.users).toEqual([{ username: 'admin', password: '$2y$05$hash123' }]);
      expect(result.errors).toHaveLength(0);
    });

    it('parses multiple valid users', () => {
      const content = 'user1:$2y$05$hash1\nuser2:$apr1$salt$hash2\nuser3:{SHA}base64hash';
      const result = parseHTPasswdFile(content);
      expect(result.users).toHaveLength(3);
      expect(result.users[0]).toEqual({ username: 'user1', password: '$2y$05$hash1' });
      expect(result.users[2]).toEqual({ username: 'user3', password: '{SHA}base64hash' });
      expect(result.errors).toHaveLength(0);
    });

    it('handles Windows-style line endings (\\r\\n)', () => {
      const content = 'user1:$2y$05$hash1\r\nuser2:$apr1$salt$hash2';
      const result = parseHTPasswdFile(content);
      expect(result.users).toHaveLength(2);
      expect(result.errors).toHaveLength(0);
    });

    it('skips empty lines', () => {
      const content = 'user1:$2y$05$hash1\n\n\nuser2:$apr1$salt$hash2\n';
      const result = parseHTPasswdFile(content);
      expect(result.users).toHaveLength(2);
      expect(result.errors).toHaveLength(0);
    });

    it('skips comment lines starting with #', () => {
      const content = '# this is a comment\nuser1:$2y$05$hash1\n# another comment';
      const result = parseHTPasswdFile(content);
      expect(result.users).toHaveLength(1);
      expect(result.users[0].username).toBe('user1');
      expect(result.errors).toHaveLength(0);
    });

    it('reports error for lines missing a colon', () => {
      const content = 'user1:$2y$05$hash1\ninvalidline\nuser2:$apr1$salt$hash2';
      const result = parseHTPasswdFile(content);
      expect(result.users).toHaveLength(2);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0]).toBe('Line 2: Invalid format. Expected "username:password".');
    });

    it('reports error for empty username', () => {
      const content = ':somepassword';
      const result = parseHTPasswdFile(content);
      expect(result.users).toHaveLength(0);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0]).toBe('Line 1: Username cannot be empty.');
    });

    it('reports error for empty password', () => {
      const content = 'username:';
      const result = parseHTPasswdFile(content);
      expect(result.users).toHaveLength(0);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0]).toBe('Line 1: Password cannot be empty.');
    });

    it('reports error for duplicate usernames', () => {
      const content = 'admin:$2y$05$hash1\nuser:$apr1$salt$hash2\nadmin:$2y$05$hash3';
      const result = parseHTPasswdFile(content);
      expect(result.users).toHaveLength(2);
      expect(result.users.map((u) => u.username)).toEqual(['admin', 'user']);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0]).toBe('Line 3: Duplicate username "admin".');
    });

    it('reports empty file error when content is empty', () => {
      const result = parseHTPasswdFile('');
      expect(result.users).toHaveLength(0);
      expect(result.errors).toEqual(['File is empty or contains no valid entries.']);
    });

    it('reports empty file error when content is only whitespace and comments', () => {
      const content = '  \n# comment\n  \n';
      const result = parseHTPasswdFile(content);
      expect(result.users).toHaveLength(0);
      expect(result.errors).toEqual(['File is empty or contains no valid entries.']);
    });

    it('collects multiple errors from different lines', () => {
      const content = 'badline\n:nouser\nuser:\nuser1:$2y$05$hash1';
      const result = parseHTPasswdFile(content);
      expect(result.users).toHaveLength(1);
      expect(result.errors).toHaveLength(3);
      expect(result.errors[0]).toContain('Line 1');
      expect(result.errors[1]).toContain('Line 2');
      expect(result.errors[2]).toContain('Line 3');
    });

    it('handles passwords containing colons', () => {
      const content = 'user1:$2y$05$salt:hash:extra';
      const result = parseHTPasswdFile(content);
      expect(result.users).toHaveLength(1);
      expect(result.users[0]).toEqual({
        username: 'user1',
        password: '$2y$05$salt:hash:extra',
      });
      expect(result.errors).toHaveLength(0);
    });

    it('trims whitespace from lines, usernames, and passwords', () => {
      const content = '  user1 : $2y$05$hash1  ';
      const result = parseHTPasswdFile(content);
      expect(result.users[0]).toEqual({ username: 'user1', password: '$2y$05$hash1' });
      expect(result.errors).toHaveLength(0);
    });

    it('reports error for plain text passwords', () => {
      const content = 'test:JKN@#$123';
      const result = parseHTPasswdFile(content);
      expect(result.users).toHaveLength(0);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0]).toContain('does not appear to be hashed');
    });

    it('reports errors for multiple plain text passwords', () => {
      const content = 'test:plaintext\nadmin:$2y$05$hash1\nuser2:unhashed';
      const result = parseHTPasswdFile(content);
      expect(result.users).toHaveLength(1);
      expect(result.users[0].username).toBe('admin');
      expect(result.errors).toHaveLength(2);
      expect(result.errors[0]).toContain('Line 1');
      expect(result.errors[1]).toContain('Line 3');
    });

    it('accepts all supported hash formats', () => {
      const content = [
        'user1:$2y$05$bcrypthash',
        'user2:$2a$10$bcrypthash',
        'user3:$2b$12$bcrypthash',
        'user4:$apr1$salt$md5hash',
        'user5:{SHA}base64hash',
        'user6:$5$rounds=5000$salt$sha256hash',
        'user7:$6$rounds=5000$salt$sha512hash',
      ].join('\n');
      const result = parseHTPasswdFile(content);
      expect(result.users).toHaveLength(7);
      expect(result.errors).toHaveLength(0);
    });
  });
});
