import React from 'react';
import semver from 'semver';

import PageHeader from '@patternfly/react-component-groups/dist/dynamic/PageHeader';
import {
  Button,
  Card,
  CardBody,
  CardTitle,
  Divider,
  Gallery,
  GalleryItem,
  PageSection,
  Popover,
  Stack,
  StackItem,
} from '@patternfly/react-core';
import { OutlinedQuestionCircleIcon } from '@patternfly/react-icons/dist/esm/icons/outlined-question-circle-icon';

import { Link } from '~/common/routing';
import { isRestrictedEnv } from '~/restrictedEnv';

import { AppPage } from '../App/AppPage';
import ExternalLink from '../common/ExternalLink';

import getReleaseNotesLink from './getReleaseNotesLink';
import { useOCPLifeCycleStatusData } from './hooks';
import ReleaseChannel from './ReleaseChannel';
import ReleaseChannelDescription from './ReleaseChannelDescription';
import ReleaseChannelName from './ReleaseChannelName';

import './Releases.scss';

const Releases = () => {
  const [statusData] = useOCPLifeCycleStatusData();

  const allVersions = statusData?.[0]?.versions;
  // Filter out EOL versions - show all currently supported versions
  const versionsToDisplay = allVersions?.filter(
    (version) => version.type?.toLowerCase() !== 'end of life',
  );
  const hasEUSChannel = (versionName: string) => {
    const parsed = semver.coerce(versionName);
    if (!parsed) {
      return false;
    }
    const { minor } = parsed;
    return minor > 5 && minor % 2 === 0;
  };
  const hasEUSLifeCycle = (versionName: string) =>
    allVersions?.find((v) => v.name.includes(`${versionName} EUS`));
  const latestVersion = versionsToDisplay?.[0]?.name ?? '4.7';
  const renderProductName = (versionName: string) => <>OpenShift {versionName}</>;

  return (
    <AppPage title="Releases | Red Hat OpenShift Cluster Manager">
      <PageHeader title="Releases" subtitle="" />
      <PageSection hasBodyWrapper={false} className="ocm-p-releases">
        <Stack hasGutter>
          <StackItem className="ocm-l-ocp-releases__section">
            <Card>
              <CardTitle>Latest OpenShift releases</CardTitle>
              <CardBody>
                <Stack hasGutter>
                  <StackItem>
                    View general information on the most recent OpenShift Container Platform release
                    versions that you can install. Versions are only supported when released to the
                    fast, stable, or eus channels.{' '}
                    <Popover
                      aria-label="Version help"
                      bodyContent={
                        <>
                          <p className="pf-v6-u-mb-md">
                            The most recent versions aren&apos;t always available for every cluster.
                            To keep your cluster up to date with the recommended version, run
                            regular updates from the <Link to="/cluster-list">clusters list</Link>.
                          </p>
                          <p>
                            <em>Note:</em> Disconnected clusters won&apos;t show available
                            recommended updates on the clusters list.
                          </p>
                        </>
                      }
                      id="version-help"
                    >
                      <Button
                        icon={<OutlinedQuestionCircleIcon />}
                        iconPosition="end"
                        variant="link"
                        isInline
                      >
                        I don&apos;t see these versions as upgrade options for my cluster.{' '}
                      </Button>
                    </Popover>
                  </StackItem>
                  <Gallery
                    hasGutter
                    minWidths={{
                      sm: '340px',
                    }}
                    maxWidths={{
                      default: '340px',
                    }}
                  >
                    {versionsToDisplay?.map((version) => {
                      const releaseNotesLink = getReleaseNotesLink(version.name);
                      return (
                        <GalleryItem key={version.name} data-testid={`version-${version.name}`}>
                          <Card className="ocm-l-ocp-releases__card">
                            <CardTitle>
                              <div className="ocm-l-ocp-releases__card-title pf-v6-u-mb-sm">
                                {releaseNotesLink ? (
                                  <ExternalLink href={releaseNotesLink} noIcon>
                                    {renderProductName(version.name)}
                                  </ExternalLink>
                                ) : (
                                  renderProductName(version.name)
                                )}
                              </div>
                              <Divider className="ocm-l-ocp-releases__divider pf-v6-u-mt-lg pf-v6-u-mb-sm" />
                            </CardTitle>
                            <CardBody>
                              <div className="ocm-l-ocp-releases__subheading">Channel details</div>
                              <dl className="ocm-l-ocp-releases__channels">
                                <ReleaseChannel
                                  channel={`stable-${version.name}`}
                                  status={version.type}
                                />
                                {!isRestrictedEnv() && (
                                  <ReleaseChannel
                                    channel={`fast-${version.name}`}
                                    status={version.type}
                                  />
                                )}
                                {hasEUSChannel(version.name) ? (
                                  <ReleaseChannel
                                    channel={`eus-${version.name}`}
                                    status={hasEUSLifeCycle(version.name)?.type ?? version.type}
                                  />
                                ) : (
                                  <>
                                    <ReleaseChannelName>-</ReleaseChannelName>
                                    <ReleaseChannelDescription>
                                      {`No ${version.name} EUS channel`}
                                    </ReleaseChannelDescription>
                                  </>
                                )}
                                {!isRestrictedEnv() && (
                                  <ReleaseChannel channel={`candidate-${version.name}`} />
                                )}
                              </dl>
                            </CardBody>
                          </Card>
                        </GalleryItem>
                      );
                    })}
                  </Gallery>
                </Stack>
              </CardBody>
            </Card>
          </StackItem>
          <StackItem className="ocm-l-osd-releases__section">
            <Card>
              <CardTitle>Channels</CardTitle>
              <CardBody>
                <Stack hasGutter>
                  <StackItem>
                    {`Channels recommend release versions and help control the pace of updates.
                    Update channels are tied to a minor version of OpenShift Container Platform,
                    for example ${latestVersion}. To update to the next minor release, you may need to change
                    the channel you're in.`}
                  </StackItem>
                  <StackItem>
                    <ExternalLink
                      href={`https://docs.redhat.com/en/documentation/openshift_container_platform/${latestVersion}/html/updating_clusters/understanding-openshift-updates-1#understanding-update-channels-releases`}
                      noIcon
                    >
                      Learn more about updating channels
                    </ExternalLink>
                  </StackItem>
                </Stack>
              </CardBody>
            </Card>
          </StackItem>
        </Stack>
      </PageSection>
    </AppPage>
  );
};

export default Releases;
