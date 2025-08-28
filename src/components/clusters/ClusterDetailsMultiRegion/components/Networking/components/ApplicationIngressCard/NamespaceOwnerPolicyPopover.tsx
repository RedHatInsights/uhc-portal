import React from 'react';

import {
  Content,
  DescriptionList,
  DescriptionListDescription,
  DescriptionListTerm,
} from '@patternfly/react-core';

import PopoverHint from '~/components/common/PopoverHint';

export const NamespaceOwnerPolicyPopover = () => (
  <PopoverHint
    title="Namespace ownership policy"
    maxWidth="30rem"
    hint={
      <Content>
        <Content component="p">
          With <b>inter-namespace ownership allowed</b>, a single hostname can be used in routes of
          different namespaces. With <b>strict</b> option selected, a hostname can be used in routes
          of a single namespace only.
        </Content>
        <Content component="p">
          <b>Mind following example:</b>
          <br />
          hostname.dev/foo in namespace A<br />
          hostname.dev/bar in namespace B<br />
        </Content>

        <DescriptionList>
          <DescriptionListTerm>Inter-namespace ownership allowed</DescriptionListTerm>
          <DescriptionListDescription>possible</DescriptionListDescription>

          <DescriptionListTerm>Strict</DescriptionListTerm>
          <DescriptionListDescription>forbidden</DescriptionListDescription>
        </DescriptionList>
      </Content>
    }
  />
);
