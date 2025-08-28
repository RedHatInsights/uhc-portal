import { channels, tools, urls } from '~/common/installLinks.mjs';
import { render } from '~/testUtils';

import { downloadChoice } from '../downloadChoice';

describe('downloadChoice', () => {
  describe('tools have url for downloadChoice', () => {
    // For this test we only want the button from the last cell.
    Object.values(tools).forEach((tool) => {
      const selections = {};
      const setSelections = () => {};
      const chooser = downloadChoice(selections, setSelections, urls, tool, channels.STABLE, {
        text: 'Download',
      });

      if (urls[tool]) {
        // skip tools that have no data yet
        it(`initially ${tool} button has a url`, () => {
          const { getByRole } = render(chooser.downloadButton);

          const downloadButton = getByRole('link');
          expect(downloadButton).toHaveAttribute('href', expect.stringMatching(/.+/));
        });
      }
    });
  });

  describe('oc tool downloads', () => {
    // For this test we only want the button from the last cell.
    const tool = tools.OC;

    const setSelections = () => {};
    it.each([
      ['rhel8 x86', { oc: { OS: 'rhel-8', architecture: 'x86' } }],
      ['rhel9 x86', { oc: { OS: 'rhel-9', architecture: 'x86' } }],
      ['rhel8 ppc', { oc: { OS: 'rhel-8', architecture: 'ppc' } }],
      ['rhel9 ppc', { oc: { OS: 'rhel-9', architecture: 'ppc' } }],
      ['rhel8 s390', { oc: { OS: 'rhel-8', architecture: 's390x' } }],
      ['rhel9 s390', { oc: { OS: 'rhel-9', architecture: 's390x' } }],
      ['rhel8 arm', { oc: { OS: 'rhel-8', architecture: 'arm' } }],
      ['rhel9 arm', { oc: { OS: 'rhel-9', architecture: 'arm' } }],
    ])('"%s" oc download has link', (desc, selections) => {
      const chooser = downloadChoice(selections, setSelections, urls, tool, channels.STABLE, {
        text: 'Download',
      });
      expect(chooser.osDropdown).toBeDefined();
      expect(chooser.archDropdown).toBeDefined();
      expect(chooser.downloadButton).toBeDefined();

      const { getByRole } = render(chooser.downloadButton);

      const downloadButton = getByRole('link');
      expect(downloadButton).toHaveAttribute('href', expect.stringMatching(/.+/));
    });
  });

  describe('opm tool downloads', () => {
    // For this test we only want the button from the last cell.
    const tool = tools.OPM;
    const setSelections = () => {};
    it.each([
      ['rhel8 x86', { opm: { OS: 'rhel-8', architecture: 'x86' } }],
      ['rhel9 x86', { opm: { OS: 'rhel-9', architecture: 'x86' } }],
      ['rhel8 ppc', { opm: { OS: 'rhel-8', architecture: 'ppc' } }],
      ['rhel9 ppc', { opm: { OS: 'rhel-9', architecture: 'ppc' } }],
      ['rhel8 s390', { opm: { OS: 'rhel-8', architecture: 's390x' } }],
      ['rhel9 s390', { opm: { OS: 'rhel-9', architecture: 's390x' } }],
      ['rhel8 arm', { opm: { OS: 'rhel-8', architecture: 'arm' } }],
      ['rhel9 arm', { opm: { OS: 'rhel-9', architecture: 'arm' } }],
    ])('"%s" opm download has link', (desc, selections) => {
      const chooser = downloadChoice(selections, setSelections, urls, tool, channels.STABLE, {
        text: 'Download',
      });
      expect(chooser.osDropdown).toBeDefined();
      expect(chooser.archDropdown).toBeDefined();
      expect(chooser.downloadButton).toBeDefined();

      const { getByRole } = render(chooser.downloadButton);

      const downloadButton = getByRole('link');
      expect(downloadButton).toHaveAttribute('href', expect.stringMatching(/.+/));
    });
  });
});
