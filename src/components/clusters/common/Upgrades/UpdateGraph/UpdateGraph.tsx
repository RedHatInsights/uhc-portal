import React from 'react';

import { InfoCircleIcon } from '@patternfly/react-icons/dist/esm/icons/info-circle-icon';

import { VersionGate } from '~/types/clusters_mgmt.v1';
import { AugmentedCluster, UpgradePolicyWithState } from '~/types/types';

import MinorVersionUpgradeConfirm from '../MinorVersionUpgradeConfirm/MinorVersionUpgradeConfirm';
import UpgradeAcknowledgeWarning from '../UpgradeAcknowledge/UpgradeAcknowledgeWarning/UpgradeAcknowledgeWarning';

import './UpdateGraph.scss';

interface UpdateGraphProps {
  currentVersion: React.ReactNode;
  updateVersion: React.ReactNode;
  hasMore: boolean;
  isHypershift: boolean;
  isSTSEnabled: boolean;
  schedules: UpgradePolicyWithState[];
  cluster: AugmentedCluster;
  unmetAcknowledgements?: VersionGate[];
}

const GraphContainer = ({ children }: { children: React.ReactNode }) => (
  <div className="ocm-upgrade-graph-container">{children}</div>
);

const GraphLine = ({ children }: { children?: React.ReactNode }) => (
  <li className="ocm-upgrade-graph-line">{children}</li>
);

const GraphPath = ({ children }: { children: React.ReactNode }) => (
  <ul className="ocm-upgrade-graph-path">{children}</ul>
);

const VersionLabel = ({ children }: { children: React.ReactNode }) => (
  <span className="ocm-upgrade-graph-version">{children}</span>
);

const VersionDot = ({ current }: { current?: boolean }) => (
  <div className={`ocm-upgrade-graph-version-dot ${current ? 'ocm-upgrade-current' : ''}`} />
);

const UpdateGraph = ({
  currentVersion,
  updateVersion,
  hasMore,
  schedules,
  cluster,
  isHypershift,
  isSTSEnabled,
  unmetAcknowledgements,
}: UpdateGraphProps) => (
  <div className="ocm-upgrade-graph">
    <GraphContainer>
      <GraphPath>
        <GraphLine>
          <VersionLabel>{currentVersion}</VersionLabel>
          <VersionDot current />
        </GraphLine>
        {updateVersion && (
          <>
            <GraphLine />
            <GraphLine>
              <VersionLabel>{updateVersion}</VersionLabel>
              <VersionDot />
            </GraphLine>
          </>
        )}
      </GraphPath>
    </GraphContainer>
    {hasMore && (
      <div className="ocm-upgrade-additional-versions-available">
        <InfoCircleIcon />
        {`Additional versions available between ${currentVersion} and ${updateVersion}`}
      </div>
    )}
    <UpgradeAcknowledgeWarning
      isInfo
      showConfirm
      showUpgradeWarning
      schedules={schedules}
      cluster={cluster}
      isHypershift={isHypershift}
      unmetAcknowledgements={unmetAcknowledgements}
    />
    <MinorVersionUpgradeConfirm
      schedules={schedules}
      cluster={cluster}
      unmetAcknowledgements={unmetAcknowledgements}
    />
  </div>
);

export default UpdateGraph;
