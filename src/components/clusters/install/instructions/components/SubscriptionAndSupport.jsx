import React from 'react';

import { Content, List, ListItem } from '@patternfly/react-core';

const SubscriptionAndSupport = () => {
  const bullet1 = (
    <span>
      Choose &quot;Edit subscriptions settings &quot; from the actions menu in the upper right of
      the cluster details pages.
    </span>
  );
  const bullet2 = (
    <span>Select the options that apply to your cluster in the dialog and save.</span>
  );
  return (
    <Content>
      <Content component="h2">Subscription and support</Content>
      <Content component="p">
        Your cluster will be automatically registered with a 60 day evaluation subscription which
        does not include support. In order to receive support for your cluster, you will need to
        edit the subscription settings from the cluster details page here in OpenShift Cluster
        Manager.
      </Content>
      <List>
        <ListItem>{bullet1}</ListItem>
        <ListItem>{bullet2}</ListItem>
      </List>
    </Content>
  );
};

export default SubscriptionAndSupport;
