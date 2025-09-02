import React from 'react';
import PropTypes from 'prop-types';
import { useDispatch } from 'react-redux';

import { Button, FlexItem, Popover } from '@patternfly/react-core';
import { OutlinedQuestionCircleIcon } from '@patternfly/react-icons/dist/esm/icons/outlined-question-circle-icon';
import { PencilAltIcon } from '@patternfly/react-icons/dist/esm/icons/pencil-alt-icon';

import { openModal } from '../../../../../common/Modal/ModalActions';
import { hasParameters, parameterAndValue } from '../AddOnsHelper';
import AddOnsParametersModal from '../AddOnsParametersModal';

import './AddOnsDrawer.scss';

function AddOnsParameterList(props) {
  const dispatch = useDispatch();
  const { installedAddOn, activeCard, activeCardID, cluster } = props;

  // render addon parameters list and link to configuration of parameters
  if (installedAddOn && activeCard && hasParameters(activeCard)) {
    // get addon installation parameter object
    const paramObjects = parameterAndValue(installedAddOn, activeCard, cluster);
    const paramItems = Object.entries(paramObjects.parameters).map(([key, param]) => (
      <p key={key}>
        <b className="parameter-list-key">{param.name}</b>{' '}
        <Popover
          aria-label="param-popover"
          headerContent={<div>{param.name}</div>}
          bodyContent={<div>{param.description}</div>}
        >
          <Button
            isInline
            variant="link"
            icon={<OutlinedQuestionCircleIcon className="ocm-addons-tab--parameter-tooltip-icon" />}
          />
        </Popover>{' '}
        {param.value}
      </p>
    ));

    // return list of parameters and configure link
    return (
      <FlexItem>
        <p className="ocm-addons-tab--configuration-title">
          Configuration{' '}
          <Button
            aria-label="edit configuration"
            ouiaId={`update-addon-${activeCardID}`}
            variant="link"
            isDisabled={!cluster.canEdit}
            icon={<PencilAltIcon className="ocm-addons-tab--configuration-title-icon" />}
            onClick={() =>
              dispatch(
                openModal('add-ons-parameters-modal', {
                  clusterID: cluster.id,
                  addOn: activeCard,
                  addOnInstallation: installedAddOn,
                  isUpdateForm: true,
                }),
              )
            }
          />
        </p>
        {paramItems}
        <AddOnsParametersModal clusterID={cluster.id} />
      </FlexItem>
    );
  }
  return null;
}

AddOnsParameterList.propTypes = {
  installedAddOn: PropTypes.object,
  activeCard: PropTypes.object,
  activeCardID: PropTypes.string,
  cluster: PropTypes.object,
};

export default AddOnsParameterList;
