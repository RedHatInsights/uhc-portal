import React from 'react';

import { render, screen } from '~/testUtils';

import Chart from './Chart';

// Note: These tests throw a warning that the prop datum is required by the InsightsLabelComponent
// but when it is called inside the Chart component, it does not contain a datum prop

describe('<InsightsAdvisor />', () => {
  const props = {
    entries: [
      ['1', 0],
      ['2', 1],
      ['3', 0],
      ['4', 2],
    ],
    issueCount: 3,
    externalId: 'foo-bar',
  };

  // Accessibility test moved to centralized file:
  // src/components/dashboard/InsightsAdvisorCard/__tests__/accessibility.test.jsx
  // This test uses mocks to work around PatternFly Charts accessibility issues
  // where links are rendered inside SVG elements with role="img"

  it('should show 3 issues in total', () => {
    render(<Chart {...props} issueCount={44} />);
    expect(screen.getByText('44')).toBeInTheDocument();
  });

  it('should render title links to OCP Advisor', () => {
    const { container } = render(<Chart {...props} />);
    expect(
      container.querySelector(
        'a[href="/openshift/insights/advisor/clusters/foo-bar?total_risk=1"]',
      ),
    ).toBeInTheDocument();
    expect(
      container.querySelector(
        'a[href="/openshift/insights/advisor/clusters/foo-bar?total_risk=2"]',
      ),
    ).toBeInTheDocument();
    expect(
      container.querySelector(
        'a[href="/openshift/insights/advisor/clusters/foo-bar?total_risk=3"]',
      ),
    ).toBeInTheDocument();

    expect(
      container.querySelector(
        'a[href="/openshift/insights/advisor/clusters/foo-bar?total_risk=4"]',
      ),
    ).toBeInTheDocument();
  });

  it('should render sub-title link to OCP Advisor', () => {
    const { container } = render(<Chart {...props} />);
    expect(
      container.querySelector('a[href="/openshift/insights/advisor/clusters/foo-bar"]'),
    ).toBeInTheDocument();
  });
});
