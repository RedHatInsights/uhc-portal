import get from 'lodash/get';

import { QuotaTypes } from '~/components/clusters/common/quotaModel';
import { RelatedResourceBilling_model as RelatedResourceBillingModel } from '~/types/accounts_mgmt.v1';

import {
  addOnBillingQuota,
  availableQuota,
  hasPotentialQuota,
  queryFromCluster,
} from '../../../common/quotaSelectors';

// An add-on is only visible if it has an entry in the quota summary
// regardless of whether the org has quota or not
const isAvailable = (addOn, cluster, organization, quotaList) => {
  // We get quota together with organization.
  // TODO: have action/reducer set quota.fulfilled, drop organization arg.
  if (!addOn?.enabled || !organization.fulfilled) {
    return false;
  }

  // If the add-on is not in the quota cost, it should not be available
  return (
    hasPotentialQuota(quotaList, {
      ...queryFromCluster(cluster),
      resourceType: QuotaTypes.ADD_ON,
      resourceName: addOn.resource_name,
      // the billing_model field for addon's is addon specific and should not be a filter criteria against the cluster
      billingModel: RelatedResourceBillingModel.any,
    }) >= 1
  );
};

const isInstalled = (addOn, clusterAddOns) => {
  if (!get(clusterAddOns, 'items.length', false)) {
    return false;
  }

  return clusterAddOns.items.some((clusterAddOn) => clusterAddOn.addon.id === addOn.id);
};

const getInstalled = (addOn, clusterAddOns) =>
  clusterAddOns.items.find((item) => item.addon.id === addOn.id);

const formatRequirementData = (data) => {
  if (data === undefined) {
    return '';
  }
  const attrs = [];
  Object.entries(data).forEach(([field, requiredValue]) => {
    if (Array.isArray(requiredValue)) {
      attrs.push(`${field} is ${requiredValue.join(' or ')}`);
    } else if (typeof requiredValue === 'number') {
      attrs.push(`${field} >= ${requiredValue}`);
    } else {
      attrs.push(`${field} is ${requiredValue}`);
    }
  });
  return `where ${attrs.join(' and ')}`;
};

const validateAddOnResourceRequirement = (requirement) => {
  const requirementMet = get(requirement, 'status.fulfilled', false);
  const requirementErrors = get(requirement, 'status.error_msgs', []);

  if (!requirementMet) {
    if (get(requirementErrors, 'length', 0) === 0) {
      if (requirement.resource === 'addon') {
        requirementErrors.push(
          'This addon requires another addon to be installed ' +
            `${formatRequirementData(requirement.data)}`,
        );
      } else if (requirement.resource === 'machine_pool') {
        requirementErrors.push(
          'This addon requires a machine pool to exist ' +
            `${formatRequirementData(requirement.data)}`,
        );
      } else {
        requirementErrors.push(
          `This addon requires a ${requirement.resource} ` +
            `${formatRequirementData(requirement.data)}`,
        );
      }
    }
  }
  return [requirementMet, requirementErrors];
};

const validateAddOnResourceRequirementList = (requirements, breakOnFirstError = false) => {
  const requirementStatus = {
    fulfilled: true,
    errorMsgs: [],
  };
  if (requirements.length > 0) {
    requirements.every((requirement) => {
      const [requirementMet, requirementErrors] = validateAddOnResourceRequirement(requirement);

      if (!requirementMet) {
        requirementStatus.errorMsgs.push(...requirementErrors);
      }
      if (requirementStatus.fulfilled) {
        requirementStatus.fulfilled = requirementMet;
      }
      return !(!requirementStatus.fulfilled && breakOnFirstError);
    });
  }
  return requirementStatus;
};

// validates that a given addons requirements are fulfilled
const validateAddOnRequirements = (addOn, breakOnFirstError = false) =>
  validateAddOnResourceRequirementList(get(addOn, 'requirements', []), breakOnFirstError);

// return a list of parameters for the given addon
const getParameters = (addOn) => get(addOn, 'parameters.items', []);

// returns true if the given addon has parameters
const hasParameters = (addOn) => get(getParameters(addOn), 'length', 0) > 0;

const minQuotaCount = (addOn) => {
  let min = 1;
  if (hasParameters(addOn)) {
    addOn.parameters.items.forEach((param) => {
      if (
        param.value_type === 'resource' &&
        param.id === addOn.resource_name &&
        param.options !== undefined &&
        param.options.length > 0
      ) {
        const values = param.options
          .map((option) => Number(option.value))
          .filter((value) => !Number.isNaN(value));
        min = Math.min(...values);
      }
    });
  }
  return min;
};

// An add-on can only be installed if the org has quota for this particular add-on
const hasQuota = (addOn, cluster, organization, quotaList) => {
  if (!isAvailable(addOn, cluster, organization, quotaList)) {
    return false;
  }
  const minCount = minQuotaCount(addOn);
  const available = availableQuota(quotaList, {
    ...queryFromCluster(cluster),
    resourceType: QuotaTypes.ADD_ON,
    resourceName: addOn.resource_name,
    // the billing_model field for addon's is addon specific and should not be a filter criteria against the cluster
    billingModel: RelatedResourceBillingModel.any,
  });
  return available >= minCount;
};

const getAddOnBillingQuota = (addOn, quotaList) =>
  addOnBillingQuota(quotaList, {
    resourceType: QuotaTypes.ADD_ON,
    resourceName: addOn?.resource_name,
  });

const quotaCostOptions = (resourceName, cluster, quotaList, allOptions, currentValue = 0) => {
  // Note: This is only currently looking for addon resource types
  // eslint-disable-next-line no-param-reassign
  currentValue = Number.isNaN(currentValue) ? 0 : currentValue;
  const query = {
    ...queryFromCluster(cluster),
    resourceType: QuotaTypes.ADD_ON,
    resourceName,
    // the billing_model field for addon's is addon specific and should not be a filter criteria against the cluster
    billingModel: RelatedResourceBillingModel.any,
  };

  if (!hasPotentialQuota(quotaList, query)) {
    // If the resource name was not found in quota, it might not be an addon resource name,
    // but still valid. For now we will just return all options in this case to allow all resource
    // names to work and avoid an empty options list.
    return allOptions;
  }
  const available = availableQuota(quotaList, query);
  return allOptions.filter((option) => available + currentValue >= option.value);
};

const availableAddOns = (addOns, cluster, clusterAddOns, organization, quota) => {
  if (!get(addOns, 'items.length', false)) {
    return [];
  }
  return addOns.items.filter(
    (addOn) =>
      isAvailable(addOn, cluster, organization, quota) || isInstalled(addOn, clusterAddOns),
  );
};

const hasRequirements = (addOn) => get(addOn, 'requirements.length', 0) > 0;

const getParameter = (addOn, paramID) => {
  if (hasParameters(addOn)) {
    return addOn.parameters.items.find((item) => item.id === paramID);
  }
  return undefined;
};

const getParameterValue = (addOnInstallation, paramID, defaultValue = undefined) => {
  const param = getParameter(addOnInstallation, paramID);
  if (param) {
    return param.value;
  }
  return defaultValue;
};

const parameterValuesForEditing = (addOnInstallation, addOn) => {
  const vals = { parameters: {} };
  if (hasParameters(addOn)) {
    vals.parameters = addOn.parameters.items.reduce((acc, curr) => {
      let paramValue = getParameterValue(addOnInstallation, curr.id);
      if (curr.value_type === 'boolean') {
        // Ensure existing boolean value is returned as a boolean, and always return false otherwise
        paramValue = (paramValue || '').toLowerCase() === 'true';
      }
      if (curr.options !== undefined && curr.options.length > 0) {
        // Ensure if options exist that one is always selected
        paramValue = paramValue || undefined;
      }
      if (paramValue !== undefined) {
        // eslint-disable-next-line no-param-reassign
        acc[curr.id] = paramValue;
      }
      return acc;
    }, {});
  }
  return vals;
};

// return a list of add-on parameters with the corresponding add-on installation parameter value
const parameterAndValue = (addOnInstallation, addOn) => {
  const vals = { parameters: {} };
  if (hasParameters(addOn)) {
    vals.parameters = getParameters(addOn).reduce((acc, curr) => {
      let paramValue = getParameterValue(addOnInstallation, curr.id);
      if (curr.value_type === 'boolean') {
        // Ensure existing boolean value is returned as a boolean, and always return false otherwise
        paramValue = (paramValue || '').toString().toLowerCase() === 'true';
      }
      if (curr.options) {
        const optionObj = curr.options.find((obj) => obj.value === paramValue);
        if (optionObj?.name) {
          paramValue = optionObj.name;
        }
      }
      if (paramValue !== undefined) {
        const updatedParam = { value: paramValue.toString(), ...curr };
        // eslint-disable-next-line no-param-reassign
        acc[curr.id] = updatedParam;
      }
      return acc;
    }, {});
  }
  return vals;
};

export {
  availableAddOns,
  getAddOnBillingQuota,
  getInstalled,
  getParameter,
  getParameters,
  getParameterValue,
  hasParameters,
  hasQuota,
  hasRequirements,
  isAvailable,
  isInstalled,
  minQuotaCount,
  parameterAndValue,
  parameterValuesForEditing,
  quotaCostOptions,
  validateAddOnRequirements,
};
