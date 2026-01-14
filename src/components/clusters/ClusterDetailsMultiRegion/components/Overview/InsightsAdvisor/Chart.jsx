import React from 'react';
import PropTypes from 'prop-types';

import { ChartDonut, ChartLegend } from '@patternfly/react-charts/victory';

import {
  chartColorScale,
  InsightsLabelComponent,
  InsightsLegendIconComponent,
  InsightsSubtitleComponent,
  InsightsTitleComponent,
  riskLabels,
} from './InsightsAdvisorHelpers';

const Chart = ({ entries, issueCount, externalId }) => (
  <ChartDonut
    data={entries.map(([k, v]) => ({
      label: `${riskLabels[k]} ${v}`,
      x: k,
      y: v,
    }))}
    title={`${issueCount}`}
    ariaTitle={`Chart number of issues: ${issueCount}`}
    titleComponent={<InsightsTitleComponent style={{}} />}
    subTitle={`Total ${issueCount === 1 ? 'issue' : 'issues'}`}
    subTitleComponent={<InsightsSubtitleComponent externalId={externalId} style={{}} />}
    legendData={entries.map(([k, v]) => ({ name: `${v} ${riskLabels[k]}` }))}
    legendOrientation="vertical"
    legendPosition="right"
    constrainToVisibleArea
    width={350}
    height={200}
    colorScale={chartColorScale}
    legendComponent={
      <ChartLegend
        data={entries.map(([k, v]) => ({
          name: `${v} ${riskLabels[k]}`,
          id: k,
          value: v,
        }))}
        labelComponent={<InsightsLabelComponent externalId={externalId} style={{}} />}
        dataComponent={<InsightsLegendIconComponent />}
        x={200}
      />
    }
    radius={80}
    padAngle={0}
    padding={{
      bottom: 0,
      left: 10,
      right: 170, // Adjusted to accommodate legend
      top: 20,
    }}
  />
);

export default Chart;

Chart.propTypes = {
  entries: PropTypes.array.isRequired,
  issueCount: PropTypes.number.isRequired,
  externalId: PropTypes.string.isRequired,
};
