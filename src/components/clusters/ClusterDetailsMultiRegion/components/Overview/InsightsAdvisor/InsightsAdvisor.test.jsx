import React from 'react';

import { checkAccessibility, render, screen } from '~/testUtils';

import fixtures from '../../../__tests__/ClusterDetails.fixtures';

import Chart from './Chart';
import InsightsAdvisor from './InsightsAdvisor';

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

  it.skip('widget is accessible', async () => {
    /*
      This is skipped due to an issue within PatternFly Charts ChartLegend component.
      The basis of the problem is that the legend has links 
     
      The fix is in src/components/dashboard/InsightsAdvisorCard/ChartByGroups.jsx
      change the legendComponent prop to the ChartPie to  a custom component
      - aka do not use the ChartLegend component.
    
      */

    const { container } = render(
      <InsightsAdvisor insightsData={fixtures.insightsData} externalId="foo-bar" />,
    );
    await checkAccessibility(container);
  });

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
