import React from 'react';

import { Content, ContentVariants, Grid, GridItem, Skeleton, Title } from '@patternfly/react-core';

import { PromiseReducerState } from '~/redux/stateTypes';

import { Report } from './models/Report';
import CostSummaryClusters from './CostSummaryClusters';
import { getTotal } from './CostSummaryHelper';

import './CostCard.scss';

type CostSummaryProps = {
  report: PromiseReducerState<Report>;
};

const CostSummary = ({ report }: CostSummaryProps) =>
  !report.fulfilled ? (
    <Skeleton fontSize="md" screenreaderText="Loading..." />
  ) : (
    <Grid hasGutter>
      <GridItem lg={5} md={12}>
        <Title className="ocm--cost-total" size="2xl" headingLevel="h2">
          {getTotal(report)}
        </Title>
        <span className="ocm--cost-total__desc">Month-to-date cost</span>
      </GridItem>
      <GridItem lg={7} md={12}>
        <div className="ocm--cost-clusters">
          <Content>
            <Content
              component={ContentVariants.p}
              key="top-clusters"
              className="ocm--cost-card__title"
            >
              Top clusters
            </Content>
            <Content component={ContentVariants.dl}>
              <CostSummaryClusters report={report as Report} />
            </Content>
          </Content>
        </div>
      </GridItem>
    </Grid>
  );

export default CostSummary;
