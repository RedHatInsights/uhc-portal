import React from 'react';

import { Content, ContentVariants } from '@patternfly/react-core';

import links from '~/common/installLinks.mjs';
import ExternalLink from '~/components/common/ExternalLink';
import PopoverHint from '~/components/common/PopoverHint';

export const ImdsSectionHint = () => (
  <PopoverHint
    minWidth="30rem"
    title="Amazon EC2 Instance Metadata Service (IMDS)"
    bodyContent={
      <>
        <Content component={ContentVariants.p}>
          Instance metadata is data that is related to an Amazon Elastic Compute Cloud (Amazon EC2)
          instance that applications can use to configure or manage the running instance.
        </Content>
        <Content component={ContentVariants.p}>
          <ExternalLink href={links.AWS_IMDS}>Learn more about IMDS</ExternalLink>
        </Content>
      </>
    }
  />
);
