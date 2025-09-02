import React from 'react';
import PropTypes from 'prop-types';

import { ActionList, ActionListGroup, ActionListItem, Content } from '@patternfly/react-core';

import CopyPullSecret from '../../../../downloads/CopyPullSecret';
import DownloadPullSecret from '../../../../downloads/DownloadPullSecret';

function PullSecretSection({ token, pendoID, text }) {
  return (
    <>
      <Content component="p">
        {text ||
          "Download or copy your pull secret. You'll be prompted for this information during installation."}
      </Content>
      <ActionList>
        <ActionListGroup>
          <ActionListItem>
            <DownloadPullSecret token={token} pendoID={pendoID} />
          </ActionListItem>
          <ActionListItem>
            <CopyPullSecret token={token} variant="link-tooltip" pendoID={pendoID} />
          </ActionListItem>
        </ActionListGroup>
      </ActionList>
    </>
  );
}

PullSecretSection.propTypes = {
  token: PropTypes.object.isRequired,
  pendoID: PropTypes.string,
  text: PropTypes.string,
};

export default PullSecretSection;
