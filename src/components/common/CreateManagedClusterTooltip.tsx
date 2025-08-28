import React from 'react';

import { Tooltip } from '@patternfly/react-core';

import { useCanCreateManagedCluster } from '~/queries/ClusterDetailsQueries/useFetchActionsPermissions';

const TOOLTIP_MESSAGE = 'You do not have permission to create a managed cluster.';
const TOOLTIP_WRAPPER_TEST_ID = 'create-cluster-tooltip-wrapper';

type Props = {
  children?: React.ReactNode;
  wrap?: boolean;
  childComponent?: React.ComponentType<any>;
} & Record<string, any>;

type DisabledProps = {
  isAriaDisabled?: boolean;
  isDisabled?: boolean;
  isReadOnly?: boolean;
  disabled?: boolean;
} & Record<string, any>;

const wrapContent = (content: React.ReactNode, wrap: boolean): React.ReactElement => {
  // if not a valid element, wrap it in a div so it can be used in a tooltip
  if (wrap || !React.isValidElement(content)) {
    return <div data-testid={TOOLTIP_WRAPPER_TEST_ID}>{content}</div>;
  }
  return content;
};

const isDisabledByProps = (props: DisabledProps): boolean =>
  !!(props.isAriaDisabled || props.isDisabled || props.isReadOnly || props.disabled);

export const CreateManagedClusterButtonWithTooltip = ({
  children,
  wrap = false,
  childComponent,
  ...otherProps
}: Props) => {
  const { canCreateManagedCluster } = useCanCreateManagedCluster();
  const Component = childComponent;

  const childrenContent = Component ? <Component {...otherProps}>{children}</Component> : children;

  if (!childrenContent) {
    return null;
  }

  const content = wrapContent(childrenContent, wrap);

  const shouldShowTooltip = !canCreateManagedCluster || isDisabledByProps(otherProps);

  return shouldShowTooltip ? <Tooltip content={TOOLTIP_MESSAGE}>{content}</Tooltip> : content;
};
