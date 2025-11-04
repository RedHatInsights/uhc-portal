import React from 'react';
import { get } from 'lodash';
import PropTypes from 'prop-types';

import { Button, ClipboardCopy, Content, Stack, StackItem } from '@patternfly/react-core';

import { trackEvents } from '~/common/analytics';
import useAnalytics from '~/hooks/useAnalytics';

import ExternalLink from '../../../../common/ExternalLink';
import instructionsMapping from '../instructionsMapping';

import TelemetryDisclaimer from './TelemetryDisclaimer';

const GetStarted = ({ docURL, pendoID, cloudProviderID, customizations, prerequisites, isUPI }) => {
  const track = useAnalytics();
  return (
    <Stack hasGutter>
      <StackItem>
        <Content>
          <div>
            The installer will take about 45 minutes to run.
            {get(instructionsMapping, `${cloudProviderID}.getStartedAdditional`, null) || ''}
            <Content component="p">
              When the installer is complete you will see the console URL and credentials for
              accessing your new cluster. A <code>kubeconfig</code> file will also be generated for
              you to use with the <code>oc</code> CLI tools you downloaded.
            </Content>
          </div>
        </Content>
      </StackItem>
      <StackItem>
        <Button
          data-testid="get-started-button"
          component="a"
          href={docURL}
          rel="noreferrer noopener"
          target="_blank"
          variant="secondary"
          onClick={() => {
            track(trackEvents.OCPInstallDocumentation, {
              url: docURL,
              path: pendoID,
            });
          }}
        >
          Get started
        </Button>
      </StackItem>
      {!isUPI && (
        <StackItem>
          <Content component="p">
            To quickly create a cluster with the default options, run the following command:
          </Content>
          <ClipboardCopy id="copy-command" data-testid="copy-command" isReadOnly isCode>
            ./openshift-install create cluster
          </ClipboardCopy>
        </StackItem>
      )}
      {customizations && (
        <StackItem>
          <Content>
            <Content component="p">
              Refer to the documentation to{' '}
              <ExternalLink href={customizations}>install with customizations</ExternalLink>.
            </Content>
          </Content>
        </StackItem>
      )}
      {prerequisites && (
        <StackItem>
          <Content>
            <Content component="p">
              Please make sure you{' '}
              <ExternalLink href={prerequisites}>install the pre-requisites</ExternalLink> before
              proceeding with the cluster installation.
            </Content>
          </Content>
        </StackItem>
      )}
      <StackItem>
        <TelemetryDisclaimer />
      </StackItem>
    </Stack>
  );
};

GetStarted.defaultProps = {
  isUPI: false,
};

GetStarted.propTypes = {
  docURL: PropTypes.string.isRequired,
  pendoID: PropTypes.string,
  cloudProviderID: PropTypes.string.isRequired,
  customizations: PropTypes.string,
  prerequisites: PropTypes.string,
  isUPI: PropTypes.bool,
};

export default GetStarted;
