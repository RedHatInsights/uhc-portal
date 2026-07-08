import React from 'react';

import { Divider, Stack } from '@patternfly/react-core';

import AWSLogo from '~/styles/images/AWSLogo.svg';
import RedHatLogo from '~/styles/images/RedHatLogo.svg';

interface ServiceLogoProps {
  serviceName: string;
}

const AWSRedHatVerticalLogo = () => (
  <Stack hasGutter>
    <span>
      <img src={RedHatLogo} alt="Red Hat logo" className="ocm-vertical-logo-red-hat" />
    </span>
    <Divider />
    <img src={AWSLogo} alt="Amazon Web Service logo" className="ocm-vertical-logo-aws" />
  </Stack>
);

const RedHatVerticalLogo = () => (
  <Stack hasGutter>
    <span className="pf-v6-u-mt-xl">
      <img src={RedHatLogo} alt="Red Hat logo" className="ocm-vertical-logo-red-hat" />
    </span>
  </Stack>
);

export const ServiceLogo: React.FC<ServiceLogoProps> = ({ serviceName }) =>
  serviceName === 'ROSA' ? <AWSRedHatVerticalLogo /> : <RedHatVerticalLogo />;
