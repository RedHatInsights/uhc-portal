import React, { PropsWithChildren } from 'react';

import { ExpandableSection, Title } from '@patternfly/react-core';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const AWSAccountRoles = ['ocm', 'user', 'account'] as const;
export type AWSAccountRole = (typeof AWSAccountRoles)[number];

export type AccountsAndRolesDrawerStepProps = {
  title: string;
  headingLevel?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5';
  /** Indicates if step should be wrapped in an Expandable to be displayed with other steps;
   * otherwise steps are independent and text should not reference other steps.
   */
  expandable?: boolean;
  initiallyExpanded?: boolean;
};

const AccountsAndRolesDrawerStep: React.FC<PropsWithChildren<AccountsAndRolesDrawerStepProps>> = ({
  title,
  headingLevel,
  children,
  expandable,
  initiallyExpanded,
}) => {
  const [isExpanded, setIsExpanded] = React.useState(initiallyExpanded);
  const onToggle = (_: React.MouseEvent<Element, MouseEvent>, isExpanded: boolean) => {
    setIsExpanded(isExpanded);
  };

  const level = headingLevel || 'h3';

  return expandable ? (
    <ExpandableSection
      onToggle={(event, isExpanded) => onToggle(event, isExpanded)}
      isExpanded={isExpanded}
      toggleContent={
        <Title headingLevel={level} size="md">
          {title}
        </Title>
      }
    >
      {children}
    </ExpandableSection>
  ) : (
    // eslint-disable-next-line react/jsx-no-useless-fragment
    <>{children}</>
  );
};

export default AccountsAndRolesDrawerStep;
