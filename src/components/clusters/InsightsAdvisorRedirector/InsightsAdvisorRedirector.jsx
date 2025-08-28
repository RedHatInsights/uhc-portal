import React from 'react';
import PropTypes from 'prop-types';
import { matchPath, useLocation, useParams } from 'react-router-dom';
import { validate as isUuid } from 'uuid';

import { Bullseye, Spinner } from '@patternfly/react-core';

import { advisorBaseName, Navigate, ocmBaseName } from '~/common/routing';

import ExternalRedirect from './ExternalRedirect';

// expects the pluginName and errorKey to construct the ruleId recognized by OCP Advisor
export const composeRuleId = (pluginName, errorKey) =>
  encodeURIComponent(
    `${decodeURIComponent(pluginName).replace(/\|/g, '.').split('.report')[0]}|${decodeURIComponent(
      errorKey,
    )}`,
  );

const InsightsAdvisorRedirector = (props) => {
  const params = useParams();
  const location = useLocation();
  const { clusterDetails, fetchClusterDetails, setGlobalError } = props;
  React.useEffect(() => {
    if (!clusterDetails.fulfilled && params.id && !isUuid(params.id)) {
      fetchClusterDetails(params.id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clusterDetails?.fulfilled, params?.id]);

  const externalId =
    params?.id && isUuid(params.id) ? params.id : clusterDetails?.cluster?.external_id;
  const path = location.pathname;

  if (externalId) {
    if (
      matchPath({ path: `${ocmBaseName}/details/:clusterId`, end: true }, path) ||
      matchPath({ path: `${ocmBaseName}/details/s/:id`, end: true }, path)
    ) {
      return <ExternalRedirect url={`${advisorBaseName}/clusters/${externalId}`} />;
    }
    if (
      matchPath(
        { path: `${ocmBaseName}/details/:id/insights/:reportId/:errorKey`, end: true },
        path,
      ) ||
      matchPath(
        { path: `${ocmBaseName}/details/s/:id/insights/:reportId/:errorKey`, end: true },
        path,
      )
    ) {
      const { reportId, errorKey } = params;
      const ruleId = composeRuleId(reportId, errorKey);
      return <ExternalRedirect url={`${advisorBaseName}/clusters/${externalId}?first=${ruleId}`} />;
    }
  }

  if (clusterDetails.error) {
    // Cluster not found or no permission to see it - redirect to cluster list with error on top
    setGlobalError(
      <>
        Cluster with the subscription ID <b>{params?.id}</b> was not found, it might have been
        deleted or you don&apos;t have permission to see it.
      </>,
      'clusterDetails',
      clusterDetails?.errorMessage,
    );
    return <Navigate replace to="/cluster-list" />;
  }

  if (clusterDetails.fulfilled && !externalId) {
    // Could not find external id for the given cluster
    setGlobalError(
      <>
        There is no external ID for the cluster with the <b>{params?.id}</b> subscription ID.
      </>,
      'clusterDetails',
      clusterDetails?.errorMessage,
    );
    return <Navigate replace to="/cluster-list" />;
  }

  return (
    <Bullseye>
      <div className="pf-v6-u-text-align-center">
        <Spinner size="lg" aria-label="Loading..." />
      </div>
    </Bullseye>
  );
};

InsightsAdvisorRedirector.propTypes = {
  fetchClusterDetails: PropTypes.func.isRequired,
  clusterDetails: PropTypes.shape({
    cluster: PropTypes.object,
    error: PropTypes.bool,
    errorCode: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    errorMessage: PropTypes.oneOfType([PropTypes.string, PropTypes.node, PropTypes.element]),
    fulfilled: PropTypes.bool,
    history: PropTypes.object,
  }),
  setGlobalError: PropTypes.func.isRequired,
};

export default InsightsAdvisorRedirector;
