export type ParsedHTPasswdUser = {
  username: string;
  password: string;
};

export type HTPasswdParseResult = {
  users: ParsedHTPasswdUser[];
  errors: string[];
};

const HASHED_PASSWORD_PATTERN = /^(\$2[aby]\$|\$apr1\$|\$5\$|\$6\$|\{SHA\})/;

const isHashedPassword = (password: string): boolean => HASHED_PASSWORD_PATTERN.test(password);

export const parseHTPasswdFile = (content: string): HTPasswdParseResult => {
  const lines = content.split(/\r?\n/);
  const users: ParsedHTPasswdUser[] = [];
  const errors: string[] = [];
  const seenUsernames = new Set<string>();

  lines.forEach((rawLine, index) => {
    const line = rawLine.trim();
    if (line === '' || line.startsWith('#')) {
      return;
    }

    const colonIndex = line.indexOf(':');
    if (colonIndex === -1) {
      errors.push(`Line ${index + 1}: Invalid format. Expected "username:password".`);
      return;
    }

    const username = line.substring(0, colonIndex).trim();
    const password = line.substring(colonIndex + 1).trim();

    if (!username) {
      errors.push(`Line ${index + 1}: Username cannot be empty.`);
      return;
    }

    if (!password) {
      errors.push(`Line ${index + 1}: Password cannot be empty.`);
      return;
    }

    if (seenUsernames.has(username)) {
      errors.push(`Line ${index + 1}: Duplicate username "${username}".`);
      return;
    }

    if (!isHashedPassword(password)) {
      errors.push(`Line ${index + 1}: Password for "${username}" does not appear to be hashed.`);
      return;
    }

    seenUsernames.add(username);
    users.push({ username, password });
  });

  if (users.length === 0 && errors.length === 0) {
    errors.push('File is empty or contains no valid entries.');
  }

  return { users, errors };
};
