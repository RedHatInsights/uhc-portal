import React from 'react';

import { Button, Flex, FlexItem, FormGroup } from '@patternfly/react-core';

import { FuzzySelect, FuzzySelectProps } from '~/components/common/FuzzySelect/FuzzySelect';
import {
  refetchGcpDnsZones,
  useFetchGcpDnsDomains,
} from '~/queries/ClusterDetailsQueries/NetworkingTab/useFetchGcpDnsDomains';
import { DnsDomain } from '~/types/clusters_mgmt.v1';

interface DnsZoneSelectProps {
  selectedDnsZone?: DnsDomain;
  domainPrefix: string;
  input: {
    name: string;
    value: string;
    onChange: (selectedDnsZone: DnsDomain) => void;
    onBlur: () => void;
  };
  //   meta: {
  //     touched: boolean;
  //     error: string;
  //   };
  //   showRefresh?: boolean;
}

const DnsZoneSelect = ({
  selectedDnsZone,
  input: {
    name,

    onBlur: _onBlur,
    ...inputProps
  },
  domainPrefix,
}: DnsZoneSelectProps) => {
  const [isOpen, setIsOpen] = React.useState<boolean>(false);
  //   const [dnsZones, setDnsZones] = React.useState([]);

  const {
    data: dnsDomains,
    // isError,
    // error,
    isFetching,
    isLoading,
    isSuccess,
  } = useFetchGcpDnsDomains(domainPrefix);

  console.log('dnsDomains DnsZoneSelect', dnsDomains);

  const onSelect: FuzzySelectProps['onSelect'] = (_event, selectedVPCID) => {
    // We want the form to store the original VPC object, rather than the option items
    const selectedItem = dnsDomains?.find((dnsZone) => dnsZone.id === selectedDnsZone?.id);
    if (selectedItem) {
      inputProps.onChange(selectedItem);
      setIsOpen(false);
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
      ? dnsDomains?.map((dnsZone: DnsDomain) => {
          console.log(dnsZone);

          return {
            entryId: dnsZone.id,
            label: `${dnsZone.gcp.domain_prefix}.${dnsZone.id} (${dnsZone.gcp.project_id})`,
          };
        })
      : {};

    return {
      placeholder,
      options: dnsOptions,
    };
  }, [dnsDomains, isFetching, isSuccess]);

  return (
    <FormGroup
    //   label="Config ID"
    //   labelHelp={
    //     <PopoverHint
    //       hint={
    //         <span>
    //           The OIDC configuration ID created by running the command{' '}
    //           <pre>rosa create oidc-config</pre>
    //         </span>
    //       }
    //     />
    //   }
    >
      <Flex>
        <FlexItem grow={{ default: 'grow' }}>
          <FuzzySelect
            className="oidc-config-select"
            aria-label="Config ID"
            isOpen={isOpen}
            onOpenChange={(isOpen) => setIsOpen(isOpen)}
            onSelect={onSelect}
            selectedEntryId={selectedDnsZone?.id}
            selectionData={selectionData.options}
            isDisabled={dnsDomains?.length === 0 || isFetching}
            placeholderText={selectionData.placeholder}
            inlineFilterPlaceholderText="Filter by DNS Zone name"
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
            onClick={refetchGcpDnsZones}
            isLoading={isLoading}
            isDisabled={isFetching}
          >
            Refresh
          </Button>
        </FlexItem>
      </Flex>

      {/* <FormGroupHelperText touched={touched} error={error} /> */}
    </FormGroup>
  );
};

export default DnsZoneSelect;
