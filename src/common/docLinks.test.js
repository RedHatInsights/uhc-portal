import docLinks from './docLinks.mjs';

describe('docLinks', () => {
  const urls = Object.values(docLinks);
  it('should not contain installation binaries', () => {
    urls.forEach((url) => {
      expect(url).not.toMatch(/mirror/);
    });
  });

  it('should not contain console. urls', () => {
    urls.forEach((url) => {
      expect(url).not.toContain('https://console.');
    });
  });

  it('should not contain access.redhat.com urls', () => {
    urls.forEach((url) => {
      expect(url).not.toContain('https://access.redhat.com/');
    });
  });
});
