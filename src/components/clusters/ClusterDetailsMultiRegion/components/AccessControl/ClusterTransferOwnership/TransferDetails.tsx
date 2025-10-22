// return the transfer details

import React from 'react';

import { Content, Timestamp, TimestampFormat } from '@patternfly/react-core';

import { ClusterTransfer } from '~/types/accounts_mgmt.v1';

export function TransferDetails({ transfer }: { transfer: ClusterTransfer }) {
  return (
    <Content>
      <Content component="dl">
        <Content component="dt">Requested date</Content>
        <Content component="dd">
          <Timestamp
            date={new Date(transfer?.created_at || '')}
            dateFormat={TimestampFormat.short}
            timeFormat={TimestampFormat.medium}
          />
        </Content>
        <Content component="dt">Requested by</Content>
        <Content component="dd">{transfer.owner}</Content>
        <Content component="dt">Transfer to</Content>
        <Content component="dd">{transfer.recipient}</Content>
        <Content component="dt">Status</Content>
        <Content component="dd">{transfer.status}</Content>
        <Content component="dt">Status Description</Content>
        <Content component="dd">{transfer.status_description}</Content>
      </Content>
    </Content>
  );
}
