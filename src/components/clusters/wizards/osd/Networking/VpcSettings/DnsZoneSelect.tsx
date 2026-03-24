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
import { GcpDnsDomain } from '~/common/vpcHelpers';
import { FormGroupHelperText } from '~/components/common/FormGroupHelperText';
import { FuzzySelect, FuzzySelectProps } from '~/components/common/FuzzySelect/FuzzySelect';
import useAnalytics from '~/hooks/useAnalytics';
import {
  refetchGcpDnsZones,
  useFetchGcpDnsDomains,
} from '~/queries/ClusterDetailsQueries/NetworkingTab/useFetchGcpDnsDomains';

interface DnsZoneSelectProps {
  selectedDnsZone?: GcpDnsDomain;
  domainPrefix: string;
  input: {
    name: string;
    value: string;
    onChange: (selectedDnsZone: GcpDnsDomain) => void;
    onBlur: () => void;
  };
  meta: {
    touched: boolean;
    error: string;
  };
}

const DnsZoneSelect = ({
  selectedDnsZone,
  input: { name, onBlur: _onBlur, ...inputProps },
  domainPrefix,
  meta: { error, touched },
}: DnsZoneSelectProps) => {
  const track = useAnalytics();

  const [isOpen, setIsOpen] = React.useState<boolean>(false);
  const [isExpanded, setIsExpanded] = React.useState<boolean>(false);

  const onToggle = () => {
    setIsExpanded(!isExpanded);
  };

  const trackDnsZoneSelection = (zoneId: string | undefined) => {
    track(trackEvents.DnsZoneSelected, {
      customProperties: {
        module: 'openshift',
        dns_zone_id: zoneId,
      },
    });
  };

  const { data: dnsDomains, isFetching, isSuccess } = useFetchGcpDnsDomains(domainPrefix);

  const onSelect: FuzzySelectProps['onSelect'] = (_event, selectedDnsZone) => {
    const selectedItem = dnsDomains?.find((dnsZone) => dnsZone.id === selectedDnsZone);
    if (selectedItem) {
      inputProps.onChange(selectedItem);
      trackDnsZoneSelection(selectedItem.id);
      setIsOpen(false);
    }
  };

  const refreshDnsZones = () => {
    track(trackEvents.RefreshDnsZones);
    refetchGcpDnsZones();
  };

  React.useEffect(() => {
    if (selectedDnsZone?.id && dnsDomains?.some((item) => item.id === selectedDnsZone?.id)) {
      const selectedItem = dnsDomains.find((domain) => domain.id === selectedDnsZone.id);
      if (selectedItem) {
        inputProps.onChange(selectedItem);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dnsDomains, selectedDnsZone?.id]);

  const selectionData = React.useMemo(() => {
    let placeholder = 'Select a DNS Zone';
    if (isFetching) {
      placeholder = 'Loading...';
    } else if (dnsDomains?.length === 0) {
      placeholder = 'No DNS Zones found';
    }

    const dnsOptions = isSuccess
      ? dnsDomains?.map((dnsZone: GcpDnsDomain) => ({
          entryId: dnsZone.id,
          label: `${dnsZone.gcp?.domain_prefix}.${dnsZone.id} (${dnsZone.gcp?.project_id})`,
        }))
      : {};

    return {
      placeholder,
      options: dnsOptions,
    };
  }, [dnsDomains, isFetching, isSuccess]);

  const createDnsZoneCommand = `ocm gcp create dns-zone --domain-prefix ${domainPrefix} --project-id <project-id> --network-project-id <network-project-id> --network-id <vpc-id>`;

  return (
    <FormGroup>
      <Stack>
        <StackItem>
          <Content component={ContentVariants.p} className="pf-v6-u-mt-md">
            To deploy without DNS Administrator privileges on the host project, pre create a DNS
            zone using the cli and select it below. If you skip this step, DNS Administrator
            privileges will be required
          </Content>
        </StackItem>
        <StackItem>
          <ExpandableSection
            toggleText="Create DNS Zone"
            isExpanded={isExpanded}
            onToggle={onToggle}
            className="pf-v6-u-mt-md"
          >
            <ClipboardCopy
              textAriaLabel="Copyable create DNS zone command"
              variant={ClipboardCopyVariant.inline}
              isReadOnly
              hoverTip="Copy"
              clickTip="Copied"
            >
              {createDnsZoneCommand}
            </ClipboardCopy>
          </ExpandableSection>
        </StackItem>
      </Stack>
      <Flex>
        <FlexItem grow={{ default: 'grow' }}>
          <FuzzySelect
            aria-label="DNS zone"
            isOpen={isOpen}
            onOpenChange={(isOpen) => setIsOpen(isOpen)}
            onSelect={onSelect}
            selectedEntryId={selectedDnsZone?.id}
            selectionData={selectionData.options}
            isDisabled={dnsDomains?.length === 0 || isFetching}
            placeholderText={selectionData.placeholder}
            inlineFilterPlaceholderText="Filter by DNS zone name"
            isScrollable
            popperProps={{
              maxWidth: 'trigger',
            }}
          />
        </FlexItem>
        <FlexItem>
          <Button
            variant="secondary"
            className="pf-v6-u-mt-md"
            onClick={refreshDnsZones}
            isLoading={isFetching}
            isDisabled={isFetching}
          >
            Refresh
          </Button>
        </FlexItem>
      </Flex>

      <FormGroupHelperText touched={touched} error={error} />
    </FormGroup>
  );
};

export default DnsZoneSelect;
