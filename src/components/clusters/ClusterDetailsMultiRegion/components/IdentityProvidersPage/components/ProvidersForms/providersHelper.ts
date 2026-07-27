const MAX_HTPASSWD_USERNAME_LENGTH = 255;

export const validateHTPasswdUsername = (username: string): string | undefined => {
  if (!username || !username.trim()) {
    return 'Username is required.';
  }

  if (username.trim() !== username) {
    return 'Username must not contain leading or trailing spaces.';
  }

  if (username.includes('%') || username.includes(':') || username.includes('/')) {
    return 'Username must not contain /, :, or %.';
  }

  if (username.length > MAX_HTPASSWD_USERNAME_LENGTH) {
    return `Username may not exceed ${MAX_HTPASSWD_USERNAME_LENGTH} characters.`;
  }

  return undefined;
};
