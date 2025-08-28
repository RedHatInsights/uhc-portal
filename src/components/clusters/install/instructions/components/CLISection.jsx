import React from 'react';
import PropTypes from 'prop-types';

import { Content } from '@patternfly/react-core';

import { channels, tools } from '../../../../../common/installLinks.mjs';

import DownloadAndOSSelection from './DownloadAndOSSelection';

const CLISection = ({ pendoID, channel }) => (
  <>
    <Content component="p">
      Download the OpenShift command-line tools and add them to your <code>PATH</code>.
    </Content>
    <div>
      <DownloadAndOSSelection pendoID={pendoID} tool={tools.OC} channel={channel} />
    </div>
    <Content component="p" />
    <Content component="p">
      When the installer is complete you will see the console URL and credentials for accessing your
      new cluster. A <code>kubeconfig</code> file will also be generated for you to use with the{' '}
      <code>oc</code> CLI tools you downloaded.
    </Content>
  </>
);
CLISection.propTypes = {
  pendoID: PropTypes.string,
  channel: PropTypes.oneOf(Object.values(channels)).isRequired,
};

export default CLISection;
