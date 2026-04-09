import { maskHTPasswdFileContent, parseHTPasswdFile } from './htpasswdFileParser';

describe('htpasswdFileParser', () => {
  describe('parseHTPasswdFile', () => {
    it('parses a valid single-user file', () => {
      const result = parseHTPasswdFile('admin:$2y$05$hash123');
      expect(result.users).toEqual([{ username: 'admin', password: '$2y$05$hash123' }]);
      expect(result.errors).toHaveLength(0);
    });

    it('parses multiple valid users', () => {
      const content = 'user1:pass1\nuser2:pass2\nuser3:pass3';
      const result = parseHTPasswdFile(content);
      expect(result.users).toHaveLength(3);
      expect(result.users[0]).toEqual({ username: 'user1', password: 'pass1' });
      expect(result.users[2]).toEqual({ username: 'user3', password: 'pass3' });
      expect(result.errors).toHaveLength(0);
    });

    it('handles Windows-style line endings (\\r\\n)', () => {
      const content = 'user1:pass1\r\nuser2:pass2';
      const result = parseHTPasswdFile(content);
      expect(result.users).toHaveLength(2);
      expect(result.errors).toHaveLength(0);
    });

    it('skips empty lines', () => {
      const content = 'user1:pass1\n\n\nuser2:pass2\n';
      const result = parseHTPasswdFile(content);
      expect(result.users).toHaveLength(2);
      expect(result.errors).toHaveLength(0);
    });

    it('skips comment lines starting with #', () => {
      const content = '# this is a comment\nuser1:pass1\n# another comment';
      const result = parseHTPasswdFile(content);
      expect(result.users).toHaveLength(1);
      expect(result.users[0].username).toBe('user1');
      expect(result.errors).toHaveLength(0);
    });

    it('reports error for lines missing a colon', () => {
      const content = 'user1:pass1\ninvalidline\nuser2:pass2';
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
      const content = 'admin:pass1\nuser:pass2\nadmin:pass3';
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
      const content = 'badline\n:nouser\nuser:\nuser1:pass1';
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
      const content = '  user1 : pass1  ';
      const result = parseHTPasswdFile(content);
      expect(result.users[0]).toEqual({ username: 'user1', password: 'pass1' });
      expect(result.errors).toHaveLength(0);
    });
  });

  describe('maskHTPasswdFileContent', () => {
    it('masks passwords with asterisks', () => {
      const content = 'user1:secretpass\nuser2:anotherpass';
      const result = maskHTPasswdFileContent(content);
      expect(result).toBe('user1:*******\nuser2:*******');
    });

    it('preserves empty lines', () => {
      const content = 'user1:pass\n\nuser2:pass';
      const result = maskHTPasswdFileContent(content);
      expect(result).toBe('user1:*******\n\nuser2:*******');
    });

    it('preserves comment lines', () => {
      const content = '# comment\nuser1:pass';
      const result = maskHTPasswdFileContent(content);
      expect(result).toBe('# comment\nuser1:*******');
    });

    it('preserves lines without colons as-is', () => {
      const content = 'invalidline\nuser1:pass';
      const result = maskHTPasswdFileContent(content);
      expect(result).toBe('invalidline\nuser1:*******');
    });

    it('handles passwords containing colons', () => {
      const content = 'user1:$2y$05$salt:hash';
      const result = maskHTPasswdFileContent(content);
      expect(result).toBe('user1:*******');
    });
  });
});
