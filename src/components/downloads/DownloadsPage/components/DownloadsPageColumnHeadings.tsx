import React from 'react';

import { Th, Thead, Tr } from '@patternfly/react-table';

const DownloadsPageColumnHeadings = () => (
  <Thead>
    <Tr>
      <Th width={10} aria-label="Expand for more information" />
      <Th width={40}>Name</Th>
      <Th width={20}>OS type</Th>
      <Th width={20}>Architecture type</Th>
      <Th aria-label="Download" />
    </Tr>
  </Thead>
);

export default DownloadsPageColumnHeadings;
