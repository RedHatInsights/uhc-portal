// Modals shared between Cluster List and Cluster Details
import React from 'react';
import PropTypes from 'prop-types';

import AddHtpasswdUserModal from '~/components/clusters/ClusterDetailsMultiRegion/components/IdentityProvidersPage/components/HtpasswdDetails/AddUserModal';
import EditHtpasswdUserModal from '~/components/clusters/ClusterDetailsMultiRegion/components/IdentityProvidersPage/components/HtpasswdDetails/EditUserModal';

import ConnectedModal from '../../common/Modal/ConnectedModal';
import { ConnectedEditMachinePoolModal as ConnectedEditMachinePoolModalMR } from '../ClusterDetailsMultiRegion/components/MachinePools/components/EditMachinePoolModal/EditMachinePoolModal';
import AutoTransferClusterOwnershipFormMR from '../ClusterTransfer/AutoTransferClusterOwnershipForm';

import DeleteProtectionModalMR from './DeleteProtectionModal/DeleteProtectionModal';
import EditSubscriptionSettingsDialogMR from './EditSubscriptionSettingsDialog/EditSubscriptionSettingsDialog';
import TransferClusterOwnershipDialogMR from './TransferClusterOwnershipDialog/TransferClusterOwnershipDialog';
import UpgradeWizardMR from './Upgrades/UpgradeWizard/UpgradeWizard';
import ArchiveClusterDialogMR from './ArchiveClusterDialog';
import DeleteClusterDialogMR from './DeleteClusterDialog';
import EditConsoleURLDialogMR from './EditConsoleURLDialog';
import EditDisplayNameDialogMR from './EditDisplayNameDialog';
import HibernateClusterModalMR from './HibernateClusterModal';
import ResumeClusterModalMR from './ResumeClusterModal';
import ScaleClusterDialogMR from './ScaleClusterDialog';
import UnarchiveClusterDialogMR from './UnarchiveClusterDialog';
import UpgradeTrialClusterDialogMR from './UpgradeTrialClusterDialog';

function CommonClusterModals({ onClose, onClusterDeleted, clearMachinePools }) {
  return (
    <>
      <ConnectedModal ModalComponent={EditDisplayNameDialogMR} onClose={onClose} />
      <ConnectedModal ModalComponent={EditConsoleURLDialogMR} onClose={onClose} />
      <ConnectedModal
        ModalComponent={EditSubscriptionSettingsDialogMR}
        onClose={onClose}
        isDialog
      />
      <ConnectedModal ModalComponent={ScaleClusterDialogMR} onClose={onClose} />

      <ConnectedModal ModalComponent={ArchiveClusterDialogMR} onClose={onClose} />
      <ConnectedModal ModalComponent={TransferClusterOwnershipDialogMR} onClose={onClose} />
      <ConnectedModal ModalComponent={AutoTransferClusterOwnershipFormMR} onClose={onClose} />
      <ConnectedModal ModalComponent={HibernateClusterModalMR} onClose={onClose} />
      <ConnectedModal ModalComponent={ResumeClusterModalMR} onClose={onClose} />
      <ConnectedModal ModalComponent={UpgradeTrialClusterDialogMR} onClose={onClose} />
      <ConnectedModal ModalComponent={UnarchiveClusterDialogMR} onClose={onClose} />
      <ConnectedModal ModalComponent={UpgradeWizardMR} />

      <ConnectedModal ModalComponent={AddHtpasswdUserModal} />
      <ConnectedModal ModalComponent={EditHtpasswdUserModal} />

      <ConnectedModal ModalComponent={DeleteProtectionModalMR} onClose={onClose} />

      <ConnectedModal
        ModalComponent={DeleteClusterDialogMR}
        onClose={(clusterDeleted) => {
          if (clusterDeleted) {
            if (onClusterDeleted) {
              onClusterDeleted();
            } else {
              onClose();
            }
          }
        }}
      />
      <ConnectedModal
        ModalComponent={ConnectedEditMachinePoolModalMR}
        clearMachinePools={clearMachinePools}
      />
    </>
  );
}

CommonClusterModals.propTypes = {
  onClose: PropTypes.func.isRequired,
  onClusterDeleted: PropTypes.func,
  clearMachinePools: PropTypes.bool,
};

export default CommonClusterModals;
