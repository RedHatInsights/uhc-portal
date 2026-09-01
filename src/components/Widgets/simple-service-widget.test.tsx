import React from 'react';

import { render, screen } from '~/testUtils';

import { SimpleServiceWidget } from './simple-service-widget';

describe('SimpleServiceWidget', () => {
  const defaultProps = {
    body: 'Test widget body text',
    linkTitle: 'Test Link',
    url: '/test-url',
  };

  it('should render the body text', () => {
    render(<SimpleServiceWidget {...defaultProps} />);
    expect(screen.getByText(/Test widget body text/)).toBeInTheDocument();
  });

  it('should render an internal link with the link title when isExternal is not set', () => {
    render(<SimpleServiceWidget {...defaultProps} />);
    const link = screen.getByRole('link', { name: /Test Link/ });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('href', '/test-url');
    expect(link).not.toHaveAttribute('target', '_blank');
  });

  it('should render an external link when isExternal is true', () => {
    const externalProps = {
      ...defaultProps,
      url: 'https://example.com/external',
      isExternal: true,
    };
    render(<SimpleServiceWidget {...externalProps} />);
    const link = screen.getByRole('link', { name: /Test Link/ });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('href', 'https://example.com/external');
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('should include accessible text when link is external', () => {
    const externalProps = {
      ...defaultProps,
      url: 'https://example.com/external',
      isExternal: true,
    };
    render(<SimpleServiceWidget {...externalProps} />);
    expect(screen.getByRole('link', { name: /opens new tab/i })).toBeInTheDocument();
  });
});
