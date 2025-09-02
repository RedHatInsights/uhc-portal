import React from 'react';
import PropTypes from 'prop-types';

import {
  DescriptionListDescription,
  DescriptionListGroup,
  DescriptionListTerm,
  Flex,
} from '@patternfly/react-core';

function ClusterNetwork({ cluster }) {
  return (
    (cluster.managed && cluster.network && (
      <DescriptionListGroup>
        <DescriptionListTerm>Network</DescriptionListTerm>
        <DescriptionListDescription>
          <dl className="pf-v6-l-stack">
            {cluster.network.machine_cidr && (
              <Flex>
                <dt>Machine CIDR: </dt>
                <dd data-testid="machineCIDR">{cluster.network.machine_cidr}</dd>
              </Flex>
            )}
            {cluster.network.service_cidr && (
              <Flex>
                <dt>Service CIDR: </dt>
                <dd data-testid="serviceCIDR">{cluster.network.service_cidr}</dd>
              </Flex>
            )}
            {cluster.network.pod_cidr && (
              <Flex>
                <dt>Pod CIDR: </dt>
                <dd data-testid="podCIDR">{cluster.network.pod_cidr}</dd>
              </Flex>
            )}
            {cluster.network.host_prefix && (
              <Flex>
                <dt>Host prefix: </dt>
                <dd data-testid="hostPrefix">{cluster.network.host_prefix}</dd>
              </Flex>
            )}
          </dl>
        </DescriptionListDescription>
      </DescriptionListGroup>
    )) ||
    null
  );
}

ClusterNetwork.propTypes = {
  cluster: PropTypes.object.isRequired,
};

export default ClusterNetwork;
