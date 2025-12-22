import React from 'react';
import PropTypes from 'prop-types';

import { ChartLegend, ChartPie } from '@patternfly/react-charts/victory';
import { Flex, FlexItem, Title } from '@patternfly/react-core';

import { advisorBaseName } from '~/common/routing';

import { groupTagHitsByGroups } from '../overviewHelpers';

export const categoryMapping = {
  service_availability: 1,
  performance: 2,
  fault_tolerance: 3,
  security: 4,
};

/* PF's ChartLabel doesn't allow to create a link from the part of the label,
   thus, the custom title component is used 

   TODO: This needs to be fixed!  The reason that PF won't allow links in the legend is that is an accessibility issues
   There are two approaches:
     1.  Render the legend outside of the ChartPie as a separate component
     2.  Work with the PatternFly team to allow for role="figure" to be passed as a prop in ChartPie (figures allow for nested links)
*/
export const TitleComponent = ({ data, index, x, y, style }) => {
  const entity = data[index];
  const { name, count, tags } = entity;

  return (
    <text x={x} y={y} style={style} dy={5} data-testid="titleComponent">
      <tspan x={x} y={y}>
        {name}:{' '}
        <a
          href={`${advisorBaseName}/recommendations?category=${categoryMapping[tags]}`}
          className="enabled-link"
          data-testid={tags}
        >
          {count}
        </a>
      </tspan>
    </text>
  );
};

// NOTE this data is automatically passed in by the PF labelComponent prop
TitleComponent.propTypes = {
  data: PropTypes.array,
  index: PropTypes.number,
  x: PropTypes.number,
  y: PropTypes.number,
  style: PropTypes.object,
};

const ChartByGroups = ({ tagHits, groups }) => {
  const groupedRulesByGroups = groupTagHitsByGroups(tagHits, [...groups]);
  const totalHits = Object.values(groupedRulesByGroups).reduce((acc, { count }) => acc + count, 0);

  return (
    <Flex className="ocm-insights--groups-chart" direction={{ default: 'column' }}>
      <FlexItem>
        <Title size="lg" headingLevel="h2">
          Recommendations by category
        </Title>
      </FlexItem>
      <FlexItem>
        <ChartPie
          role="figure" // This does't work - it is ignored by PatternFly but would fix accessibility issues.
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
            right: 300, // Adjusted to accommodate legend
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
              labelComponent={<TitleComponent />}
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

ChartByGroups.propTypes = {
  tagHits: PropTypes.object.isRequired,
  groups: PropTypes.array.isRequired,
};

export default ChartByGroups;
