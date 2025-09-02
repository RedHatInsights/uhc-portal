import React from 'react';
import { PropTypes } from 'prop-types';

import { ChartLabel } from '@patternfly/react-charts/victory';
import { AngleDoubleDownIcon } from '@patternfly/react-icons/dist/esm/icons/angle-double-down-icon';
import { AngleDoubleUpIcon } from '@patternfly/react-icons/dist/esm/icons/angle-double-up-icon';
import { EqualsIcon } from '@patternfly/react-icons/dist/esm/icons/equals-icon';
import { t_global_icon_color_severity_critical_default as critical } from '@patternfly/react-tokens/dist/esm/t_global_icon_color_severity_critical_default';
import { t_global_icon_color_severity_important_default as important } from '@patternfly/react-tokens/dist/esm/t_global_icon_color_severity_important_default';
import { t_global_icon_color_severity_minor_default as low } from '@patternfly/react-tokens/dist/esm/t_global_icon_color_severity_minor_default';
import { t_global_icon_color_severity_moderate_default as moderate } from '@patternfly/react-tokens/dist/esm/t_global_icon_color_severity_moderate_default';

import { advisorBaseName } from '~/common/routing';

import CriticalIcon from './CriticalIcon';

const riskLabels = {
  1: 'Low',
  2: 'Moderate',
  3: 'Important',
  4: 'Critical',
};

const riskIcons = {
  1: AngleDoubleDownIcon,
  2: EqualsIcon,
  3: AngleDoubleUpIcon,
  4: CriticalIcon,
};

const legendColorScale = {
  1: low.value,
  2: moderate.value,
  3: important.value,
  4: critical.value,
};

const chartColorScale = [critical.value, important.value, moderate.value, low.value];

const InsightsTitleComponent = ({ style, ...props }) => (
  <ChartLabel {...props} style={{ ...style, fontSize: 30, fontWeight: 'bold' }} />
);

const InsightsLabelComponent = ({ style, ...props }) => {
  const { datum, externalId } = props;
  const link = `${advisorBaseName}/clusters/${externalId}?total_risk=${datum.id}`;

  return (
    <a href={link}>
      <ChartLabel
        {...props}
        style={{ ...style, fontSize: 15 }}
        className={
          externalId && datum?.value > 0
            ? 'ocm-c-overview-advisor--enabled-link'
            : 'ocm-c-overview-advisor--disabled-link'
        }
      />
    </a>
  );
};

const InsightsLegendIconComponent = ({ x, y, datum }) => {
  const Icon = riskIcons[datum.id];

  return <Icon x={x - 5} y={y - 7} fill={legendColorScale[datum.id]} />;
};

const InsightsSubtitleComponent = ({ externalId, style, ...props }) => {
  const link = `${advisorBaseName}/clusters/${externalId}`;

  return (
    <a href={link}>
      <ChartLabel
        {...props}
        style={{ ...style, fontSize: 15 }}
        dy={5}
        className="ocm-c-overview-advisor--enabled-link"
      />
    </a>
  );
};

InsightsSubtitleComponent.propTypes = {
  externalId: PropTypes.string.isRequired,
  style: PropTypes.object.isRequired,
};

InsightsLabelComponent.propTypes = {
  datum: PropTypes.shape({ value: PropTypes.number, id: PropTypes.string }),
  externalId: PropTypes.string.isRequired,
  style: PropTypes.object.isRequired,
};

InsightsTitleComponent.propTypes = {
  style: PropTypes.object.isRequired,
};

InsightsLegendIconComponent.propTypes = {
  x: PropTypes.number,
  y: PropTypes.number,
  datum: PropTypes.shape({ id: PropTypes.string }),
};

export {
  riskLabels,
  riskIcons,
  legendColorScale,
  chartColorScale,
  InsightsLegendIconComponent,
  InsightsTitleComponent,
  InsightsLabelComponent,
  InsightsSubtitleComponent,
};
