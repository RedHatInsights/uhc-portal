import React from 'react';
import semver from 'semver';

import {
  Button,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  CardTitle,
  Label,
  Spinner,
  Split,
  SplitItem,
  Tooltip,
} from '@patternfly/react-core';
import { InfoCircleIcon } from '@patternfly/react-icons/dist/esm/icons/info-circle-icon';
import { StarIcon } from '@patternfly/react-icons/dist/esm/icons/star-icon';

import ExternalLink from '../../../../../common/ExternalLink';

interface VersionCardProps {
  isSelected?: boolean;
  isRecommended?: boolean;
  version: string;
  onKeyDown: (event: React.KeyboardEvent<HTMLInputElement>) => void;
  onClick: (event: React.MouseEvent<HTMLInputElement>) => void;
  children?: React.ReactNode;
  isUnMetClusterAcknowledgements?: boolean;
  isPending?: boolean;
}

const getReleaseNotesLink = (version: string): React.ReactElement | null => {
  const parsed = semver.parse(version);
  if (!parsed) {
    return null;
  }

  const { major, minor, patch } = parsed;
  const hasPrerelease = semver.prerelease(version) !== null;
  if (major !== 4 || hasPrerelease) {
    return null;
  }
  const docURL = `https://docs.redhat.com/en/documentation/openshift_container_platform/${major}.${minor}/html/release_notes/ocp-${major}-${minor}-release-notes.html#ocp-${major}-${minor}-${patch}`;
  return (
    <ExternalLink href={docURL} className="pf-c-button pf-m-link card-footer-button">
      View release notes
    </ExternalLink>
  );
};

const VersionAcknowledgementPopover = (version: string): React.ReactElement => (
  <Tooltip
    content={`All clusters require an administrator acknowledgement before updating to OpenShift Container Platform ${version}`}
  >
    <Button icon={<InfoCircleIcon />} variant="link" isInline aria-label="more information" />
  </Tooltip>
);

const VersionCard = ({
  isSelected,
  isRecommended = false,
  version,
  onKeyDown,
  onClick,
  children,
  isUnMetClusterAcknowledgements,
  isPending = false,
}: VersionCardProps) => (
  <Card
    className="version-card"
    id={version}
    tabIndex={0}
    onKeyDown={onKeyDown}
    onClick={onClick}
    isCompact
    isSelectable
    isClickable
    isSelected={isSelected}
  >
    <CardHeader
      selectableActions={{
        name: 'upgrade-version',
        variant: 'single',
        selectableActionAriaLabelledby: version,
      }}
    >
      <CardTitle id={`card-title-${version}`}>
        <Split>
          <SplitItem>
            {isPending && isSelected && <Spinner size="lg" />} {version}{' '}
            {isUnMetClusterAcknowledgements && isSelected
              ? VersionAcknowledgementPopover(version)
              : null}
          </SplitItem>
          <SplitItem isFilled />
          {isRecommended && (
            <SplitItem>
              <Label color="blue" icon={<StarIcon />}>
                Recommended
              </Label>
            </SplitItem>
          )}
        </Split>
      </CardTitle>
    </CardHeader>
    {children && <CardBody>{children}</CardBody>}
    <CardFooter>{getReleaseNotesLink(version)}</CardFooter>
  </Card>
);

export default VersionCard;
