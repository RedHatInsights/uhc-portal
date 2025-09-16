import React from 'react';
import last from 'lodash/last';

import { Divider, Grid, GridItem, Title } from '@patternfly/react-core';

import { versionRegEx } from '../../../../../../common/versionComparator';

import VersionCard from './VersionCard';

const VersionSelectionGrid = ({
  clusterVersion,
  availableUpgrades,
  onSelect,
  selected,
  isUnMetClusterAcknowledgements,
  isPending = false,
}: {
  clusterVersion: string;
  availableUpgrades?: string[];
  onSelect: (version: string) => void;
  selected?: string;
  isUnMetClusterAcknowledgements?: boolean;
  isPending?: boolean;
}) => {
  React.useEffect(
    () => {
      if (availableUpgrades?.length === 1 && !selected) {
        // select the version if there's only one available
        onSelect(availableUpgrades[0]);
      }
    },
    // Only run on initial render
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  const onClick = (event: React.FormEvent<HTMLInputElement>) => {
    const newSelected = event.currentTarget.id === selected ? null : event.currentTarget.id;
    onSelect(newSelected || '');
  };

  const onKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.target !== event.currentTarget) {
      return;
    }
    if ([13, 32].includes(event.keyCode)) {
      onClick(event);
    }
  };

  const recommendedCards = (latestInCurrMinor: string, latestVersion: string) => {
    const latestVersionParts = versionRegEx.exec(latestVersion)?.groups;
    return (
      <>
        {latestInCurrMinor ? (
          <GridItem span={6}>
            <VersionCard
              isRecommended
              isSelected={selected === latestInCurrMinor}
              version={latestInCurrMinor}
              onKeyDown={onKeyDown}
              onClick={onClick}
              isUnMetClusterAcknowledgements={isUnMetClusterAcknowledgements}
              isPending={isPending}
            >
              The latest on your current minor version.
            </VersionCard>
          </GridItem>
        ) : null}
        {latestVersion !== latestInCurrMinor && latestVersionParts?.major ? (
          <GridItem span={6}>
            <VersionCard
              isRecommended
              isSelected={selected === latestVersion}
              version={latestVersion}
              onKeyDown={onKeyDown}
              onClick={onClick}
              isUnMetClusterAcknowledgements={isUnMetClusterAcknowledgements}
              isPending={isPending}
            >
              Start taking advantage of the new features{' '}
              {`${latestVersionParts?.major}.${latestVersionParts?.minor}`} has to offer.
            </VersionCard>
          </GridItem>
        ) : null}
      </>
    );
  };

  const latestVersion = last(availableUpgrades) || '';
  const clusterVersionParts = versionRegEx.exec(clusterVersion)?.groups;
  const versionsInCurrMinor = (availableUpgrades || []).filter((v) => {
    const currVersionParts = versionRegEx.exec(v)?.groups;
    if (
      currVersionParts?.major === clusterVersionParts?.major &&
      currVersionParts?.minor === clusterVersionParts?.minor
    ) {
      return true;
    }
    return false;
  });
  const latestInCurrMinor = last(versionsInCurrMinor) || '';
  const otherVersions = (availableUpgrades || []).filter(
    (v) => v !== latestVersion && v !== latestInCurrMinor,
  );
  return (
    <>
      <Title className="version-select-step-title" size="lg" headingLevel="h3">
        Select version
      </Title>
      <div id="version-grid-wrapper">
        <Grid hasGutter className="version-selection-grid">
          {recommendedCards(latestInCurrMinor, latestVersion)}
          {otherVersions.length > 0 && (
            <GridItem>
              <Divider />
            </GridItem>
          )}
          {otherVersions.map((upgradeVersion) => (
            <GridItem span={4} key={upgradeVersion}>
              <VersionCard
                version={upgradeVersion}
                onKeyDown={onKeyDown}
                onClick={onClick}
                isSelected={selected === upgradeVersion}
                isUnMetClusterAcknowledgements={isUnMetClusterAcknowledgements}
              />
            </GridItem>
          ))}
        </Grid>
      </div>
    </>
  );
};

export default VersionSelectionGrid;
