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
  const [isOpen, setIsOpen] = React.useState<boolean>(false);
  const [isExpanded, setIsExpanded] = React.useState<boolean>(false);

  const track = useAnalytics();

  const onToggle = () => {
    setIsExpanded(!isExpanded);
  };

  const trackFirewallRulesSelection = (
    firewallRulesId: string | undefined,
    gcpProjectId: string | undefined,
  ) => {
    track(trackEvents.FirewallRulesSelected, {
      customProperties: {
        module: 'openshift',
        firewall_rules_id: firewallRulesId,
        gcp_project_id: gcpProjectId,
      },
    });
  };

  const {
    data: firewallRules,
    isFetching,
    isSuccess,
  } = useFetchGcpFirewallRules({
    profile,
    wifConfigId,
    projectId,
    network,
  });

  const onSelect: FuzzySelectProps['onSelect'] = (_event, value) => {
    if (value === '') {
      inputProps.onChange({ id: '' });
      setIsOpen(false);
      return;
    }
    const selectedItem = firewallRules?.find((rule) => rule.id === value);
    if (selectedItem) {
      inputProps.onChange(selectedItem);
      trackFirewallRulesSelection(selectedItem.id, selectedItem.gcp_network?.project_id);
      setIsOpen(false);
    }
  };

  React.useEffect(() => {
    if (
      selectedFirewallRules?.id &&
      firewallRules?.some((item) => item.id === selectedFirewallRules?.id)
    ) {
      const selectedItem = firewallRules.find((rule) => rule.id === selectedFirewallRules.id);
      if (selectedItem) {
        inputProps.onChange(selectedItem);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [firewallRules, selectedFirewallRules?.id]);

  const isSelectedFirewallRulesDeleted = (
    currentFirewallRules?: GcpFirewallRule,
    rules?: GcpFirewallRule[],
  ) =>
    currentFirewallRules?.id &&
    rules?.find((rule) => rule.id === currentFirewallRules?.id) === undefined;

  React.useEffect(() => {
    if (isSelectedFirewallRulesDeleted(selectedFirewallRules, firewallRules)) {
      inputProps.onChange({ id: '' });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [firewallRules]);

  const refreshGcpFirewallRules = () => {
    refetchGcpFirewallRules();
    track(trackEvents.RefreshFirewallRules, {
      customProperties: {
        module: 'openshift',
        rules_count: firewallRules?.length ?? 0,
      },
    });

    if (isSelectedFirewallRulesDeleted(selectedFirewallRules, firewallRules)) {
      inputProps.onChange({ id: '' });
    }
  };

  const selectionData = React.useMemo(() => {
    let placeholder = 'Select firewall rules';

    if (isFetching) {
      placeholder = 'Loading...';
    } else if (firewallRules?.length === 0) {
      placeholder = 'No firewall rules found';
    }

    const firewallOptions = isSuccess
      ? firewallRules.map((rule: GcpFirewallRule) => ({
          entryId: rule.id,
          label: formatFirewallRuleLabel(rule),
        }))
      : {};

    return {
      placeholder,
      options: firewallOptions,
    };
  }, [firewallRules, isFetching, isSuccess]);

  return (
    <FormGroup>
      <Stack>
        <StackItem>
          <Content component={ContentVariants.p} className="pf-v6-u-mt-md">
            To deploy with a smaller permission set, pre-create firewall rules using the CLI and
            select them below. If you skip this step, firewall rules will be created automatically
            during deployment.
          </Content>
        </StackItem>
        <StackItem>
          <ExpandableSection
            toggleText="Create Firewall Rules"
            isExpanded={isExpanded}
            onToggle={onToggle}
            className="pf-v6-u-mt-md"
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
      </Stack>
      <FormGroup label="Firewall rules">
        <Flex>
          <FlexItem grow={{ default: 'grow' }}>
            <FuzzySelect
              aria-label="Firewall rules"
              isOpen={isOpen}
              onOpenChange={(isOpen) => setIsOpen(isOpen)}
              onSelect={onSelect}
              selectedEntryId={selectedFirewallRules?.id}
              selectionData={selectionData.options}
              isDisabled={firewallRules?.length === 0 || isFetching}
              placeholderText={selectionData.placeholder}
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
          Dropdown filtered to rules matching the selected WIF config from Step 2.
        </FormGroupHelperText>
      </FormGroup>
    </FormGroup>
  );
};
