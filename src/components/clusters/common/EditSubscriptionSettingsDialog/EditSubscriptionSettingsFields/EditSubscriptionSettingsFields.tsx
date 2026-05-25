import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { isEqual } from 'lodash';

import { FormGroup } from '@patternfly/react-core';

import { subscriptionSettings } from '~/common/subscriptionTypes';
import { FormGroupHelperText } from '~/components/common/FormGroupHelperText';
import { ReduxFormRadioGroup } from '~/components/common/ReduxFormComponents_deprecated';
import {
  SubscriptionCommonFieldsCluster_billing_model as SubscriptionCommonFieldsClusterBillingModel,
  SubscriptionCommonFieldsService_level as SubscriptionCommonFieldsServiceLevel,
  SubscriptionCommonFieldsStatus,
  SubscriptionCommonFieldsSupport_level as SubscriptionCommonFieldsSupportLevel,
  SubscriptionCommonFieldsSystem_units as SubscriptionCommonFieldsSystemUnits,
  SubscriptionCommonFieldsUsage,
} from '~/types/accounts_mgmt.v1';

import BillingModelAlert from './components/BillingModelAlert';
import CpuSocketNumberField from './components/CpuSocketNumberField';
import ServiceLevelLabel from './components/ServiceLevelLabel';
import SupportLevelLabel from './components/SupportLevelLabel';
import SystemUnitsLabel from './components/SystemUnitsLabel';
import Tooltips from './components/Tooltips';
import UsageLabel from './components/UsageLabel';
import { EditSubcriptionOption } from './model/EditSubcriptionOption';
import { EditSubsriptionSettingsFieldsValues } from './model/EditSubsriptionSettingsFieldsValues';
import { MIN_VAL } from './constants';
import { resetOptions } from './optionUtils';
import {
  getBillingModelAlertText,
  getFieldLabel,
  getSettingsBasedOnDefaultOptions,
  getSettingsBasedOnOptions,
  validateSystemUnitsNumericField,
} from './utils';

type EditSubscriptionSettingsFieldsProps = {
  canSubscribeStandardOCP: boolean;
  canSubscribeMarketplaceOCP: boolean;
  initialSettings: EditSubsriptionSettingsFieldsValues;
  onSettingsChange: (settings: { [index: string]: any }) => void;
};

const EditSubscriptionSettingsFields = ({
  canSubscribeStandardOCP,
  canSubscribeMarketplaceOCP,
  initialSettings,
  onSettingsChange,
}: EditSubscriptionSettingsFieldsProps) => {
  const radioGroupClasses = ['subscription-settings', 'radio-group'];
  const radioGroupClassName = radioGroupClasses.join(' ');

  const [settings, setSettings] = useState(initialSettings);
  const [options, setOptions] = useState<{ [index: string]: EditSubcriptionOption[] | number }>();

  const isDisabled = useMemo(
    () => !canSubscribeStandardOCP && !canSubscribeMarketplaceOCP,
    [canSubscribeMarketplaceOCP, canSubscribeStandardOCP],
  );
  const isDisabledByBillingModel = useMemo(
    () =>
      settings.cluster_billing_model === SubscriptionCommonFieldsClusterBillingModel.marketplace,
    [settings.cluster_billing_model],
  );
  const isDisabledBySupportLevel = useMemo(
    () =>
      ![
        SubscriptionCommonFieldsSupportLevel.Premium,
        SubscriptionCommonFieldsSupportLevel.Standard,
        SubscriptionCommonFieldsSupportLevel.Self_Support,
      ].includes(settings.support_level ?? SubscriptionCommonFieldsSupportLevel.None),
    [settings.support_level],
  );
  const isDisconnected = useMemo(
    () => settings.status === SubscriptionCommonFieldsStatus.Disconnected || !settings.id,
    [settings.id, settings.status],
  );
  const isBillingModelVisible = useMemo(
    () =>
      canSubscribeStandardOCP &&
      canSubscribeMarketplaceOCP &&
      SubscriptionCommonFieldsClusterBillingModel.standard !==
        initialSettings.cluster_billing_model &&
      SubscriptionCommonFieldsClusterBillingModel.marketplace !==
        initialSettings.cluster_billing_model,
    [canSubscribeMarketplaceOCP, canSubscribeStandardOCP, initialSettings.cluster_billing_model],
  );
  const systemUnitsNumericErrorMsg = useMemo(
    () => (isDisconnected ? validateSystemUnitsNumericField(settings).errorMsg : ''),
    [isDisconnected, settings],
  );
  const cpuTotal = useMemo(() => {
    const result = isDisconnected ? settings.cpu_total : initialSettings.cpu_total;
    return result ?? 0;
  }, [initialSettings.cpu_total, isDisconnected, settings.cpu_total]);
  const socketTotal = useMemo(() => {
    const result = isDisconnected ? settings.socket_total : initialSettings.socket_total;
    return result ?? 0;
  }, [initialSettings.socket_total, isDisconnected, settings.socket_total]);
  const cpuSocketValue = useMemo(
    () =>
      settings.system_units === SubscriptionCommonFieldsSystemUnits.Sockets
        ? socketTotal
        : cpuTotal,
    [cpuTotal, socketTotal, settings.system_units],
  );
  const initialCpuSocketTotalSet = useMemo(() => cpuTotal || socketTotal, [cpuTotal, socketTotal]);
  const cpuSocketLabel = useMemo(() => getFieldLabel(settings), [settings]);
  const billingModelAlertText = useMemo(
    () =>
      getBillingModelAlertText(
        canSubscribeMarketplaceOCP,
        initialSettings.cluster_billing_model,
        isBillingModelVisible,
        isDisconnected,
      ),
    [
      canSubscribeMarketplaceOCP,
      initialSettings.cluster_billing_model,
      isBillingModelVisible,
      isDisconnected,
    ],
  );

  const publishChange = useCallback(
    (
      options: { [index: string]: EditSubcriptionOption[] | number } | undefined,
      settings: EditSubsriptionSettingsFieldsValues,
    ) => {
      // support_level must be valid
      let isValid = true;
      if (
        ![
          SubscriptionCommonFieldsSupportLevel.Premium,
          SubscriptionCommonFieldsSupportLevel.Standard,
          SubscriptionCommonFieldsSupportLevel.Self_Support,
        ].includes(settings?.support_level ?? SubscriptionCommonFieldsSupportLevel.None)
      ) {
        isValid = false;
      }
      // system_units must be valid for disconnected clusters
      if (isValid && isDisconnected) {
        isValid = validateSystemUnitsNumericField(settings).isValid;
      }
      // TODO
      onSettingsChange({ ...getSettingsBasedOnOptions(options, settings), isValid });
    },
    [isDisconnected, onSettingsChange],
  );

  const handleChange = useCallback(
    (
      options: { [index: string]: EditSubcriptionOption[] | number } | undefined,
      settingName: string,
      value: any,
    ) => {
      if (
        settingName === subscriptionSettings.SUPPORT_LEVEL &&
        value === SubscriptionCommonFieldsClusterBillingModel.marketplace
      ) {
        // preset values for marketplace
        const subSettings: EditSubsriptionSettingsFieldsValues = {
          ...initialSettings,
          support_level: SubscriptionCommonFieldsSupportLevel.Premium,
          service_level: SubscriptionCommonFieldsServiceLevel.L1_L3,
          usage: SubscriptionCommonFieldsUsage.Production,
          system_units: SubscriptionCommonFieldsSystemUnits.Cores_vCPU,
          cluster_billing_model: SubscriptionCommonFieldsClusterBillingModel.marketplace,
        };
        setOptions(resetOptions(subSettings));
        publishChange(options, subSettings);
      } else {
        setSettings({ ...settings, [`${settingName}`]: value });
        publishChange(options, { ...settings, [`${settingName}`]: value });
      }
    },
    [initialSettings, publishChange, settings],
  );

  const doInit = useCallback(
    (settings: EditSubsriptionSettingsFieldsValues) => {
      // disconnected cluster additonally requires cpu_total/socket_total
      const options = resetOptions(settings);
      if (isDisconnected) {
        options[subscriptionSettings.CPU_TOTAL] = initialSettings.cpu_total ?? 1;
        options[subscriptionSettings.SOCKET_TOTAL] = initialSettings.socket_total ?? 1;
        setSettings({
          ...settings,
          [subscriptionSettings.CPU_TOTAL]: options[subscriptionSettings.CPU_TOTAL],
          [subscriptionSettings.SOCKET_TOTAL]: options[subscriptionSettings.SOCKET_TOTAL],
        });
      }
      setOptions(options);

      if (
        settings.cluster_billing_model === SubscriptionCommonFieldsClusterBillingModel.marketplace
      ) {
        handleChange(
          options,
          subscriptionSettings.CLUSTER_BILLING_MODEL,
          SubscriptionCommonFieldsClusterBillingModel.marketplace,
        );
      } else {
        publishChange(options, settings);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  useEffect(() => {
    doInit(initialSettings);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (initialSettings !== settings && !isEqual(initialSettings, settings)) {
      setSettings(initialSettings);
      doInit(initialSettings);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [doInit]);

  useEffect(() => {
    if (options && Object.keys(options).length) {
      setSettings(getSettingsBasedOnDefaultOptions(options, settings));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [options]);

  return options ? (
    <>
      {isBillingModelVisible ? (
        <ReduxFormRadioGroup
          name={subscriptionSettings.CLUSTER_BILLING_MODEL}
          fieldId={subscriptionSettings.CLUSTER_BILLING_MODEL}
          isRequired
          label="Subscription type"
          className={radioGroupClassName}
          items={options[subscriptionSettings.CLUSTER_BILLING_MODEL]}
          onChange={(settingName: string, value: any) => handleChange(options, settingName, value)}
        />
      ) : null}

      {!isDisabled ? <BillingModelAlert title={billingModelAlertText} /> : null}

      <ReduxFormRadioGroup
        name={subscriptionSettings.SUPPORT_LEVEL}
        fieldId={subscriptionSettings.SUPPORT_LEVEL}
        label={<SupportLevelLabel />}
        className={radioGroupClassName}
        items={options[subscriptionSettings.SUPPORT_LEVEL]}
        onChange={(settingName: string, value: any) => handleChange(options, settingName, value)}
        isDisabled={isDisabled || isDisabledByBillingModel}
      />
      <ReduxFormRadioGroup
        name={subscriptionSettings.SERVICE_LEVEL}
        fieldId={subscriptionSettings.SERVICE_LEVEL}
        label={<ServiceLevelLabel />}
        className={radioGroupClassName}
        items={options[subscriptionSettings.SERVICE_LEVEL]}
        onChange={(settingName: string, value: any) => handleChange(options, settingName, value)}
        isDisabled={isDisabled || isDisabledByBillingModel || isDisabledBySupportLevel}
      />
      <ReduxFormRadioGroup
        name={subscriptionSettings.USAGE}
        fieldId={subscriptionSettings.USAGE}
        label={<UsageLabel />}
        className={radioGroupClassName}
        items={options[subscriptionSettings.USAGE]}
        onChange={(settingName: string, value: any) => handleChange(options, settingName, value)}
        isDisabled={isDisabled || isDisabledByBillingModel || isDisabledBySupportLevel}
      />
      <ReduxFormRadioGroup
        name={subscriptionSettings.SYSTEM_UNITS}
        fieldId={subscriptionSettings.SYSTEM_UNITS}
        label={<SystemUnitsLabel />}
        className={radioGroupClassName}
        items={options[subscriptionSettings.SYSTEM_UNITS]}
        onChange={(settingName: string, value: any) => handleChange(options, settingName, value)}
        isDisabled={isDisabled || isDisabledByBillingModel || isDisabledBySupportLevel}
        isInline
      />
      {(isDisabled || isDisabledByBillingModel || isDisabledBySupportLevel) &&
      initialCpuSocketTotalSet ? null : (
        <FormGroup
          label={
            settings.system_units === SubscriptionCommonFieldsSystemUnits.Sockets
              ? 'Number of sockets (excluding control plane nodes)'
              : 'Number of compute cores (excluding control plane nodes)'
          }
          isRequired={isDisconnected}
        >
          <CpuSocketNumberField
            minVal={MIN_VAL}
            isDisconnected={isDisconnected}
            subscription={settings}
            cpuSocketValue={cpuSocketValue}
            cpuSocketLabel={cpuSocketLabel}
            isDisabled={isDisabled || isDisabledByBillingModel || isDisabledBySupportLevel}
            handleChange={(settingName: string, value: any) =>
              handleChange(options, settingName, value)
            }
          />
          <FormGroupHelperText touched error={systemUnitsNumericErrorMsg}>
            {isDisconnected
              ? `${settings.system_units} value can be any integer larger than ${MIN_VAL}`
              : ''}
          </FormGroupHelperText>
        </FormGroup>
      )}
      <Tooltips
        isShown={isDisabledByBillingModel}
        startPosition={isBillingModelVisible ? 1 : 0}
        additionalGroupSelectors={`.${radioGroupClassName}`}
      />
    </>
  ) : null;
};

export default EditSubscriptionSettingsFields;
