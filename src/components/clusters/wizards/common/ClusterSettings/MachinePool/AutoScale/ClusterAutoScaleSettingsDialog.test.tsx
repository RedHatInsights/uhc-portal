import React from 'react';
import { Formik } from 'formik';
import merge from 'lodash/merge';

import { getDefaultClusterAutoScaling } from '~/components/clusters/common/clusterAutoScalingValues';
import { MAX_NODES } from '~/components/clusters/common/machinePools/constants';
import { FieldId } from '~/components/clusters/wizards/common';
import modals from '~/components/common/Modal/modals';
import { checkAccessibility, screen, UserEvent, waitFor, within, withState } from '~/testUtils';
import { ClusterAutoscaler } from '~/types/clusters_mgmt.v1';

import ClusterAutoScaleSettingsDialog from './ClusterAutoScaleSettingsDialog';

const defaultState = {
  modal: {
    modalName: modals.EDIT_CLUSTER_AUTOSCALING_V2,
  },
};

const testInputFieldId = 'cluster_autoscaling.scale_down.utilization_threshold';
const getTestInputField = () => document.getElementById(testInputFieldId) as HTMLElement; // no other selector is available for the Input fields
const getModalActionButton = (name: string) => screen.getByRole('button', { name });

const updateTestInputValue = async (
  user: UserEvent,
  { typeValue, clearBefore }: { typeValue: string; clearBefore: boolean },
) => {
  const field = getTestInputField();
  if (clearBefore) {
    await user.clear(field);
  }
  await user.type(field, typeValue, { initialSelectionStart: 0 });
};

// We need to wrap the component in Formik so that the context resolves correctly.
// We are not interested on submit at the form level, as the component being tested is only a subpart
const buildTestComponent = (values?: Partial<ClusterAutoscaler>) => {
  const autoScalingValues = merge({}, getDefaultClusterAutoScaling(), values);
  return (
    <Formik
      initialValues={{
        [FieldId.ClusterAutoscaling]: autoScalingValues,
      }}
      initialTouched={{ [testInputFieldId]: true }} // so that it shows the errors if it's invalid initially
      onSubmit={() => {}}
    >
      <ClusterAutoScaleSettingsDialog isWizard isRosa={false} maxNodesTotalDefault={MAX_NODES} />
    </Formik>
  );
};

describe('<ClusterAutoScaleSettingsDialog />', () => {
  it('is accessible', async () => {
    // Arrange
    const { container } = withState(defaultState).render(buildTestComponent());

    // Assert
    await checkAccessibility(container);
  });

  describe('Field values', () => {
    it('enables autoScaling fields when scaleDown is enabled', async () => {
      // Arrange
      withState(defaultState).render(buildTestComponent());

      // Assert
      const scaleDownField = getTestInputField();
      expect(scaleDownField).toBeEnabled();
    });

    it('disables autoScaling fields when scaleDown is disabled', async () => {
      // Arrange
      withState(defaultState).render(
        buildTestComponent({
          scale_down: {
            enabled: false,
          },
        }),
      );

      // Assert
      const scaleDownField = getTestInputField();
      expect(scaleDownField).toBeDisabled();
    });

    it('shows the correct boolean values in the boolean select component', async () => {
      // Arrange
      withState(defaultState).render(buildTestComponent());

      // Assert
      expect(
        within(screen.getByRole('group', { name: /skip-nodes-with-local-storage/ })).getByRole(
          'button',
        ),
      ).toHaveTextContent('true');
      expect(
        within(screen.getByRole('group', { name: /balance-similar-node-groups/ })).getByRole(
          'button',
        ),
      ).toHaveTextContent('false');
    });
  });

  describe('Modal Buttons', () => {
    it('"Close" becomes disabled when some field has errors', async () => {
      // Arrange
      const { user } = withState(defaultState).render(buildTestComponent());
      expect(getModalActionButton('Close')).toBeEnabled();
      expect(getTestInputField()).toHaveValue(0.5);

      // Act
      await updateTestInputValue(user, { typeValue: '44', clearBefore: false });

      // Assert
      expect(getTestInputField()).toHaveValue(440.5); // It's a range between 0 and 1
      await waitFor(() => expect(getModalActionButton('Close')).toBeDisabled());
    });

    it('"Close" button becomes enabled when the error is fixed', async () => {
      // Arrange
      const { user } = withState(defaultState).render(buildTestComponent());

      // Act - first get the component in an error state and fix it
      await updateTestInputValue(user, { typeValue: '11', clearBefore: true });
      await waitFor(() => expect(getModalActionButton('Close')).toBeDisabled());
      await updateTestInputValue(user, { typeValue: '0.33', clearBefore: true });

      // Assert
      await waitFor(() => expect(getModalActionButton('Close')).toBeEnabled());
    });
  });
});
