import React from 'react';

import {
  DescriptionList,
  DescriptionListDescription,
  DescriptionListGroup,
  DescriptionListTerm,
  Timestamp,
  TimestampFormat,
} from '@patternfly/react-core';

import { BillingContract, getDimensionValue } from './awsBillingAccountHelper';

const ContractInfo = ({ contract }: { contract: BillingContract }) => (
  <DescriptionList id="contract-info" isHorizontal>
    <DescriptionListGroup>
      <DescriptionListTerm>Start date:</DescriptionListTerm>
      <DescriptionListDescription>
        {contract.start_date ? (
          <Timestamp
            date={new Date(contract.start_date)}
            locale="en-GB"
            dateFormat={TimestampFormat.medium}
          />
        ) : (
          'N/A'
        )}
      </DescriptionListDescription>
    </DescriptionListGroup>
    <DescriptionListGroup>
      <DescriptionListTerm>End date:</DescriptionListTerm>
      <DescriptionListDescription>
        {contract.end_date ? (
          <Timestamp
            date={new Date(contract.end_date)}
            locale="en-GB"
            dateFormat={TimestampFormat.medium}
          />
        ) : (
          'N/A'
        )}
      </DescriptionListDescription>
    </DescriptionListGroup>
    <DescriptionListGroup>
      <DescriptionListTerm>Number of vCPUs</DescriptionListTerm>
      <DescriptionListDescription>
        {getDimensionValue(contract.dimensions, 'four_vcpu_hour')}
      </DescriptionListDescription>
    </DescriptionListGroup>
    <DescriptionListGroup>
      <DescriptionListTerm>Number of clusters</DescriptionListTerm>
      <DescriptionListDescription>
        {getDimensionValue(contract.dimensions, 'control_plane')}
      </DescriptionListDescription>
    </DescriptionListGroup>
  </DescriptionList>
);

export default ContractInfo;
