import React, { useCallback, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useDispatch } from 'react-redux';

import {
  Drawer,
  DrawerActions,
  DrawerCloseButton,
  DrawerContent,
  DrawerContentBody,
  DrawerHead,
  DrawerPanelBody,
  DrawerPanelContent,
  Flex,
  FlexItem,
  Gallery,
  Grid,
  GridItem,
  Tab,
  Tabs,
  TabTitleText,
  Title,
} from '@patternfly/react-core';

import { useGlobalState } from '~/redux/hooks/useGlobalState';

import { setAddonsDrawer } from '../AddOnsActions';
import AddOnsCard from '../AddOnsCard';
import AddOnsConstants from '../AddOnsConstants';
import AddOnsDeleteModal from '../AddOnsDeleteModal';
import {
  getAddOnBillingQuota,
  getInstalled,
  hasQuota,
  validateAddOnRequirements,
} from '../AddOnsHelper';
import AddOnsParametersModal from '../AddOnsParametersModal';
import AddOnStateLabel from '../AddOnStateLabel';

import AddOnsFailedBox from './AddOnsDrawerFailedBox';
import AddOnsMetaDataItem from './AddOnsDrawerMetadataItem';
import AddOnsParameterList from './AddOnsDrawerParameterList';
import AddOnsPrimaryButton from './AddOnsDrawerPrimaryButton';
import AddOnsRequirementContent from './AddOnsDrawerRequirementContent';
import AddOnsSubscription from './AddOnsSubscription';

import './AddOnsDrawer.scss';

const AddOnsDrawer = ({
  cluster,
  organization,
  quota,
  clusterAddOns,
  addClusterAddOn,
  isAddClusterAddOnError,
  addClusterAddOnError,
  isAddClusterAddOnPending,
  addOnsList,
  updateClusterAddOn,
  isUpdateClusterAddOnError,
  updateClusterAddOnError,
  isUpdateClusterAddOnPending,
  deleteClusterAddOn,
  isDeleteClusterAddOnPending,
  isDeleteClusterAddOnError,
  deleteClusterAddOnError,
}) => {
  const dispatch = useDispatch();

  const drawer = useGlobalState((state) => state.addOns.drawer);

  // check if user has quota for addons
  const getHasQuota = (addOn) =>
    addOn !== null ? hasQuota(addOn, cluster, organization, quota) : false;

  // return installed addon
  const getInstalledAddon = (addOn) => getInstalled(addOn, clusterAddOns);

  // toggle currently active tab
  const handleTabClick = (event, tabIndex) => {
    dispatch(
      setAddonsDrawer({
        activeTabKey: tabIndex,
      }),
    );
    event.preventDefault();
  };

  // handle close drawer, reset state back to null
  const handleCloseDrawer = () => {
    dispatch(
      setAddonsDrawer({
        activeCard: null,
        activeCardRequirements: null,
        activeCardRequirementsFulfilled: true,
        open: false,
        activeTabKey: 0,
      }),
    );
  };

  const setDrawerContent = useCallback(
    (selectedAddOnId) => {
      const addOn = addOnsList.find((addOn) => addOn.id === selectedAddOnId);

      // get installedAddon
      const installedAddOn = getInstalled(addOn, clusterAddOns);

      // get addOn requirements
      const requirements = validateAddOnRequirements(addOn);

      // get billing / quota info
      const billingQuota = getAddOnBillingQuota(addOn, quota);

      dispatch(
        setAddonsDrawer({
          // set active card states
          activeCard: addOn,
          // set requirements state
          activeCardRequirementsFulfilled: requirements.fulfilled,
          activeCardRequirements: requirements.errorMsgs,
          // set installed addon
          installedAddOn,
          // set billing model
          billingQuota,
          // set drawer state
          open: true,
          activeTabKey: 0,
        }),
      );
    },
    [addOnsList, clusterAddOns, dispatch, quota],
  );

  // handles card click
  const handleCardClick = (addOn) => () => {
    // if activeCard is clicked again close drawer
    if (addOn.id === drawer.activeCard?.id) {
      handleCloseDrawer();
      return;
    }

    setDrawerContent(addOn.id);
  };

  const {
    open,
    // current selected addon info
    activeCard,
    // current selected installed addon info
    installedAddOn,
    // current selected addon requirements
    activeCardRequirements,
    activeCardRequirementsFulfilled,
    // current billing model
    billingQuota,
    // current drawer state
    activeTabKey,
    subscriptionModels,
  } = drawer;

  useEffect(() => {
    // updating the drawer content when the cluster addons are updated and the drawer is open
    if (clusterAddOns && addOnsList && drawer.open && drawer.activeCard?.id) {
      setDrawerContent(drawer.activeCard.id);
    }
  }, [addOnsList, clusterAddOns, drawer.activeCard?.id, drawer.open, setDrawerContent]);

  // panel content for selected active card
  const panelContent = (
    <DrawerPanelContent className="ocm-c-addons__drawer--panel-content">
      <DrawerHead className="ocm-c-addons__drawer--header">
        <Grid hasGutter>
          <GridItem span={3}>
            {activeCard?.icon && (
              <img alt={activeCard?.name} src={`data:image/png;base64,${activeCard?.icon}`} />
            )}
          </GridItem>
          <GridItem span={9}>
            <Title headingLevel="h2" size="xl">
              {activeCard?.name}
            </Title>
          </GridItem>
        </Grid>
        <DrawerActions>
          <DrawerCloseButton onClick={handleCloseDrawer} />
        </DrawerActions>
      </DrawerHead>
      <DrawerPanelBody>
        <AddOnStateLabel
          addOn={activeCard}
          requirements={validateAddOnRequirements(activeCard)}
          installedAddOn={installedAddOn}
        />
        <AddOnsFailedBox installedAddOn={installedAddOn} />
      </DrawerPanelBody>
      <div>
        <Tabs
          activeKey={activeTabKey}
          onSelect={handleTabClick}
          inset={{
            default: 'insetNone',
            md: 'insetSm',
            xl: 'inset2xl',
            '2xl': 'insetLg',
          }}
        >
          <Tab eventKey={0} title={<TabTitleText>Details</TabTitleText>}>
            <DrawerPanelBody className="ocm-addons-tab--drawer-panel-body">
              <Flex spaceItems={{ default: 'spaceItemsLg' }} direction={{ default: 'column' }}>
                <FlexItem>{activeCard?.description}</FlexItem>
                <AddOnsMetaDataItem
                  activeCardDocsLink={activeCard?.docs_link}
                  installedAddOnOperatorVersion={installedAddOn?.operator_version}
                  addonID={activeCard?.id}
                  clusterID={cluster?.id}
                  externalClusterID={cluster?.external_id}
                  subscriptionPlanID={cluster?.subscription?.plan?.id}
                />
                <AddOnsParameterList
                  installedAddOn={installedAddOn}
                  activeCard={activeCard}
                  activeCardID={activeCard?.id}
                  installedAddOnState={installedAddOn?.state}
                  cluster={cluster}
                />
                <AddOnsSubscription
                  activeCardId={activeCard?.id}
                  billingQuota={billingQuota}
                  installedAddOn={installedAddOn}
                  subscriptionModels={subscriptionModels}
                />
              </Flex>
            </DrawerPanelBody>
            {installedAddOn?.state === AddOnsConstants.INSTALLATION_STATE.DELETING ? null : (
              <DrawerPanelBody className="drawer-panel-body">
                <AddOnsPrimaryButton
                  activeCard={activeCard}
                  activeCardRequirementsFulfilled={activeCardRequirementsFulfilled}
                  addClusterAddOn={addClusterAddOn}
                  isAddClusterAddOnPending={isAddClusterAddOnPending}
                  cluster={cluster}
                  hasQuota={getHasQuota(activeCard)}
                  installedAddOn={installedAddOn}
                  installedAddOnOperatorVersion={installedAddOn?.operator_version}
                  subscriptionModels={subscriptionModels}
                  updateClusterAddOn={updateClusterAddOn}
                />
              </DrawerPanelBody>
            )}
          </Tab>
          {!activeCardRequirementsFulfilled && (
            <Tab eventKey={1} title={<TabTitleText>Prerequisites</TabTitleText>}>
              <DrawerPanelBody className="ocm-addons-tab--drawer-panel-body">
                <Flex spaceItems={{ default: 'spaceItemsLg' }} direction={{ default: 'column' }}>
                  <FlexItem>
                    <AddOnsRequirementContent activeCardRequirements={activeCardRequirements} />
                  </FlexItem>
                </Flex>
              </DrawerPanelBody>
            </Tab>
          )}
        </Tabs>
      </div>
    </DrawerPanelContent>
  );

  return (
    <>
      <Drawer
        isExpanded={open}
        isInline
        className="ocm-addons-tab--addon-drawer pf-m-inline-on-2xl"
      >
        <DrawerContent
          panelContent={activeCard ? panelContent : null}
          className="pf-m-no-background ocm-c-addons__drawer--panel-gallery"
        >
          <DrawerContentBody hasPadding>
            <Gallery hasGutter className="ocm-fix-selectable-card-border">
              {addOnsList.map((addOn) => (
                <AddOnsCard
                  key={addOn.id}
                  addOn={addOn}
                  installedAddOn={getInstalledAddon(addOn)}
                  requirements={validateAddOnRequirements(addOn)}
                  onClick={handleCardClick(addOn)}
                  activeCard={activeCard?.id}
                />
              ))}
            </Gallery>
          </DrawerContentBody>
        </DrawerContent>
      </Drawer>

      <AddOnsParametersModal
        clusterID={cluster.id}
        cluster={cluster}
        quota={quota}
        updateClusterAddOn={updateClusterAddOn}
        isUpdateClusterAddOnError={isUpdateClusterAddOnError}
        updateClusterAddOnError={updateClusterAddOnError}
        isUpdateClusterAddOnPending={isUpdateClusterAddOnPending}
        addClusterAddOn={addClusterAddOn}
        isAddClusterAddOnError={isAddClusterAddOnError}
        addClusterAddOnError={addClusterAddOnError}
        isAddClusterAddOnPending={isAddClusterAddOnPending}
      />

      <AddOnsDeleteModal
        deleteClusterAddOn={deleteClusterAddOn}
        isDeleteClusterAddOnPending={isDeleteClusterAddOnPending}
        isDeleteClusterAddOnError={isDeleteClusterAddOnError}
        deleteClusterAddOnError={deleteClusterAddOnError}
      />
    </>
  );
};

AddOnsDrawer.propTypes = {
  addOnsList: PropTypes.array.isRequired,
  clusterAddOns: PropTypes.object.isRequired,
  cluster: PropTypes.object.isRequired,
  organization: PropTypes.object.isRequired,
  quota: PropTypes.object.isRequired,
  addClusterAddOn: PropTypes.func.isRequired,
  updateClusterAddOn: PropTypes.func.isRequired,
  deleteClusterAddOnError: PropTypes.object.isRequired,
  isDeleteClusterAddOnError: PropTypes.bool.isRequired,
  isDeleteClusterAddOnPending: PropTypes.bool.isRequired,
  isAddClusterAddOnError: PropTypes.bool.isRequired,
  addClusterAddOnError: PropTypes.object.isRequired,
  isAddClusterAddOnPending: PropTypes.bool.isRequired,
  isUpdateClusterAddOnError: PropTypes.bool.isRequired,
  updateClusterAddOnError: PropTypes.object.isRequired,
  isUpdateClusterAddOnPending: PropTypes.bool.isRequired,
  deleteClusterAddOn: PropTypes.func.isRequired,
};

export default AddOnsDrawer;
