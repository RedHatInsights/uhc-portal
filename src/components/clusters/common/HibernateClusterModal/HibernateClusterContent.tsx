import React from 'react';

import { Content, List, ListItem } from '@patternfly/react-core';

import docLinks from '~/common/docLinks.mjs';
import supportLinks from '~/common/supportLinks.mjs';
import ExternalLink from '~/components/common/ExternalLink';

const HibernateInfoLink = ({ isROSA }: { isROSA: boolean }) => (
  <ExternalLink href={isROSA ? supportLinks.HIBERNATING_CLUSTER : docLinks.OCP_HIBERNATING_CLUSTER}>
    Learn more about cluster hibernation
  </ExternalLink>
);

const HibernateClusterContent = ({
  clusterName,
  isHibernating,
  isROSA,
}: {
  clusterName: string;
  isHibernating: boolean;
  isROSA: boolean;
}) =>
  isHibernating ? (
    <Content>
      <Content component="p">
        Cluster <strong>{clusterName}</strong> will move out of Hibernating state and all cluster
        operations will be resumed.
      </Content>
      <HibernateInfoLink isROSA={isROSA} />
    </Content>
  ) : (
    <>
      <List>
        <ListItem>
          Hibernating clusters is not fully supported under Red Hat Subscription Level Agreements,
          might not be functionally complete, and is not intended for production use.
        </ListItem>
        <ListItem>
          It&apos;s recommended to hibernate only clusters that run recoverable workloads.
        </ListItem>
      </List>
      <HibernateInfoLink isROSA={isROSA} />
      <Content>
        <Content component="p">
          Are you sure you want to hibernate <strong>{clusterName}</strong>?
        </Content>
      </Content>
    </>
  );

export default HibernateClusterContent;
