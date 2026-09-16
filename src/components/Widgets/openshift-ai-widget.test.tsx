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

    expect(screen.getByRole('link', { name: /OpenShift AI/i })).toBeInTheDocument();
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

  it('should include accessible text that the link opens a new tab', () => {
    render(<OpenShiftAiWidget />);

    expect(screen.getByRole('link', { name: /opens new tab/i })).toBeInTheDocument();
  });
});
