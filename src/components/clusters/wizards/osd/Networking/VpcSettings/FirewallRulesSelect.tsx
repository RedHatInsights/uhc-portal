import React from 'react';

import {
  Button,
  ClipboardCopy,
  ClipboardCopyVariant,
  Content,
  ContentVariants,
  ExpandableSection,
  Flex,
  FlexItem,
  FormGroup,
  Stack,
  StackItem,
} from '@patternfly/react-core';

import { trackEvents } from '~/common/analytics';
import { FormGroupHelperText } from '~/components/common/FormGroupHelperText';
import { FuzzySelect, FuzzySelectProps } from '~/components/common/FuzzySelect/FuzzySelect';
import useAnalytics from '~/hooks/useAnalytics';
import {
  refetchGcpFirewallRules,
  useFetchGcpFirewallRules,
} from '~/queries/ClusterDetailsQueries/NetworkingTab/useFetchGcpFirewallRules';
import { GcpFirewallRule } from '~/types/clusters_mgmt.v1';

interface FirewallRulesSelectProps {
  selectedFirewallRules?: GcpFirewallRule;
  wifConfigId?: string;
  projectId?: string;
  network?: string;
  profile: string;
  createFirewallRulesCommand: string;
  input: {
    name: string;
    value: string;
    onChange: (selectedFirewallRules: GcpFirewallRule) => void;
    onBlur: () => void;
  };
  meta: {
    touched: boolean;
    error: string;
  };
}

const formatFirewallRuleLabel = (rule: GcpFirewallRule) =>
  `${rule.name} (${rule.gcp_network?.project_id} / ${rule.gcp_network?.vpc_name})`;

export const FirewallRulesSelect = ({
  selectedFirewallRules,
  wifConfigId,
  projectId,
  network,
  profile,
  createFirewallRulesCommand,
  input: { name: _name, onBlur: _onBlur, ...inputProps },
  meta: { error, touched },
}: FirewallRulesSelectProps) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const [isExpanded, setIsExpanded] = React.useState(false);

  const track = useAnalytics();

  const {
    data: firewallRules,
    isFetching,
    isSuccess,
    isError,
  } = useFetchGcpFirewallRules({
    profile,
    wifConfigId,
    projectId,
    network,
  });

  // Derive the displayed selection from fetched data.
  const matchedFirewallRule = firewallRules?.find((rule) => rule.id === selectedFirewallRules?.id);

  // Clear Formik when the selection cannot be validated against the latest fetch:
  // missing from a successful list, or the request failed (including Refresh).
  // Otherwise a stale id can reach Review / submitOSDRequest.
  React.useEffect(() => {
    const selectedId = selectedFirewallRules?.id;
    if (!selectedId) {
      return;
    }
    if (isError || (isSuccess && !matchedFirewallRule)) {
      inputProps.onChange({ id: '' });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only sync when fetch result or selection id changes
  }, [isSuccess, isError, matchedFirewallRule, selectedFirewallRules?.id]);

  const onSelect: FuzzySelectProps['onSelect'] = (_event, value) => {
    if (value === '') {
      inputProps.onChange({ id: '' });
      setIsOpen(false);
      return;
    }
    const selectedItem = firewallRules?.find((rule) => rule.id === value);
    if (selectedItem) {
      inputProps.onChange(selectedItem);
      track(trackEvents.FirewallRulesSelected, {
        customProperties: {
          module: 'openshift',
          firewall_rules_id: selectedItem.id,
          gcp_project_id: selectedItem.gcp_network?.project_id,
        },
      });
      setIsOpen(false);
    }
  };

  const refreshGcpFirewallRules = async () => {
    track(trackEvents.RefreshFirewallRules, {
      customProperties: {
        module: 'openshift',
        rules_count: firewallRules?.length ?? 0,
      },
    });

    await refetchGcpFirewallRules();
  };

  let placeholder = 'Select firewall rules';
  if (isFetching) {
    placeholder = 'Loading...';
  } else if (isError) {
    placeholder = 'Error loading firewall rules';
  } else if (firewallRules?.length === 0) {
    placeholder = 'No firewall rules found';
  }

  const firewallOptions = isSuccess
    ? firewallRules.map((rule: GcpFirewallRule) => ({
        entryId: rule.id,
        label: formatFirewallRuleLabel(rule),
      }))
    : {};

  return (
    <FormGroup>
      <Stack hasGutter>
        <StackItem>
          <Content component={ContentVariants.p} className="pf-v6-u-mt-md">
            To deploy with a smaller permission set, pre-create firewall rules using the CLI and
            select them below. If you skip this step, firewall rules will be created automatically
            during deployment.
          </Content>
        </StackItem>
        <StackItem>
          <ExpandableSection
            toggleText="Create firewall rules"
            isExpanded={isExpanded}
            onToggle={() => setIsExpanded(!isExpanded)}
          >
            <ClipboardCopy
              textAriaLabel="Copyable create firewall rules command"
              variant={ClipboardCopyVariant.inline}
              isReadOnly
              hoverTip="Copy"
              clickTip="Copied"
            >
              {createFirewallRulesCommand}
            </ClipboardCopy>
          </ExpandableSection>
        </StackItem>
        <StackItem>
          <FormGroup label="Firewall rules">
            <Flex>
              <FlexItem grow={{ default: 'grow' }}>
                <FuzzySelect
                  aria-label="Firewall rules"
                  isOpen={isOpen}
                  onOpenChange={(nextIsOpen) => setIsOpen(nextIsOpen)}
                  onSelect={onSelect}
                  selectedEntryId={matchedFirewallRule?.id}
                  selectionData={firewallOptions}
                  isDisabled={firewallRules?.length === 0 || isFetching}
                  placeholderText={placeholder}
                  inlineFilterPlaceholderText="Filter by firewall rule name"
                  isScrollable
                  popperProps={{
                    maxWidth: 'trigger',
                  }}
                  fuzziness={0}
                  isClearable
                />
              </FlexItem>
              <FlexItem>
                <Button
                  variant="secondary"
                  className="pf-v6-u-mt-md"
                  onClick={refreshGcpFirewallRules}
                  isLoading={isFetching}
                  isDisabled={isFetching}
                >
                  Refresh
                </Button>
              </FlexItem>
            </Flex>

            <FormGroupHelperText touched={touched} error={error}>
              Dropdown filtered to rules matching the selected WIF config, google cloud project, VPC
              name, and public/private network profile.
            </FormGroupHelperText>
          </FormGroup>
        </StackItem>
      </Stack>
    </FormGroup>
  );
};
