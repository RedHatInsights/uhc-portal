/*
Copyright (c) 2021 Red Hat, Inc.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

  http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

import React, { useRef, useState } from 'react';
import PropTypes from 'prop-types';

import {
  Button,
  Dropdown,
  DropdownItem,
  DropdownList,
  MenuToggle,
  Split,
  SplitItem,
  ToolbarItem,
} from '@patternfly/react-core';
import EllipsisVIcon from '@patternfly/react-icons/dist/esm/icons/ellipsis-v-icon';

import { Link } from '~/common/routing';
import { AUTO_CLUSTER_TRANSFER_OWNERSHIP } from '~/queries/featureGates/featureConstants';
import { useFeatureGate } from '~/queries/featureGates/useFetchFeatureGate';
import { isRestrictedEnv } from '~/restrictedEnv';

const useMediaQuery = (query) => {
  if (typeof window === 'undefined' || typeof window.matchMedia === 'undefined') {
    return false;
  }

  const mediaQuery = window.matchMedia(query);
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const [match, setMatch] = React.useState(!!mediaQuery.matches);

  // eslint-disable-next-line react-hooks/rules-of-hooks
  React.useEffect(() => {
    const handler = () => setMatch(!!mediaQuery.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return match;
};

const dropdownRegisterCluster = (
  <DropdownItem key="registercluster" data-testid="register-cluster-item">
    <Link to="/register" className="pf-v6-c-dropdown__menu-item">
      Register disconnected cluster
    </Link>
  </DropdownItem>
);
const toolbarViewArchivedClusters = (
  <ToolbarItem key="archived" alignSelf="center">
    <Link to="/archived">View cluster archives</Link>
  </ToolbarItem>
);
const toolbarViewRequest = (
  <ToolbarItem key="cluster-request" alignSelf="center">
    <Link to="/cluster-request">View cluster requests</Link>
  </ToolbarItem>
);
const dropdownRequest = (
  <DropdownItem key="cluster-request-dropdown" data-testid="cluster-request-dropdown-item">
    <Link to="/cluster-request" className="pf-v6-c-dropdown__menu-item">
      View cluster requests
    </Link>
  </DropdownItem>
);

const dropdownArchived = (
  <DropdownItem key="archived" data-testid="archived-cluster-item">
    <Link to="/archived" className="pf-v6-c-dropdown__menu-item">
      View cluster archives
    </Link>
  </DropdownItem>
);
const toolbarCreateCluster = (
  <ToolbarItem key="createcluster">
    <Link
      to="/create"
      role="button"
      className="pf-v6-c-button pf-m-primary"
      data-testid="create_cluster_btn"
    >
      Create cluster
    </Link>
  </ToolbarItem>
);
const toolbarRegisterCluster = (
  <ToolbarItem key="registercluster">
    <Link to="/register" rel="noopener noreferrer">
      <Button variant="secondary" data-testid="register-cluster-item">
        Register cluster
      </Button>
    </Link>
  </ToolbarItem>
);

const useItems = (isDashboardView, showClusterRequest) => {
  const wide = useMediaQuery('(min-width: 900px)');

  const toolbarItems = [];
  const dropdownItems = [];

  toolbarItems.push(toolbarCreateCluster);
  if (!isRestrictedEnv()) {
    if (isDashboardView) {
      if (wide) {
        toolbarItems.push(toolbarRegisterCluster);
        dropdownItems.push(dropdownArchived);
        if (showClusterRequest) dropdownItems.push(dropdownRequest);
      } else {
        dropdownItems.push(dropdownRegisterCluster);
        dropdownItems.push(dropdownArchived);
        if (showClusterRequest) dropdownItems.push(dropdownRequest);
      }
    } else if (wide) {
      toolbarItems.push(toolbarRegisterCluster);
      toolbarItems.push(toolbarViewArchivedClusters);
      if (showClusterRequest) toolbarItems.push(toolbarViewRequest);
    } else {
      dropdownItems.push(dropdownRegisterCluster);
      dropdownItems.push(dropdownArchived);
      if (showClusterRequest) dropdownItems.push(dropdownRequest);
    }
  }

  return [dropdownItems, toolbarItems];
};

const ClusterListActions = ({ className, isDashboardView, showTabbedView }) => {
  const showClusterRequest = useFeatureGate(AUTO_CLUSTER_TRANSFER_OWNERSHIP);
  const [isOpen, setIsOpen] = useState(false);
  const [dropdownItems, toolbarItems] = useItems(
    isDashboardView,
    showClusterRequest && !showTabbedView,
  );
  const toggleRef = useRef();

  if (isDashboardView) {
    return (
      <Split hasGutter>
        {toolbarItems.map((toolbarItem) => (
          <SplitItem key="toolbar">{toolbarItem}</SplitItem>
        ))}
        <SplitItem key="dropdown">
          <Dropdown
            data-testid="cluster-list-extra-actions-dropdown"
            isOpen={isOpen}
            onOpenChange={(isOpen) => setIsOpen(isOpen)}
            className={className}
            popperProps={{ position: 'right' }}
            toggle={{
              toggleRef,
              toggleNode: (
                <MenuToggle
                  id="cluster-list-extra-actions"
                  aria-label="Actions"
                  ref={toggleRef}
                  isExpanded={isOpen}
                  onClick={() => {
                    setIsOpen(!isOpen);
                  }}
                  variant="plain"
                >
                  <EllipsisVIcon />
                </MenuToggle>
              ),
            }}
          >
            <DropdownList>
              {dropdownItems.map((dropdownItem) => (
                <DropdownItem key={dropdownItem}>{dropdownItem}</DropdownItem>
              ))}
            </DropdownList>
          </Dropdown>
        </SplitItem>
      </Split>
    );
  }
  return (
    <>
      {toolbarItems}
      {dropdownItems.length > 0 && (
        <ToolbarItem>
          <Dropdown
            data-testid="cluster-list-extra-actions-dropdown"
            isOpen={isOpen}
            onOpenChange={(isOpen) => setIsOpen(isOpen)}
            className={className}
            popperProps={{ position: 'right' }}
            toggle={{
              toggleRef,
              toggleNode: (
                <MenuToggle
                  id="cluster-list-extra-actions"
                  aria-label="Actions"
                  ref={toggleRef}
                  isExpanded={isOpen}
                  onClick={() => {
                    setIsOpen(!isOpen);
                  }}
                  variant="plain"
                >
                  <EllipsisVIcon />
                </MenuToggle>
              ),
            }}
          >
            <DropdownList>
              {dropdownItems.map((dropdownItem) => (
                <DropdownItem key={dropdownItem}>{dropdownItem}</DropdownItem>
              ))}
            </DropdownList>
          </Dropdown>
        </ToolbarItem>
      )}
    </>
  );
};

ClusterListActions.propTypes = {
  className: PropTypes.string,
  isDashboardView: PropTypes.bool,
  showTabbedView: PropTypes.bool,
};

export default ClusterListActions;
