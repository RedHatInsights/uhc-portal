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

import { FormGroupHelperText } from '~/components/common/FormGroupHelperText';
import { FuzzySelect, FuzzySelectProps } from '~/components/common/FuzzySelect/FuzzySelect';
import {
  refetchGcpDnsZones,
  useFetchGcpDnsDomains,
} from '~/queries/ClusterDetailsQueries/NetworkingTab/useFetchGcpDnsDomains';
import { DnsDomain } from '~/types/clusters_mgmt.v1';

interface DnsZoneSelectProps {
  selectedDnsZone?: DnsDomain;
  domainPrefix: string;
  organizationId: string;
  input: {
    name: string;
    value: string;
    onChange: (selectedDnsZone: DnsDomain) => void;
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
  organizationId,
  meta: { error, touched },
}: DnsZoneSelectProps) => {
  const [isOpen, setIsOpen] = React.useState<boolean>(false);
  const [isExpanded, setIsExpanded] = React.useState<boolean>(false);

  const onToggle = () => {
    setIsExpanded(!isExpanded);
  };

  const {
    data: dnsDomains,
    isFetching,
    isSuccess,
  } = useFetchGcpDnsDomains(domainPrefix, organizationId);

  const onSelect: FuzzySelectProps['onSelect'] = (_event, value) => {
    if (value === '') {
      inputProps.onChange({ id: '' });
      setIsOpen(false);
      return;
    }
    const selectedItem = dnsDomains?.find((dnsZone) => dnsZone.id === value);
    if (selectedItem) {
      inputProps.onChange(selectedItem);
      setIsOpen(false);
    }
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

  const isSelectedDnsZoneDeleted = (currentDnsZone?: DnsDomain, dnsZones?: DnsDomain[]) =>
    currentDnsZone?.id &&
    dnsZones?.find((dnsZone) => dnsZone.id === currentDnsZone?.id) === undefined;

  React.useEffect(() => {
    if (isSelectedDnsZoneDeleted(selectedDnsZone, dnsDomains)) {
      inputProps.onChange({ id: '' });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dnsDomains]);

  const refreshGcpDnsZones = () => {
    refetchGcpDnsZones();

    if (isSelectedDnsZoneDeleted(selectedDnsZone, dnsDomains)) {
      inputProps.onChange({ id: '' });
    }
  };

  const selectionData = React.useMemo(() => {
    let placeholder = 'Select a DNS Zone';

    if (isFetching) {
      placeholder = 'Loading...';
    } else if (dnsDomains?.length === 0) {
      placeholder = 'No DNS Zones found';
    }

    const dnsOptions = isSuccess
      ? dnsDomains.map((dnsZone: DnsDomain) => ({
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
            To deploy without DNS Administrator privileges on the host project, pre-create a DNS
            zone using the cli and select it below. Make sure the --domain-prefix flag includes your
            domain prefix from step 2. If you skip this step, DNS Administrator privileges will be
            required.
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
            fuzziness={0}
            isClearable
          />
        </FlexItem>
        <FlexItem>
          <Button
            variant="secondary"
            className="pf-v6-u-mt-md"
            onClick={refreshGcpDnsZones}
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
