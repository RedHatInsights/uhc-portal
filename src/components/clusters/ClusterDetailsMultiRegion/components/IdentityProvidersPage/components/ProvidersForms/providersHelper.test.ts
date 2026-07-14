import { validateHTPasswdUsername } from './providersHelper';

describe('validateHTPasswdUsername', () => {
  it.each([
    ['username1234', undefined],
    ['user name', undefined],
    ['username1  ', 'Username must not contain leading or trailing spaces.'],
    [' user name', 'Username must not contain leading or trailing spaces.'],
    ['     ', 'Username is required.'],
    ['username%', 'Username must not contain /, :, or %.'],
    ['username:', 'Username must not contain /, :, or %.'],
    ['username/', 'Username must not contain /, :, or %.'],
    ['', 'Username is required.'],
    ['a'.repeat(255), undefined],
    ['a'.repeat(256), 'Username may not exceed 255 characters.'],
  ])('value %p to be %p', (value: string, expected: string | undefined) => {
    expect(validateHTPasswdUsername(value)).toBe(expected);
  });
});
