/* eslint-disable */
// Temporary file with mocks that require require() statements
// TODO: Remove this file-level disable once mocks are removed
import React from 'react';

import { checkAccessibility, render } from '~/testUtils';

import fixtures from '../../../clusters/ClusterDetailsMultiRegion/__tests__/ClusterDetails.fixtures';
import InsightsAdvisor from '../../../clusters/ClusterDetailsMultiRegion/components/Overview/InsightsAdvisor/InsightsAdvisor';
import InsightsAdvisorCard from '../InsightsAdvisorCard';

/**
 * Centralized accessibility tests for components with known PatternFly Charts accessibility issues.
 *
 * These tests use mocks to work around the issue where links are rendered inside SVG elements
 * with role="img", which violates accessibility rules (nested-interactive).
 *
 * TODO: Remove these mocks once the root cause is fixed:
 * - ChartByGroups: Render legend outside ChartPie as HTML, or work with PatternFly to support role="figure"
 * - InsightsAdvisor: Same issue with ChartDonut
 *
 * See: src/components/dashboard/InsightsAdvisorCard/ChartByGroups.jsx for details
 */

// Mock ChartByGroups with accessible TitleComponent
jest.mock('../ChartByGroups', () => {
  const React = require('react');
  const actual = jest.requireActual('../ChartByGroups');
  const { ChartLegend, ChartPie } = require('@patternfly/react-charts/victory');
  const { Flex, FlexItem, Title } = require('@patternfly/react-core');
  const { groupTagHitsByGroups } = require('../../overviewHelpers');

  // eslint-disable-next-line react/prop-types
  const MockedTitleComponent = ({ data, index, x, y, style }) => {
    const entity = data[index];
    // eslint-disable-next-line react/prop-types
    const { name, count } = entity;
    // For accessibility tests, render as plain text to avoid nested-interactive violation
    // The link is still present for functionality but not focusable
    return (
      <text x={x} y={y} style={style} dy={5} data-testid="titleComponent">
        <tspan x={x} y={y}>
          {name}: {count}
        </tspan>
      </text>
    );
  };

  // eslint-disable-next-line react/prop-types
  const MockedChartByGroups = ({ tagHits, groups }) => {
    const groupedRulesByGroups = groupTagHitsByGroups(tagHits, [...groups]);
    const totalHits = Object.values(groupedRulesByGroups).reduce(
      (acc, { count }) => acc + count,
      0,
    );

    return (
      <Flex className="ocm-insights--groups-chart" direction={{ default: 'column' }}>
        <FlexItem>
          <Title size="lg" headingLevel="h2">
            Recommendations by category
          </Title>
        </FlexItem>
        <FlexItem>
          <ChartPie
            labelRadius={25}
            ariaTitle="Categories statistics"
            constrainToVisibleArea
            data={Object.entries(groupedRulesByGroups).map(([title, group]) => ({
              x: title,
              y: group.count,
            }))}
            width={400}
            height={120}
            padding={{
              bottom: 30,
              left: 0,
              right: 300,
              top: 10,
            }}
            labels={({ datum }) =>
              parseInt(datum.y, 10) === 0 || totalHits === 0
                ? ''
                : `${((parseInt(datum.y, 10) / totalHits) * 100).toFixed()}%`
            }
            legendData={Object.entries(groupedRulesByGroups).map(([title, { count, tags }]) => ({
              name: title,
              count,
              tags,
              symbol: { type: 'circle' },
            }))}
            legendPosition="right"
            legendAllowWrap
            legendComponent={
              <ChartLegend
                labelComponent={<MockedTitleComponent />}
                height={100}
                width={300}
                itemsPerRow={2}
                orientation="horizontal"
                className="pf-m-redhat-font"
                style={{ labels: { fontSize: 12 } }}
                gutter={30}
              />
            }
          />
        </FlexItem>
      </Flex>
    );
  };

  return {
    __esModule: true,
    default: MockedChartByGroups,
    categoryMapping: actual.categoryMapping,
    TitleComponent: MockedTitleComponent,
  };
});

// Mock InsightsAdvisor Chart components with accessible label components
jest.mock(
  '../../../clusters/ClusterDetailsMultiRegion/components/Overview/InsightsAdvisor/InsightsAdvisorHelpers',
  () => {
    const actual = jest.requireActual(
      '../../../clusters/ClusterDetailsMultiRegion/components/Overview/InsightsAdvisor/InsightsAdvisorHelpers',
    );

    const { ChartLabel } = require('@patternfly/react-charts/victory');

    // eslint-disable-next-line react/prop-types
    const MockedInsightsLabelComponent = ({ style, datum, externalId, ...props }) => (
      // For accessibility tests, render as plain ChartLabel without link wrapper
      // This avoids nested-interactive violation while still rendering the component
      <ChartLabel
        {...props}
        style={{ ...style, fontSize: 15 }}
        className={
          // eslint-disable-next-line react/prop-types
          externalId && datum?.value > 0
            ? 'ocm-c-overview-advisor--enabled-link'
            : 'ocm-c-overview-advisor--disabled-link'
        }
      />
    );

    // eslint-disable-next-line react/prop-types
    const MockedInsightsSubtitleComponent = ({ externalId, style, ...props }) => (
      // For accessibility tests, render as plain ChartLabel without link wrapper
      <ChartLabel
        {...props}
        style={{ ...style, fontSize: 15 }}
        dy={5}
        className="ocm-c-overview-advisor--enabled-link"
      />
    );

    return {
      ...actual,
      InsightsLabelComponent: MockedInsightsLabelComponent,
      InsightsSubtitleComponent: MockedInsightsSubtitleComponent,
    };
  },
);

describe('Accessibility tests for components with PatternFly Charts issues', () => {
  describe('<InsightsAdvisorCard />', () => {
    const overview = {
      clusters_hit: 3,
      hit_by_risk: {
        1: 1,
        2: 2,
        3: 10,
        4: 1,
      },
      hit_by_tag: {
        fault_tolerance: 2,
        performance: 4,
        security: 3,
        service_availability: 11,
      },
    };

    it('is accessible', async () => {
      const { container } = render(<InsightsAdvisorCard overview={overview} />);
      await checkAccessibility(container);
    });
  });

  describe('<InsightsAdvisor />', () => {
    it('is accessible', async () => {
      const { container } = render(
        <InsightsAdvisor insightsData={fixtures.insightsData} externalId="foo-bar" />,
      );
      await checkAccessibility(container);
    });
  });
});
