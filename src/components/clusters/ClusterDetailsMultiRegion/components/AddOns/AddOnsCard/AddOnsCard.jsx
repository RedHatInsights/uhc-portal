import React from 'react';
import PropTypes from 'prop-types';

import { Card, CardBody, CardFooter, CardHeader, CardTitle } from '@patternfly/react-core';

import AddOnStateLabel from '../AddOnStateLabel';

import './AddOnsCard.scss';

// reduce card description to 60 chars for uniform cards
const reduceCardDescription = (addOn) => {
  const descriptionLength = 60;
  return addOn.description.length > descriptionLength
    ? `${addOn.description.substring(0, descriptionLength - 3)}...`
    : addOn.description;
};

const AddOnsCard = ({ addOn, installedAddOn, requirements, activeCard, onClick }) => (
  <Card
    id={`card-addon-id-${addOn.id}`}
    isSelectable
    isSelected={activeCard === addOn.id}
    key={addOn.id}
    ouiaId={`card-addon-${addOn.id}`}
    className="ocm-c-addons__card"
    data-testid="addOnCard"
  >
    <CardHeader
      className="ocm-c-addons__card--header"
      selectableActions={{
        selectableActionAriaLabelledby: `card-addon-id-${addOn.id}`,
        name: `card-addon-id-${addOn.id}`,
        variant: 'single',
        onChange: onClick,
        isHidden: true,
      }}
    >
      {addOn.icon && <img alt={addOn.name} src={`data:image/png;base64,${addOn.icon}`} />}
    </CardHeader>
    <CardTitle>{addOn.name}</CardTitle>
    <CardBody className="ocm-c-addons__card--body" data-testid="cardBody">
      {reduceCardDescription(addOn)}
    </CardBody>
    <CardFooter>
      <AddOnStateLabel addOn={addOn} requirements={requirements} installedAddOn={installedAddOn} />
    </CardFooter>
  </Card>
);

AddOnsCard.propTypes = {
  addOn: PropTypes.object.isRequired,
  installedAddOn: PropTypes.object,
  requirements: PropTypes.object.isRequired,
  onClick: PropTypes.func.isRequired,
  activeCard: PropTypes.string,
};

export default AddOnsCard;
