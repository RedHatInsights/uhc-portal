import React from 'react';
import PropTypes from 'prop-types';

import {
  Button,
  ButtonVariant,
  PageSection,
  Stack,
  StackItem,
  Title,
} from '@patternfly/react-core';
import { ArrowRightIcon } from '@patternfly/react-icons/dist/esm/icons/arrow-right-icon';

import { Link } from '~/common/routing';
import { ManagedServicesTable } from '~/components/clusters/CreateClusterPage/CloudTab/components/ManagedServicesTable';
import { RunItYourselfTable } from '~/components/clusters/CreateClusterPage/CloudTab/components/RunItYourselfTable';
import { isRestrictedEnv } from '~/restrictedEnv';

const QuotaLink = (props) => <Link {...props} to="/quota" />;

const CloudTab = ({ hasOSDQuota, trialEnabled }) => (
  <>
    <PageSection hasBodyWrapper={false}>
      <Stack hasGutter>
        <StackItem>
          <Title headingLevel="h2">Managed services</Title>
        </StackItem>
        <StackItem>
          Create clusters in the cloud using a managed service.
          <ManagedServicesTable hasOSDQuota={hasOSDQuota} isTrialEnabled={trialEnabled} />
        </StackItem>
        <StackItem>
          {!isRestrictedEnv() && (
            <Button
              icon={<ArrowRightIcon />}
              iconPosition="end"
              variant={ButtonVariant.link}
              id="subscriptions"
              component={QuotaLink}
            >
              View your annual subscriptions quota
            </Button>
          )}
        </StackItem>
      </Stack>
    </PageSection>
    {!isRestrictedEnv() && (
      <PageSection hasBodyWrapper={false}>
        <Stack hasGutter>
          <StackItem>
            <Title headingLevel="h2">Run it yourself</Title>
          </StackItem>
          <StackItem>
            Run OpenShift clusters on your own by installing from another cloud provider.
            <RunItYourselfTable />
          </StackItem>
        </Stack>
      </PageSection>
    )}
  </>
);

export default CloudTab;

CloudTab.propTypes = {
  hasOSDQuota: PropTypes.bool.isRequired,
  trialEnabled: PropTypes.bool.isRequired,
};
