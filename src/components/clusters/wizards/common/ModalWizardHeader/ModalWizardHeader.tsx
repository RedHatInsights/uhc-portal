import React from 'react';

import { Content, ModalHeader } from '@patternfly/react-core';

import './modalWizardHeader.scss';

export const ModalWizardHeader = ({
  title,
  description,
}: {
  title: string;
  description: string;
}) => (
  <ModalHeader className="modal-wizard-header">
    <Content>
      <h2 className="modal-wizard-header__title">{title}</h2>
      {description ? <div className="modal-wizard-header__description">{description}</div> : null}
    </Content>
  </ModalHeader>
);
