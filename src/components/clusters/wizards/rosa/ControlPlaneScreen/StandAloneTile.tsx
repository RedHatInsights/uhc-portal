import React from 'react';

import { Content, ContentVariants, List } from '@patternfly/react-core';
import { Tile } from '@patternfly/react-core/deprecated';

import { defaultMarginBottomSpacing, hypershiftValue, ListItem } from './ControlPlaneCommon';

type StandAloneTileProps = {
  handleChange: (string: hypershiftValue) => void;
  isSelected: boolean;
};

const StandAloneTile = ({ handleChange, isSelected }: StandAloneTileProps) => (
  <Tile
    title="ROSA classic architecture"
    isDisplayLarge
    isStacked
    isSelected={isSelected}
    onClick={() => handleChange('false')}
    className="controlPlaneScreenTile"
    data-testid="standalone-control-planes"
  >
    <Content component={ContentVariants.p} className={defaultMarginBottomSpacing}>
      The Red Hat OpenShift Service on AWS (classic architecture) runs an OpenShift cluster with a
      coupled control and data plane, hosted on dedicated nodes with a shared network.
    </Content>
    <List isPlain className={defaultMarginBottomSpacing}>
      <ListItem>Control plane resources are hosted in your own AWS account</ListItem>
      <ListItem>Full compliance certifications</ListItem>
      <ListItem>Red Hat SRE managed</ListItem>
    </List>
  </Tile>
);

export { StandAloneTile };
