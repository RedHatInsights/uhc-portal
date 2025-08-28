import React from 'react';
import semver from 'semver';

import { Divider, LevelItem } from '@patternfly/react-core';

import ExternalLink from '../common/ExternalLink';
import PopoverHint from '../common/PopoverHint';
import SupportStatus from '../common/SupportStatus';

import getCandidateChannelLink from './getCandidateChannelLink';
import getReleaseNotesLink from './getReleaseNotesLink';
import { useOCPLatestVersionInChannel } from './hooks';
import ReleaseChannelDescription from './ReleaseChannelDescription';
import ReleaseChannelName from './ReleaseChannelName';

type Props = { channel: string; status?: string };

const ReleaseChannel = ({ channel, status }: Props) => {
  const [latestVersion] = useOCPLatestVersionInChannel(channel);
  const isCandidate = channel.includes('candidate');
  const candidateChannelLink = getCandidateChannelLink(latestVersion);
  const { major, minor } = semver.coerce(latestVersion) ?? { major: '4', minor: '7' };
  const releaseNotesLink = getReleaseNotesLink(latestVersion);

  return (
    <>
      <ReleaseChannelName>
        {isCandidate && <Divider className="ocm-l-ocp-releases__divider pf-v6-u-my-lg" />}
        {channel}
        {isCandidate && (
          <PopoverHint
            iconClassName="pf-v6-u-ml-sm"
            hint={
              <>
                <p className="pf-v6-u-mb-md">
                  {`Candidate channels contain candidate releases for a z-stream
                  (e.g., ${major}.${minor}.z). A candidate channel release contains
                  all the features of the product, but is not supported until the
                  release is promoted to the fast, stable, or eus channels.`}
                </p>
                {candidateChannelLink && (
                  <p>
                    <ExternalLink href={candidateChannelLink} noIcon>
                      Learn more about candidate channels
                    </ExternalLink>
                  </p>
                )}
              </>
            }
          />
        )}
      </ReleaseChannelName>
      <ReleaseChannelDescription>
        {latestVersion && (
          <LevelItem>
            Latest version{' '}
            {releaseNotesLink ? (
              <ExternalLink href={releaseNotesLink} noIcon>
                {latestVersion}
              </ExternalLink>
            ) : (
              latestVersion
            )}
          </LevelItem>
        )}
        {status && <SupportStatus status={status} />}
      </ReleaseChannelDescription>
    </>
  );
};

export default ReleaseChannel;
