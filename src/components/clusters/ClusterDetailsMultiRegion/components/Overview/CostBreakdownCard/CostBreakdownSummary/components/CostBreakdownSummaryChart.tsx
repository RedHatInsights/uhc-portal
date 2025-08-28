import React from 'react';

import { ChartPie } from '@patternfly/react-charts/victory';

import { Report } from '~/components/dashboard/CostCard/models/Report';

import { formatCurrency } from '../utils/CostBreakdownSummaryUtils';

import CostBreakdownSummaryLegend from './CostBreakdownSummaryLegend';

type CostBreakdownSummaryChartProps = {
  report: Report;
  height: number;
  width: number;
};

const RAW_LABEL = 'Raw cost';
const MARKUP_LABEL = 'Markup';
const USAGE_LABEL = 'Usage cost';

const CostBreakdownSummaryChart = ({ report, height, width }: CostBreakdownSummaryChartProps) => {
  const reportCost = report?.meta?.total?.cost;

  const markupUnits = reportCost?.markup?.units ?? 'USD';
  const rawUnits = reportCost?.raw?.units ?? 'USD';
  const usageUnits = reportCost?.usage?.units ?? 'USD';

  const markupValue = reportCost?.markup?.value ?? 0;
  const rawValue = reportCost?.raw?.value ?? 0;
  const usageValue = reportCost?.usage?.value ?? 0;

  const markup = formatCurrency(markupValue, markupUnits);
  const raw = formatCurrency(rawValue, rawUnits);
  const usage = formatCurrency(usageValue, usageUnits);

  return (
    <ChartPie
      ariaDesc="Cost breakdown"
      constrainToVisibleArea
      data={[
        { x: RAW_LABEL, y: rawValue, units: rawUnits },
        { x: MARKUP_LABEL, y: markupValue, units: markupUnits },
        { x: USAGE_LABEL, y: usageValue, units: usageUnits },
      ]}
      height={height}
      labels={({ datum }) => `${datum.x}: ${formatCurrency(datum.y, datum.units)}`}
      legendComponent={<CostBreakdownSummaryLegend values={[raw, markup, usage]} />}
      legendData={[
        {
          name: RAW_LABEL,
        },
        {
          name: MARKUP_LABEL,
        },
        {
          name: USAGE_LABEL,
        },
      ]}
      legendOrientation="vertical"
      legendPosition="right"
      padding={{
        bottom: 30,
        left: 0,
        right: 225, // Adjusted to accommodate legend
        top: 30,
      }}
      legendAllowWrap
      width={width}
    />
  );
};

export default CostBreakdownSummaryChart;
