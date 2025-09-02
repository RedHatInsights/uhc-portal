import React from 'react';

import { Content, ContentVariants } from '@patternfly/react-core';

import links, { channels, tools } from '~/common/installLinks.mjs';
import DownloadAndOSSelection from '~/components/clusters/install/instructions/components/DownloadAndOSSelection';
import ExternalLink from '~/components/common/ExternalLink';

const StepDownloadROSACli = () => (
  <div data-testid="step1-rosa-prerequisites">
    <Content component="h3">
      Download and install the ROSA and AWS command line tools (CLI) and add it to your{' '}
      <code>PATH</code>.
    </Content>
    <Content component="ol" data-testid="substep1-rosa-prerequisites">
      <Content component="li" className="pf-v6-u-mb-lg">
        <Content component={ContentVariants.p} data-testid="substep1_1-rosa-prerequisites">
          Download the latest version of the ROSA CLI
        </Content>
        <div className="pf-v6-u-mt-md">
          <DownloadAndOSSelection tool={tools.ROSA} channel={channels.STABLE} />
        </div>
        <Content component="p">
          <ExternalLink href={links.ROSA_CLI_DOCS}>Help with ROSA CLI setup</ExternalLink>
        </Content>
      </Content>
      <Content component="li">
        <Content component={ContentVariants.p} data-testid="substep1_2-rosa-prerequisites">
          Download, setup and configure the AWS CLI version 2
        </Content>
        <Content component={ContentVariants.p} className="pf-v6-u-mt-md">
          Learn more about <ExternalLink href={links.AWS_CLI}>installing</ExternalLink> and{' '}
          <ExternalLink href={links.AWS_CLI_CONFIGURATION_INSTRUCTIONS}>configuring</ExternalLink>{' '}
          the AWS CLI.
        </Content>
      </Content>
    </Content>
  </div>
);

export default StepDownloadROSACli;
