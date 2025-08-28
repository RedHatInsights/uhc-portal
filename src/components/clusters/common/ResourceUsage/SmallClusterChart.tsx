import React, { useEffect, useMemo, useState } from 'react';

import { ChartDonut } from '@patternfly/react-charts/victory';

import {
  humanizeValueWithUnit,
  roundValueWithUnit,
  Unit,
  ValueWithUnits,
} from '../../../../common/units';

import './SmallClusterChart.scss';

type SmallClusterChartProps = {
  used?: number;
  total?: number;
  unit?: Unit;
  availableTitle?: string;
  usedTitle?: string;
  humanize?: boolean;
  donutId: string;
};

const SmallClusterChart = ({
  used,
  total,
  unit,
  humanize,
  donutId,
  usedTitle,
  availableTitle,
}: SmallClusterChartProps) => {
  const format = useMemo(() => (humanize ? humanizeValueWithUnit : roundValueWithUnit), [humanize]);
  const unitValue = useMemo(() => (unit ?? 'B') as Unit, [unit]);

  const [formattedUsed, setFormattedUsed] = useState<ValueWithUnits>();
  const [formattedTotal, setFormattedTotal] = useState<ValueWithUnits>();
  const [formattedUnused, setFormattedUnused] = useState<ValueWithUnits>();
  const [usedPercentage, setUsedPercentage] = useState<number>();
  const [unusedPrecentage, setUnusedPrecentage] = useState<number>();

  useEffect(() => {
    if (used && total && unitValue) {
      setFormattedUsed(format(used, unitValue));
      setFormattedTotal(format(total, unitValue));
      setFormattedUnused(format(total - used, unitValue));

      // Step 1: used / total * 100 - calculate "used" in percentage out of the total
      // Step 2: Math.round(Step1 * 100) / 100 - round to 2 decimal places
      setUsedPercentage(Math.round((used / total) * 100 * 100) / 100);
      setUnusedPrecentage(Math.round(((total - used) / total) * 100 * 100) / 100);
    } else {
      setFormattedUsed(format(0, unitValue));
      setFormattedTotal(format(0, unitValue));
      setFormattedUnused(format(0, unitValue));
      setUsedPercentage(0);
      setUnusedPrecentage(0);
    }
  }, [used, total, unitValue, format]);

  return (
    <div>
      <div className="small-donut-chart-container">
        {formattedUnused && formattedUsed && formattedUsed ? (
          <ChartDonut
            name={donutId}
            labels={({ datum }) => `${datum.x}`}
            data={[
              { x: `${formattedUsed?.value} ${formattedUsed?.unit}`, y: usedPercentage },
              { x: `${formattedUnused?.value} ${formattedUnused?.unit}`, y: unusedPrecentage },
            ]}
            constrainToVisibleArea
            legendData={[
              { name: `${usedTitle}: ${formattedUsed?.value} ${formattedUsed?.unit}` },
              { name: `${availableTitle}: ${formattedUnused?.value} ${formattedUnused?.unit}` },
            ]}
            legendOrientation="vertical"
            padding={{
              bottom: 20,
              left: 20,
              right: 195, // Adjusted to accommodate legend
              top: 20,
            }}
            title={`${formattedTotal?.value}`}
            height={205}
            width={440}
          />
        ) : null}
      </div>
    </div>
  );
};

export default SmallClusterChart;
