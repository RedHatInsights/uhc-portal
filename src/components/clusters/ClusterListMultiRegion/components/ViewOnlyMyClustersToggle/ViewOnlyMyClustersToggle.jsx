import React from 'react';
import PropTypes from 'prop-types';

import { Button, Popover, Switch } from '@patternfly/react-core';
import { OutlinedQuestionCircleIcon } from '@patternfly/react-icons/dist/esm/icons/outlined-question-circle-icon';

function ViewOnlyMyClustersToggle(props) {
  const { isChecked, onChange, bodyContent } = props;

  return (
    <Switch
      className="pf-v6-u-ml-lg pf-v6-u-align-items-center"
      id="view-only-my-clusters"
      aria-label="View only my clusters"
      label={
        <>
          <span>View only my clusters</span>
          <Popover bodyContent={bodyContent} enableFlip={false}>
            <Button icon={<OutlinedQuestionCircleIcon />} variant="plain" />
          </Popover>
        </>
      }
      hasCheckIcon
      isChecked={isChecked}
      onChange={(event, value) => onChange(value)}
    />
  );
}

ViewOnlyMyClustersToggle.propTypes = {
  isChecked: PropTypes.bool,
  onChange: PropTypes.func.isRequired,
  bodyContent: PropTypes.string,
};

ViewOnlyMyClustersToggle.defaultProps = {
  isChecked: false,
  bodyContent:
    'Show only the clusters you previously created, or all clusters in your organization.',
};

export default ViewOnlyMyClustersToggle;
