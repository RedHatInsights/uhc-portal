export type ParsedHTPasswdUser = {
  username: string;
  password: string;
};

export type HTPasswdParseResult = {
  users: ParsedHTPasswdUser[];
  errors: string[];
};

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

    seenUsernames.add(username);
    users.push({ username, password });
  });

  if (users.length === 0 && errors.length === 0) {
    errors.push('File is empty or contains no valid entries.');
  }

  return { users, errors };
};

export const maskHTPasswdFileContent = (content: string): string => {
  const lines = content.split(/\r?\n/);
  return lines
    .map((line) => {
      const trimmed = line.trim();
      if (trimmed === '' || trimmed.startsWith('#')) {
        return line;
      }
      const colonIndex = trimmed.indexOf(':');
      if (colonIndex === -1) {
        return line;
      }
      const username = trimmed.substring(0, colonIndex);
      return `${username}:*******`;
    })
    .join('\n');
};
