import React, { PropsWithChildren } from 'react';

import { ExpandableSection, Title } from '@patternfly/react-core';

const AWSAccountRoles = ['ocm', 'user', 'account'] as const;
export type AWSAccountRole = (typeof AWSAccountRoles)[number];

export type AssociateAWSAccountStepProps = {
  title: string;
  headingLevel?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5';
  /** Indicates if step should be wrapped in an Expandable to be displayed with other steps;
   * otherwise steps are independent and text should not reference other steps.
   */
  expandable?: boolean;
  initiallyExpanded?: boolean;
};

const AssociateAWSAccountStep: React.FC<PropsWithChildren<AssociateAWSAccountStepProps>> = ({
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

export default AssociateAWSAccountStep;
