import React from 'react';

import { checkAccessibility, render, screen } from '~/testUtils';
import { ErrorState } from '~/types/types';

import CopyPullSecret from '../CopyPullSecret';

const variants: ('link-tooltip' | 'link-inplace')[] = ['link-tooltip', 'link-inplace'];

describe('<CopyPullSecret />', () => {
  const token = { auths: { foo: 'bar' } };
  const errorToken: ErrorState = {
    error: true,
    pending: false,
    fulfilled: false,
  };

  describe.each(variants)('with token and variant %s', (variant) => {
    it('is accessible', async () => {
      const { container } = render(<CopyPullSecret variant={variant} token={token} />);
      await checkAccessibility(container);
    });

    it('displays an enabled copy button', () => {
      render(<CopyPullSecret variant={variant} token={token} />);
      expect(screen.getByRole('button', { name: 'Copy pull secret' })).not.toHaveAttribute(
        'aria-disabled',
      );
    });
  });

  describe.each(variants)('with error and variant %s', (variant) => {
    it('is accessible', async () => {
      const { container } = render(<CopyPullSecret variant={variant} token={errorToken} />);
      await checkAccessibility(container);
    });

    it('displays an disabled copy button', () => {
      render(<CopyPullSecret variant={variant} token={errorToken} />);
      expect(screen.getByRole('button', { name: 'Copy pull secret' })).toHaveAttribute(
        'aria-disabled',
        'true',
      );
    });
  });
});
