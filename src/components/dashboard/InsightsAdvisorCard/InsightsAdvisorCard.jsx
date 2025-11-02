import React from 'react';
import PropTypes from 'prop-types';

import { Card, CardBody } from '@patternfly/react-core';

import { advisorBaseName } from '~/common/routing';

import { INSIGHTS_RULE_CATEGORIES } from '../../clusters/ClusterDetailsMultiRegion/components/Insights/InsightsConstants';

import AdvisorEmptyState from './AdvisorEmptyState';
import ChartByGroups from './ChartByGroups';
import ChartByRisks from './ChartByRisks';

import './InsightsAdvisorCard.scss';

const InsightsAdvisorCard = ({ overview }) => (
  <Card className="ocm-insights--advisor-card" ouiaId="insightsAdvisor">
    <CardBody className="ocm-insights--advisor-card__body">
      {!overview.clusters_hit || overview.clusters_hit === 0 ? (
        <AdvisorEmptyState />
      ) : (
        <>
          <ChartByRisks riskHits={overview.hit_by_risk} />
          <ChartByGroups tagHits={overview.hit_by_tag} groups={INSIGHTS_RULE_CATEGORIES} />
          <a href={advisorBaseName} style={{ marginTop: '1rem' }}>
            View more in Red Hat Lightspeed advisor
          </a>
        </>
      )}
    </CardBody>
  </Card>
);

export default InsightsAdvisorCard;

InsightsAdvisorCard.propTypes = {
  overview: PropTypes.object.isRequired,
};
