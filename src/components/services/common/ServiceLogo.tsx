import React from 'react';

import { Divider, Stack } from '@patternfly/react-core';

import AWSLogo from '~/styles/images/AWSLogo';
import RedHatLogo from '~/styles/images/RedHatLogo';

interface ServiceLogoProps {
  serviceName: string;
}

const AWSRedHatVerticalLogo = () => (
  <Stack hasGutter>
    <span>
      <RedHatLogo height="3em" width="5em" />
    </span>
    <Divider />
    <AWSLogo height="2.5em" width="5em" />
  </Stack>
);

const RedHatVerticalLogo = () => (
  <Stack hasGutter>
    <span className="pf-v6-u-mt-xl">
      <RedHatLogo height="3em" width="5em" />
    </span>
  </Stack>
);

export const ServiceLogo: React.FC<ServiceLogoProps> = ({ serviceName }) =>
  serviceName === 'ROSA' ? <AWSRedHatVerticalLogo /> : <RedHatVerticalLogo />;
