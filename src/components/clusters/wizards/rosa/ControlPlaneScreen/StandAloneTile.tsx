import React from 'react';

import {
  Card,
  CardBody,
  CardHeader,
  CardTitle,
  Content,
  ContentVariants,
  List,
} from '@patternfly/react-core';

import { defaultMarginBottomSpacing, hypershiftValue, ListItem } from './ControlPlaneCommon';

type StandAloneTileProps = {
  handleChange: (string: hypershiftValue) => void;
  isSelected: boolean;
};

const StandAloneTile = ({ handleChange, isSelected }: StandAloneTileProps) => (
  <Card
    id="standalone-control-plane-card"
    data-testid="standalone-control-planes"
    isSelectable
    isSelected={isSelected}
    isFullHeight
  >
    <CardHeader
      selectableActions={{
        variant: 'single',
        onChange: () => handleChange('false'),
        isHidden: true,
        selectableActionAriaLabelledby: 'standalone-control-plane-card-title',
      }}
    >
      <CardTitle id="standalone-control-plane-card-title">ROSA classic architecture</CardTitle>
    </CardHeader>
    <CardBody>
      <Content component={ContentVariants.p} className={defaultMarginBottomSpacing}>
        The Red Hat OpenShift Service on AWS (classic architecture) runs an OpenShift cluster with a
        coupled control and data plane, hosted on dedicated nodes with a shared network.
      </Content>
      <List isPlain className={defaultMarginBottomSpacing}>
        <ListItem>Control plane resources are hosted in your own AWS account</ListItem>
        <ListItem>Full compliance certifications</ListItem>
        <ListItem>Red Hat SRE managed</ListItem>
      </List>
      {/* </Tile> */}
    </CardBody>
  </Card>
);

export { StandAloneTile };
