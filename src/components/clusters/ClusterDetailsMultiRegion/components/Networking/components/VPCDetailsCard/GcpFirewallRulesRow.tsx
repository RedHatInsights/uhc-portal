import React from 'react';

import {
  DescriptionListDescription,
  DescriptionListGroup,
  DescriptionListTerm,
  Spinner,
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
  const {
    data: firewallRule,
    isLoading,
    isError,
  } = useFetchGcpFirewallRule(firewallRulesId, shouldFetch);

  if (!shouldFetch) {
    return null;
  }

  let value: React.ReactNode = firewallRule?.name || firewallRulesId;
  if (isLoading) {
    value = <Spinner size="sm" aria-label="Loading firewall rules" />;
  } else if (isError) {
    value = 'Unable to load firewall rules name';
  }

  return (
    <DescriptionListGroup>
      <DescriptionListTerm>Firewall rules</DescriptionListTerm>
      <DescriptionListDescription>{value}</DescriptionListDescription>
    </DescriptionListGroup>
  );
};
