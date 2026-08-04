import * as React from 'react';

import {
  Button,
  DescriptionListDescription,
  DescriptionListGroup,
  DescriptionListTerm,
  Flex,
  Stack,
  StackItem,
} from '@patternfly/react-core';

import { Link } from '~/common/routing';

import { ClusterTabsId } from '../../common/ClusterTabIds';

type LogForwardingConfigurationProps = {
  displayUpgradeSettingsTab: boolean;
  isS3Enabled: boolean;
  isCloudWatchEnabled: boolean;
};

const UpdateSettingsLink = (props: any) => (
  <Link {...props} to={{ hash: `#${ClusterTabsId.UPDATE_SETTINGS}` }} />
);

const LogForwardingConfiguration = ({
  displayUpgradeSettingsTab,
  isS3Enabled,
  isCloudWatchEnabled,
}: LogForwardingConfigurationProps) => {
  const hasConfiguredLogForwarder = isS3Enabled || isCloudWatchEnabled;

  return (
    <DescriptionListGroup>
      <DescriptionListTerm>
        <Flex gap={{ default: 'gapSm' }}>
          Control plane log forwarding
          {displayUpgradeSettingsTab && (
            <Button variant="link" component={UpdateSettingsLink}>
              View details
            </Button>
          )}
        </Flex>
      </DescriptionListTerm>
      <DescriptionListDescription data-testid="controlPlaneLogForwardingDescription">
        {!hasConfiguredLogForwarder ? (
          <span>Disabled</span>
        ) : (
          <Stack>
            <StackItem>
              <Flex>
                <dt>Amazon S3: </dt>
                <dd>{isS3Enabled ? 'Enabled' : 'Disabled'}</dd>
              </Flex>
            </StackItem>
            <StackItem>
              <Flex>
                <dt>CloudWatch: </dt>
                <dd>{isCloudWatchEnabled ? 'Enabled' : 'Disabled'}</dd>
              </Flex>
            </StackItem>
          </Stack>
        )}
      </DescriptionListDescription>
    </DescriptionListGroup>
  );
};

export default LogForwardingConfiguration;
