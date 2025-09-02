import React from 'react';

import { Alert, Content, ContentVariants, Label, List } from '@patternfly/react-core';
import { Tile } from '@patternfly/react-core/deprecated';
import { StarIcon } from '@patternfly/react-icons/dist/esm/icons/star-icon';

import links from '~/common/installLinks.mjs';
import ExternalLink from '~/components/common/ExternalLink';

import {
  defaultMarginBottomSpacing,
  defaultMarginTopBottomSpacing,
  hypershiftValue,
  ListItem,
} from './ControlPlaneCommon';

type HostedTileProps = {
  handleChange: (string: hypershiftValue) => void;
  isHostedDisabled: boolean;
  isSelected: boolean;
};

const HostedTile = ({ handleChange, isHostedDisabled, isSelected }: HostedTileProps) => (
  <Tile
    title="ROSA hosted architecture"
    isDisplayLarge
    isStacked
    onClick={() => !isHostedDisabled && handleChange('true')}
    isDisabled={isHostedDisabled}
    isSelected={isSelected}
    className="controlPlaneScreenTile"
    data-testid="hosted-control-planes"
  >
    <Label
      variant="filled"
      color="blue"
      icon={<StarIcon data-icon="star" />}
      className={defaultMarginTopBottomSpacing}
    >
      Recommended
    </Label>
    {isHostedDisabled && (
      <Alert
        variant="info"
        title={
          <>
            To create hosted control plane clusters, you&apos;ll need to{' '}
            <ExternalLink href={links.AWS_CONSOLE_ROSA_HOME_GET_STARTED}>
              enable ROSA hosted control plane
            </ExternalLink>
          </>
        }
        className={defaultMarginBottomSpacing}
      />
    )}

    <Content component={ContentVariants.p} className={defaultMarginBottomSpacing}>
      The Red Hat OpenShift Service on AWS with a hosted control plane architecture (ROSA HCP) runs
      an OpenShift cluster with a decoupled control plane as a multi-tenant workload and a data
      plane on a separate network for segmented management and workload traffic.
    </Content>
    <List isPlain className={defaultMarginBottomSpacing}>
      <ListItem>Control plane resources are hosted in a Red Hat-owned AWS account</ListItem>
      <ListItem>Better resource utilization with faster cluster creation</ListItem>
      <ListItem>Lower AWS infrastructure costs</ListItem>
      <ListItem>Full compliance certifications</ListItem>
      <ListItem>Red Hat SRE managed</ListItem>
    </List>
    <Alert
      variant="warning"
      isInline
      isPlain
      title="A Virtual Private Cloud is required for ROSA clusters hosted by Red Hat"
      className={defaultMarginBottomSpacing}
    >
      <Content component={ContentVariants.p}>
        <ExternalLink href={links.VIRTUAL_PRIVATE_CLOUD_URL}>
          Learn more about Virtual Private Cloud
        </ExternalLink>
      </Content>
    </Alert>
  </Tile>
);

export { HostedTile };
