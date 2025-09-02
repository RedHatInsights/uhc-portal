import React, { useCallback } from 'react';

import {
  Alert,
  Button,
  ButtonVariant,
  Card,
  CardBody,
  CardFooter,
  CardTitle,
  Content,
  ContentVariants,
  Title,
} from '@patternfly/react-core';
import { DesktopIcon } from '@patternfly/react-icons/dist/esm/icons/desktop-icon';

import { Link } from '~/common/routing';
import { CreateManagedClusterButtonWithTooltip } from '~/components/common/CreateManagedClusterTooltip';
import { useCanCreateManagedCluster } from '~/queries/ClusterDetailsQueries/useFetchActionsPermissions';

const WithWizard = () => {
  const LinkComponent = useCallback(
    (props: any) => <Link {...props} to="/create/rosa/wizard" />,
    [],
  );

  const { canCreateManagedCluster } = useCanCreateManagedCluster();

  return (
    <Card isFullHeight data-testid="deploy-with-webinterface-card">
      <CardTitle>
        <Title headingLevel="h3" size="lg">
          <DesktopIcon className="ocm-c-wizard-get-started--card-icon" />
          Deploy with web interface
        </Title>
      </CardTitle>
      <CardBody>
        <Content component={ContentVariants.p} className="pf-v6-u-mb-sm">
          You can deploy your cluster with the web interface.
        </Content>
        {/* TODO: PatternFly incorrectly puts the content of an alert as a h4 - this text should not be a heading */}
        <Alert
          variant="info"
          isInline
          isPlain
          title="Your AWS account will need to be associated with your Red Hat account."
        />
      </CardBody>
      <CardFooter>
        <CreateManagedClusterButtonWithTooltip
          childComponent={Button}
          variant={ButtonVariant.secondary}
          icon={<DesktopIcon />}
          component={LinkComponent}
          isAriaDisabled={!canCreateManagedCluster}
        >
          Create with web interface
        </CreateManagedClusterButtonWithTooltip>
      </CardFooter>
    </Card>
  );
};

export default WithWizard;
