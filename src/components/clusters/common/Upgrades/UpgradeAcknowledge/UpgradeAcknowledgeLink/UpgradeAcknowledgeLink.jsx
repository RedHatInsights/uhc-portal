import React from 'react';
import PropTypes from 'prop-types';

import { Icon } from '@patternfly/react-core';
import { ExclamationTriangleIcon } from '@patternfly/react-icons/dist/esm/icons/exclamation-triangle-icon';

import { Link } from '~/common/routing';

import { getHasUnMetClusterAcks } from '../UpgradeAcknowledgeHelpers';

import './UpgradeAcknowledgeWarningLink.scss';

const UpgradeAcknowledgeLink = (props) => {
  const { clusterId, cluster, schedules, upgradeGates } = props;

  const hasAcks = getHasUnMetClusterAcks(schedules, cluster, upgradeGates);

  return hasAcks ? (
    <Link
      to={`/details/${clusterId}#updateSettings`}
      className="ocm-upgrade-approval__required-link"
    >
      <Icon status="warning">
        <ExclamationTriangleIcon />
      </Icon>
      <span className="pf-v6-u-screen-reader">Warning</span> Approval required
    </Link>
  ) : null;
};

UpgradeAcknowledgeLink.propTypes = {
  clusterId: PropTypes.string,
  cluster: PropTypes.object,
  schedules: PropTypes.object,
  upgradeGates: PropTypes.object,
};

export default UpgradeAcknowledgeLink;
