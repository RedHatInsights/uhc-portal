import React from 'react';

import { Content, ContentVariants } from '@patternfly/react-core';

import './Instructions.scss';

type Props = {
  children?: React.ReactNode;
  wide?: boolean;
};

const Instructions = ({ children, wide }: Props) => (
  <div className="ocm-instructions">
    <Content
      component={ContentVariants.ol}
      className={`ocm-instructions__list ${wide ? 'pf-v6-u-max-width' : ''}`}
    >
      {children}
    </Content>
  </div>
);

export default Instructions;
