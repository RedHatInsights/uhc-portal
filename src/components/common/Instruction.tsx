import React from 'react';

import { Content } from '@patternfly/react-core';

import './Instruction.scss';

type Props = {
  children?: React.ReactNode;
  simple?: boolean;
};

const Instruction = ({ children, simple }: Props) => (
  <Content
    component="li"
    className={simple ? 'ocm-instructions__list-item-simple' : 'ocm-instructions__list-item'}
  >
    <div className="ocm-instructions__list-item-contents">{children}</div>
  </Content>
);

export default Instruction;
