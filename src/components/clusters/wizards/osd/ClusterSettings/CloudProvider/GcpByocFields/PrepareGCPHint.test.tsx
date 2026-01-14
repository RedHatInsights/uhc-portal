import React from 'react';

import { checkAccessibility, render, screen } from '~/testUtils';

import { PrepareGCPHint } from './PrepareGCPHint';

const defaultProps = {
  title: 'Test Title',
  text: 'This is test text for the hint component',
  linkHref: 'https://example.com',
  linkText: 'Learn more',
};

describe('<PrepareGCPHint />', () => {
  it('is accessible', async () => {
    const { container } = render(<PrepareGCPHint {...defaultProps} />);

    await checkAccessibility(container);
  });

  it('displays the correct title and text', () => {
    render(<PrepareGCPHint {...defaultProps} />);

    expect(screen.getByText(defaultProps.title)).toBeInTheDocument();
    expect(screen.getByText(defaultProps.text)).toBeInTheDocument();
  });
});
