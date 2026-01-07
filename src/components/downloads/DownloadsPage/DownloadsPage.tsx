import React, { createRef, RefObject, useEffect, useState } from 'react';
import { produce } from 'immer';
import { useDispatch } from 'react-redux';
import { useLocation } from 'react-router-dom';

import PageHeader from '@patternfly/react-component-groups/dist/dynamic/PageHeader';
import {
  Content,
  ExpandableSectionToggle,
  PageSection,
  Split,
  SplitItem,
} from '@patternfly/react-core';
import { Table, Th, Thead, Tr } from '@patternfly/react-table';

import { hasRestrictTokensCapability } from '~/common/restrictTokensHelper';
import { Link, useNavigate } from '~/common/routing';
import { AppPage } from '~/components/App/AppPage';
import { githubActions, tollboothActions } from '~/redux/actions';
import { useGlobalState } from '~/redux/hooks';
import { isRestrictedEnv } from '~/restrictedEnv';

import installLinks, {
  githubReleasesToFetch,
  urlsSelector,
} from '../../../common/installLinks.mjs';
import useOrganization from '../../CLILoginPage/useOrganization';
import ExternalLink from '../../common/ExternalLink';
import DownloadsCategoryDropdown from '../DownloadsCategoryDropdown';
import DownloadsSection from '../DownloadsSection';
import { allCategories, downloadsCategories, expandKeys } from '../downloadsStructure';

import DownloadsPageColumnHeadings from './components/DownloadsPageColumnHeadings';
import CliToolRows from './components/rows/CliToolRows';
import CustomInstallationRows from './components/rows/CustomInstallationRows';
import DevToolRows from './components/rows/DevToolRows';
import DisconnectedInstallationRows from './components/rows/DisconnectedInstallationRows';
import { DownloadsPageRowsType } from './components/rows/DownloadsPageRowsType';
import InstallationRows from './components/rows/InstallationRows';
import TokenRows from './components/rows/TokenRows';

import './DownloadsPage.scss';

const rowId = (expandKey: string) => `tool-${expandKey}`;

const DownloadsPage = () => {
  const restrictedEnv = isRestrictedEnv();
  const dispatch = useDispatch();

  const githubReleases = useGlobalState((state) => state.githubReleases);
  const token = useGlobalState((state) => state.tollbooth.token || {});

  const location = useLocation();
  const navigate = useNavigate();
  const { organization, isLoading, error } = useOrganization();
  const [restrictTokens, setRestrictTokens] = useState<boolean>();

  const initialExpanded = (): { [index: string]: boolean } =>
    Object.values(expandKeys).reduce((acc, curr) => ({ ...acc, [`${curr}`]: false }), {});

  const makeRefs = (): { [index: string]: RefObject<any> } =>
    Object.values(expandKeys).reduce((acc, curr) => ({ ...acc, [`${curr}`]: createRef() }), {});

  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [expanded, setExpanded] = useState(initialExpanded());
  const [selections, setSelections] = useState({});

  /** "Advertise" link targets by setting #tool-foo URL.
   *
   * Takes new state as params because state is unreliable after useState().
   */
  const updateURL = (selectedCategory: string, expanded: { [index: string]: boolean }) => {
    let lastExpanded = null;
    downloadsCategories()
      .find((c) => c.key === selectedCategory)
      ?.tools?.forEach((key) => {
        if (expanded[key]) {
          lastExpanded = key;
        }
      });

    const hash = lastExpanded ? `#${rowId(lastExpanded)}` : '';
    if (hash !== location.hash) {
      navigate({ ...location, hash });
    }
  };

  const setExpandedState = (expanded: { [index: string]: boolean }) => {
    setExpanded(expanded);
    updateURL(selectedCategory, expanded);
  };

  const toolRefs = makeRefs();

  const focusRowByHash = () => {
    const hash = location.hash.replace('#', '');
    const key = Object.values(expandKeys).find((k) => rowId(k) === hash);
    if (key) {
      // Expand to draw attention.  setState() directly to bypass updateHash().
      setExpandedState({ ...expanded, [key]: true });

      const row = toolRefs[key]?.current;
      if (row) {
        row.scrollIntoView({ block: 'start', behavior: 'smooth' });

        // Goal: Bring keyboard focus somewhere in the chosen row.
        // .focus() only works on focusable elements - input, select, button, etc.
        // The row expand toggle happens to be a button.
        const elem = row.querySelector('button, select');
        if (elem) {
          elem.focus({ preventScroll: true });
        }
      }
    }
  };

  useEffect(() => {
    // check if using offline tokens is restricted
    if (
      !restrictedEnv &&
      !isLoading &&
      !error &&
      !!organization &&
      organization.capabilities &&
      hasRestrictTokensCapability(organization.capabilities)
    ) {
      setRestrictTokens(true);
    }
  }, [organization, isLoading, error, restrictedEnv]);

  useEffect(() => {
    // getAuthToken();
    dispatch(tollboothActions.createAuthToken());

    githubReleasesToFetch.forEach((repo) => {
      if (!githubReleases[repo].fulfilled) {
        dispatch(githubActions.getLatestRelease(repo));
      }
    });
    focusRowByHash();

    window.addEventListener('hashchange', focusRowByHash);

    return () => {
      window.removeEventListener('hashchange', focusRowByHash);
    };
    // should be disabled -> causes infinite loop (former componentDidMount)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const setCategory = (
    _event: React.FormEvent<HTMLSelectElement>,
    selectedCategory: (typeof allCategories)[number]['key'],
  ) => {
    setSelectedCategory(selectedCategory);
    updateURL(selectedCategory, expanded);
  };

  const urls = urlsSelector(githubReleases);

  const shownKeys = downloadsCategories().find((c) => c.key === selectedCategory)?.tools;
  const allExpanded = shownKeys?.every((key) => expanded[key]);
  const willExpandAll = !allExpanded;

  const expandCollapseAll = () => {
    setExpandedState(
      produce(expanded, (draft) => {
        shownKeys?.forEach((key) => {
          draft[key] = willExpandAll;
        });
      }),
    );
  };

  const commonPropsRowsComponents: DownloadsPageRowsType = {
    expanded,
    setExpanded: setExpandedState,
    selections,
    setSelections,
    toolRefs,
    urls,
  };

  return (
    <AppPage title="Downloads | Red Hat OpenShift Cluster Manager">
      <PageHeader title="Downloads" subtitle="">
        <Split className="subheader">
          <SplitItem>
            <DownloadsCategoryDropdown
              selectedCategory={selectedCategory}
              setCategory={setCategory}
            />
          </SplitItem>
          <SplitItem>
            <ExpandableSectionToggle
              className="expand-collapse-all"
              isExpanded={!willExpandAll}
              onToggle={expandCollapseAll}
            >
              {willExpandAll ? 'Expand all' : 'Collapse all'}
            </ExpandableSectionToggle>
          </SplitItem>
        </Split>
      </PageHeader>

      <PageSection hasBodyWrapper={false} className="downloads-page-body">
        <PageSection
          hasBodyWrapper={false}
          padding={{ default: 'noPadding' }}
          className="downloads-page-body"
        >
          <DownloadsSection
            selectedCategory={selectedCategory}
            category="CLI"
            description={
              <Content component="p">
                Download command line tools to manage and work with OpenShift from your terminal.
              </Content>
            }
          >
            <Table aria-label="CLI tools table">
              <DownloadsPageColumnHeadings />
              <CliToolRows {...commonPropsRowsComponents} />
            </Table>
          </DownloadsSection>

          {!restrictedEnv && (
            <>
              <DownloadsSection
                selectedCategory={selectedCategory}
                category="DEV"
                description={
                  <Content component="p">
                    Access all the powers of Kubernetes through a simplified workflow with Red Hat’s
                    developer tools.{' '}
                    <ExternalLink href={installLinks.RH_DEV_TOOLS}>Learn more</ExternalLink>
                  </Content>
                }
              >
                <Table aria-label="Developer tools table">
                  <DownloadsPageColumnHeadings />
                  <DevToolRows {...commonPropsRowsComponents} />
                </Table>
              </DownloadsSection>
              <DownloadsSection
                selectedCategory={selectedCategory}
                category="INSTALLATION"
                description={
                  <Content component="p">
                    Install OpenShift based on your infrastructure. For the installer matching your
                    infrastructure type, select the operating system and architecture on which you
                    wish to run the installer. Then follow the steps provided within your
                    infrastructure&apos;s tab on the <Link to="/create">create cluster</Link> page
                    to install an OpenShift cluster.
                  </Content>
                }
              >
                <Table aria-label="OpenShift installation table">
                  <DownloadsPageColumnHeadings />
                  <InstallationRows {...commonPropsRowsComponents} />
                </Table>
              </DownloadsSection>

              <DownloadsSection
                selectedCategory={selectedCategory}
                category="DISCONNECTED_INSTALLATION"
                description={
                  <Content component="p">
                    Utilities to simplify preparation of disconnected cluster installations.
                  </Content>
                }
              >
                <Table aria-label="OpenShift disconnected installation tools table">
                  <DownloadsPageColumnHeadings />
                  <DisconnectedInstallationRows {...commonPropsRowsComponents} />
                </Table>
              </DownloadsSection>

              <DownloadsSection
                selectedCategory={selectedCategory}
                category="CUSTOM_INSTALLATION"
                description={
                  <Content component="p">
                    Customize OpenShift and Red Hat Enterprise Linux CoreOS (RHCOS) installation
                    with these tools.
                  </Content>
                }
              >
                <Table aria-label="OpenShift installation customization downloads table">
                  <DownloadsPageColumnHeadings />
                  <CustomInstallationRows {...commonPropsRowsComponents} />
                </Table>
              </DownloadsSection>
            </>
          )}
          <DownloadsSection category="TOKENS" selectedCategory={selectedCategory}>
            <Table aria-label="Tokens table">
              <Thead>
                <Tr>
                  <Th width={10} screenReaderText="Expand for more information" />
                  <Th width={90} screenReaderText="Token type" />
                  <Th width={10} screenReaderText="Download or view token" />
                </Tr>
              </Thead>

              <TokenRows
                expanded={expanded}
                setExpanded={setExpandedState}
                toolRefs={toolRefs}
                token={token}
                restrictTokens={restrictTokens}
                orgRequest={{ isLoading, error: error as any }}
                restrictedEnv={restrictedEnv}
              />
            </Table>
          </DownloadsSection>
        </PageSection>
      </PageSection>
    </AppPage>
  );
};

export default DownloadsPage;
