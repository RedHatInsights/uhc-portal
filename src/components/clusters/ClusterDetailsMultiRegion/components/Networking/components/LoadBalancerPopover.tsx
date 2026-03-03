import React from 'react';

import docLinks from '~/common/docLinks.mjs';
import supportLinks from '~/common/supportLinks.mjs';
import ExternalLink from '~/components/common/ExternalLink';
import PopoverHint from '~/components/common/PopoverHint';

const LoadBalancerPopover = () => (
  <PopoverHint
    title="Load Balancers"
    maxWidth="30rem"
    hint={
      <div>
        Load balancers automatically distribute your incoming traffic to multiple servers. If you
        need features such as static IP, source IP address preservation and other features
        documented by AWS, we recommend using the Network Load Balancer. If you are using
        EC2-Classic Network, we recommend using Classic.
        <br />
        <ExternalLink href={docLinks.AWS_LOAD_BALANCER_FEATURES}>
          Learn more about AWS load balancers.
        </ExternalLink>
        <br />
        <ExternalLink href={supportLinks.MANAGED_INGRESS_KNOWLEDGE_BASE}>
          Learn more about setting load balancers in OCP.
        </ExternalLink>
      </div>
    }
  />
);

export default LoadBalancerPopover;
