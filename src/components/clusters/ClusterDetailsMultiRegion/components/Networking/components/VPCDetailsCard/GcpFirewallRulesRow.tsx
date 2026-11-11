import React from 'react';

import {
  DescriptionListDescription,
  DescriptionListGroup,
  DescriptionListTerm,
  Skeleton,
} from '@patternfly/react-core';

import { useFetchGcpFirewallRule } from '~/queries/ClusterDetailsQueries/NetworkingTab/useFetchGcpFirewallRule';
import { GCP_BYO_FIREWALL_RULES } from '~/queries/featureGates/featureConstants';
import { useFeatureGate } from '~/queries/featureGates/useFetchFeatureGate';

type GcpFirewallRulesRowProps = {
  firewallRulesId?: string;
};

export const GcpFirewallRulesRow = ({ firewallRulesId }: GcpFirewallRulesRowProps) => {
  const isGcpByoFirewallRulesEnabled = useFeatureGate(GCP_BYO_FIREWALL_RULES);
  const shouldFetch = isGcpByoFirewallRulesEnabled && !!firewallRulesId;
  const { data: firewallRule, isLoading } = useFetchGcpFirewallRule(firewallRulesId, shouldFetch);

  if (!shouldFetch) {
    return null;
  }

  // Prefer the resolved name; the cluster already has firewallRulesId as a stable fallback
  // when the name request is still loading or fails.
  const value = isLoading ? (
    <Skeleton fontSize="sm" width="12em" screenreaderText="Loading firewall rules" />
  ) : (
    firewallRule?.name || firewallRulesId
  );

  return (
    <DescriptionListGroup>
      <DescriptionListTerm>Firewall rules</DescriptionListTerm>
      <DescriptionListDescription>{value}</DescriptionListDescription>
    </DescriptionListGroup>
  );
};
