import React, { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';

import { Card, CardBody, CardFooter, CardTitle, Title } from '@patternfly/react-core';

import { ocmBaseName } from '~/common/routing';
import { getReport, getSources } from '~/redux/actions/costActions';
import { useGlobalState } from '~/redux/hooks';
import { PromiseReducerState } from '~/redux/state';

import { Report } from './models/Report';
import CostEmptyState from './CostEmptyState';
import CostSummary from './CostSummary';

import './CostCard.scss';

const CostCard = () => {
  const { report, sources } = useGlobalState((state) => state.cost);
  const [hasSources, setHasSources] = useState<boolean>();
  const [showCostSummary, setShowCostSummary] = useState<boolean>();
  const [showFooter, setShowFooter] = useState<boolean>();

  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(getReport());
    dispatch(getSources({ type: 'OCP' }));
  }, [dispatch]);

  useEffect(() => {
    setHasSources(sources?.meta && sources.meta.count !== 0);
  }, [sources?.meta]);

  useEffect(() => {
    setShowCostSummary(hasSources || !sources?.fulfilled);
  }, [hasSources, sources?.fulfilled]);

  useEffect(() => {
    setShowFooter(hasSources && report.fulfilled);
  }, [hasSources, report.fulfilled]);

  return (
    <Card className="ocm--cost-card">
      <CardTitle>
        <Title size="lg" headingLevel="h2">
          Cost Management
        </Title>
      </CardTitle>

      <CardBody className="ocm--cost-card__body">
        {showCostSummary ? (
          <CostSummary report={report as PromiseReducerState<Report>} />
        ) : (
          <CostEmptyState />
        )}
      </CardBody>

      {showFooter ? (
        <CardFooter>
          <a href={`${ocmBaseName}/cost-management`}>View more in Cost management</a>
        </CardFooter>
      ) : null}
    </Card>
  );
};

export default CostCard;
