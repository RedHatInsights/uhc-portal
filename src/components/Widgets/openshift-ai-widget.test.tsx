import React from 'react';

import { render, screen } from '~/testUtils';

import OpenShiftAiWidget from './openshift-ai-widget';

describe('OpenShiftAiWidget', () => {
  it('should render the description body text', () => {
    render(<OpenShiftAiWidget />);

    expect(
      screen.getByText(
        'Create, train, and serve artificial intelligence and machine learning (AI/ML) models.',
        { exact: false },
      ),
    ).toBeInTheDocument();
  });

  it('should render the "OpenShift AI" link with correct text', () => {
    render(<OpenShiftAiWidget />);

    expect(screen.getByText('OpenShift AI')).toBeInTheDocument();
  });

  it('should link to the correct external URL', () => {
    render(<OpenShiftAiWidget />);

    const link = screen.getByRole('link', { name: /OpenShift AI/i });
    expect(link).toHaveAttribute(
      'href',
      'https://www.redhat.com/en/technologies/cloud-computing/openshift/openshift-ai/trial',
    );
  });

  it('should open the link in a new tab', () => {
    render(<OpenShiftAiWidget />);

    const link = screen.getByRole('link', { name: /OpenShift AI/i });
    expect(link).toHaveAttribute('target', '_blank');
  });

  it('should have secure rel attributes on the external link', () => {
    render(<OpenShiftAiWidget />);

    const link = screen.getByRole('link', { name: /OpenShift AI/i });
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('should render as an anchor tag (not a router Link) since it is external', () => {
    render(<OpenShiftAiWidget />);

    const link = screen.getByRole('link', { name: /OpenShift AI/i });
    expect(link.tagName).toBe('A');
    expect(link).toHaveAttribute('href', expect.stringContaining('https://'));
  });
});
