import React, { useCallback, useEffect, useMemo, useState } from 'react';

import { ChartDonutThreshold, ChartDonutUtilization } from '@patternfly/react-charts/victory';
import { Title } from '@patternfly/react-core';

import {
  humanizeValueWithUnit,
  roundValueWithUnit,
  Unit,
  ValueWithUnits,
} from '../../../../common/units';

type ClusterUtilizationChartProps = {
  title: string;
  used?: number;
  total?: number;
  unit?: string;
  humanize?: boolean;
  donutId: string;
  type: string;
};

function ClusterUtilizationChart({
  title,
  used,
  total,
  unit,
  humanize,
  donutId,
  type,
}: ClusterUtilizationChartProps) {
  const format = useMemo(() => (humanize ? humanizeValueWithUnit : roundValueWithUnit), [humanize]);
  const unitValue = useMemo(() => (unit ?? 'B') as Unit, [unit]);

  const [formattedUsed, setFormattedUsed] = useState<ValueWithUnits>();
  const [formattedTotal, setFormattedTotal] = useState<ValueWithUnits>();
  const [formattedUnused, setFormattedUnused] = useState<ValueWithUnits>();
  const [usedPercentage, setUsedPercentage] = useState<number>();

  const donutCenter = useMemo(
    () => ({
      primary: `${usedPercentage}%`,
      secondary: `of ${formattedTotal?.value} ${formattedTotal?.unit} used`,
    }),
    [formattedTotal?.unit, formattedTotal?.value, usedPercentage],
  );

  useEffect(() => {
    if (used && total && unitValue) {
      setFormattedUsed(format(used, unitValue));
      setFormattedTotal(format(total, unitValue));
      setFormattedUnused(format(total - used, unitValue));

      // Step 1: used / total * 100 - calculate "used" in percentage out of the total
      // Step 2: Math.round(Step1 * 100) / 100 - round to 2 decimal places
      setUsedPercentage(Math.round((used / total) * 100 * 100) / 100);
    } else {
      setFormattedUsed(format(0, unitValue));
      setFormattedTotal(format(0, unitValue));
      setFormattedUnused(format(0, unitValue));
      setUsedPercentage(0);
    }
  }, [used, total, format, unitValue]);

  const legendExtraProps = useMemo(
    () => ({
      labels: ({ datum }: any) => (datum.x ? `${datum.x}` : null),
      constrainToVisibleArea: true,
      legendData: [
        { name: `Used: ${formattedUsed?.value} ${formattedUsed?.unit}` },
        { name: `Available: ${formattedUnused?.value} ${formattedUnused?.unit}` },
      ],
      legendOrientation: 'vertical',
      padding: {
        bottom: 20,
        left: 20,
        right: 195, // Adjusted to accommodate legend
        top: 20,
      },
      height: 205,
      width: 410,
    }),
    [formattedUnused?.unit, formattedUnused?.value, formattedUsed?.unit, formattedUsed?.value],
  );

  const baseDonutUtilization = useCallback(
    (extraProps: any) => (
      <ChartDonutUtilization
        id={donutId}
        title={donutCenter.primary}
        subTitle={donutCenter.secondary}
        data={{ x: `${formattedUsed?.value} ${formattedUsed?.unit}`, y: usedPercentage }}
        thresholds={[{ value: 80 }, { value: 95 }]}
        {...extraProps}
      />
    ),
    [
      donutCenter.primary,
      donutCenter.secondary,
      donutId,
      formattedUsed?.unit,
      formattedUsed?.value,
      usedPercentage,
    ],
  );

  const DonutChartWithThresholdComponent = useCallback(
    () => (
      <div>
        <Title className="metrics-chart chart-title" headingLevel="h4" size="xl">
          {title}
        </Title>
        <div className="metrics-chart">
          <ChartDonutThreshold
            ariaDesc={title}
            data={[
              { x: '', y: 80 },
              { x: 'Warning at 80%', y: 95 },
              { x: 'Danger at 95%', y: 100 },
            ]}
            labels={({ datum }) => datum.x || null}
            height={185}
            width={185}
            subTitlePosition="bottom"
            padding={{ bottom: 24 }}
          >
            {baseDonutUtilization({})}
          </ChartDonutThreshold>
        </div>
      </div>
    ),
    [baseDonutUtilization, title],
  );

  const DonutChartWithLegendComponent = useCallback(
    () => (
      <div>
        <Title className="metrics-chart chart-title-with-legend" headingLevel="h4" size="xl">
          {title}
        </Title>
        <div className="metrics-chart chart-with-legend">
          {baseDonutUtilization(legendExtraProps)}
        </div>
      </div>
    ),
    [baseDonutUtilization, legendExtraProps, title],
  );

  switch (type) {
    case 'legend':
      return <DonutChartWithLegendComponent />;
    default:
      return <DonutChartWithThresholdComponent />;
  }
}

export default ClusterUtilizationChart;
