import React from 'react';

import { render, screen } from '~/testUtils';

import { SimpleServiceWidget } from './simple-service-widget';

describe('SimpleServiceWidget', () => {
  const defaultProps = {
    id: 1,
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
    expect(link).toHaveAttribute('href', expect.stringContaining('/test-url'));
    // Internal links should not open in a new tab
    expect(link).not.toHaveAttribute('target', '_blank');
  });

  it('should render an external anchor tag when isExternal is true', () => {
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

  it('should render the link title text in the footer', () => {
    render(<SimpleServiceWidget {...defaultProps} />);
    expect(screen.getByText('Test Link')).toBeInTheDocument();
  });

  it('should use isExternal=false by default', () => {
    render(<SimpleServiceWidget {...defaultProps} />);
    const link = screen.getByRole('link', { name: /Test Link/ });
    // When isExternal is not set, it should render as a react-router Link (no target="_blank")
    expect(link).not.toHaveAttribute('target');
    // And the href should contain the internal URL path
    expect(link).toHaveAttribute('href', expect.stringContaining('/test-url'));
  });
});
