import React from 'react';

import { ChartLegend } from '@patternfly/react-charts/victory';

import CostBreakdownSummaryLegendLabel from './CostBreakdownSummaryLegendLabel';

type CostBreakdownSummaryLegendProps = {
  values: string[];
};

const CostBreakdownSummaryLegend = ({ values }: CostBreakdownSummaryLegendProps) => (
  <ChartLegend
    gutter={25}
    itemsPerRow={2}
    labelComponent={<CostBreakdownSummaryLegendLabel dy={10} lineHeight={1.5} values={values} />}
    rowGutter={20}
  />
);

export default CostBreakdownSummaryLegend;
