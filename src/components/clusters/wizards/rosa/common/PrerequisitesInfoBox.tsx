import React from 'react';

import { Hint, HintBody, HintTitle } from '@patternfly/react-core';

import { Link } from '~/common/routing';
import { productName } from '~/components/clusters/wizards/rosa/CreateRosaGetStarted/CreateRosaGetStarted';
import { ROSA_HOSTED_CLI_MIN_VERSION } from '~/components/clusters/wizards/rosa/rosaConstants';

interface PrerequisitesInfoBoxProps {
  showRosaCliRequirement?: boolean;
}
export const PrerequisitesInfoBox: React.FC<PrerequisitesInfoBoxProps> = (props) => {
  const { showRosaCliRequirement = true } = props;

  return (
    <Hint>
      <HintTitle>
        <strong>Did you complete your prerequisites?</strong>
      </HintTitle>
      <HintBody>
        <p>
          To create a {productName} (ROSA) cluster via the web interface, you must complete the
          prerequisite steps on the <Link to="/create/rosa/getstarted">Set up ROSA page</Link>.
        </p>
        {showRosaCliRequirement && (
          <p>
            Make sure you are using ROSA CLI version {ROSA_HOSTED_CLI_MIN_VERSION} or above for
            hosted control plane architecture.
          </p>
        )}
      </HintBody>
    </Hint>
  );
};
