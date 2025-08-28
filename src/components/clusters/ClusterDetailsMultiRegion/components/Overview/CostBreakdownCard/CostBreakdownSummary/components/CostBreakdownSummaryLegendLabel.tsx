import React from 'react';

import { ChartLabel } from '@patternfly/react-charts/victory';

type CostBreakdownSummaryLegendLabelProps = {
  values: string[];
  index: number;
  text: string;
} & React.ComponentProps<any>;

const CostBreakdownSummaryLegendLabel = ({
  values,
  index,
  text,
  ...props
}: CostBreakdownSummaryLegendLabelProps) => (
  <ChartLabel {...props} style={[{ fontWeight: 600 }, {}]} text={[values[index], text]} />
);

export default CostBreakdownSummaryLegendLabel;
