import React from 'react';

import { checkAccessibility, render, screen } from '~/testUtils';

import {
  ExcludeNamespaceSelectorsHelpText,
  ExcludeNamespaceSelectorsPopover,
} from './ExcludeNamespaceSelectorsPopover';

describe('ExcludeNamespaceSelectorsPopover', () => {
  describe('ExcludeNamespaceSelectorsHelpText', () => {
    it('matches the inline helper copy used under the field', () => {
      expect(ExcludeNamespaceSelectorsHelpText).toBe(
        'Namespaces matching any of these label selectors will be excluded from the default ingress controller.',
      );
    });
  });

  describe('<ExcludeNamespaceSelectorsPopover />', () => {
    it('is accessible when the popover is open', async () => {
      const { baseElement, user } = render(<ExcludeNamespaceSelectorsPopover />);

      await user.click(screen.getByRole('button', { name: 'More information' }));
      expect(await screen.findByRole('dialog')).toBeInTheDocument();

      await checkAccessibility(baseElement);
    });

    it('opens a popover with the expected title and guidance', async () => {
      const { user } = render(<ExcludeNamespaceSelectorsPopover />);

      await user.click(screen.getByRole('button', { name: 'More information' }));
      const dialog = await screen.findByRole('dialog');

      expect(dialog).toHaveTextContent('Exclude namespace selectors');
      expect(dialog).toHaveTextContent(/Add one or more label selectors/);
      expect(dialog).toHaveTextContent(/comma-separated list/);
      expect(dialog).toHaveTextContent(/finance,HR,legal/);
      expect(dialog).toHaveTextContent(/default ingress controller/);
    });
  });
});
