import { parseValueWithUnit } from '../../../../common/units';

const baseClusterQuota = 107374182400; // The base cluster storage quota is 100 GiB (in bytes).

const filterPersistentStorageValuesByQuota = (
  currentValue,
  persistentStorageValues,
  remainingQuota,
) => {
  // Get quota for persistent storage.
  // this quota is "on top" of the base cluster quota of 100 GiB.

  if (!persistentStorageValues) {
    return { values: [{ value: baseClusterQuota, unit: 'B' }] };
  }
  const quotaInBytes = parseValueWithUnit(remainingQuota, 'GiB');
  const result = { values: [...persistentStorageValues] };

  if (currentValue) {
    result.values = result.values.filter((el) => el.value <= quotaInBytes + currentValue);
  } else {
    result.values = result.values.filter((el) => el.value <= quotaInBytes + baseClusterQuota);
  }
  return result;
};

export { filterPersistentStorageValuesByQuota };
