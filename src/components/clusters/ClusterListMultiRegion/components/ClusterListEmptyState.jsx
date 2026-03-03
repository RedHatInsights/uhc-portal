// ClusterListEmptyState is the empty state (no clusters) for ClusterList
import React, { useRef, useState } from 'react';
import PropTypes from 'prop-types';

import {
  Button,
  Dropdown,
  DropdownItem,
  DropdownList,
  EmptyState,
  EmptyStateActions,
  EmptyStateBody,
  EmptyStateFooter,
  EmptyStateVariant,
  MenuToggle,
} from '@patternfly/react-core';
import { PlusCircleIcon } from '@patternfly/react-icons/dist/esm/icons/plus-circle-icon';

import { Link } from '~/common/routing';

function ClusterListEmptyState({ showTabbedView }) {
  const [isOpen, setIsOpen] = useState(false);
  const toggleRef = useRef();

  return (
    <EmptyState
      headingLevel="h4"
      icon={PlusCircleIcon}
      titleText="Let&#39;s create your first cluster"
      variant={EmptyStateVariant.lg}
      className="cluster-list-empty-state"
    >
      <EmptyStateBody>
        You don&#39;t have any clusters yet, but you can easily create or register your first
        OpenShift 4 cluster.
      </EmptyStateBody>
      <EmptyStateFooter>
        <Dropdown
          isOpen={isOpen}
          onSelect={() => setIsOpen(false)}
          onOpenChange={setIsOpen}
          className="pf-v6-u-mt-xl"
          data-testid="add-cluster-dropdown"
          toggle={{
            toggleRef,
            toggleNode: (
              <MenuToggle
                ref={toggleRef}
                onClick={() => setIsOpen(!isOpen)}
                isExpanded={isOpen}
                variant="primary"
                data-testid="add-cluster-dropdown-toggle"
              >
                Add cluster
              </MenuToggle>
            ),
          }}
        >
          <DropdownList>
            <DropdownItem key="create-cluster" data-testid="create_cluster_btn">
              <Link to="/create" className="pf-v6-c-dropdown__menu-item">
                Create cluster
              </Link>
            </DropdownItem>
            <DropdownItem key="register-cluster" data-testid="register-cluster-item">
              <Link to="/register" className="pf-v6-c-dropdown__menu-item">
                Register cluster
              </Link>
            </DropdownItem>
          </DropdownList>
        </Dropdown>
        <EmptyStateActions>
          <Link to="/archived">
            <Button variant="link">View cluster archives</Button>
          </Link>
          {!showTabbedView && (
            <Link to="/cluster-request">
              <Button variant="link">View cluster requests</Button>
            </Link>
          )}
          <Link to="/assisted-installer">
            <Button variant="link">Assisted Installer clusters</Button>
          </Link>
        </EmptyStateActions>
      </EmptyStateFooter>
    </EmptyState>
  );
}

ClusterListEmptyState.propTypes = {
  showTabbedView: PropTypes.bool,
};

export default ClusterListEmptyState;
