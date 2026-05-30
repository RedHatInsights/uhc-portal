import { stringToArrayTrimmed } from '~/common/helpers';

export type ExcludeNamespaceSelectorFormRow = {
  id?: string;
  key?: string;
  value?: string;
};

/**
 * Maps wizard form rows to clusters_mgmt ingress `excluded_namespace_selectors` items.
 */
export function parseFormExcludeNamespaceSelectorsToApi(
  rows: ExcludeNamespaceSelectorFormRow[] | undefined,
): { key: string; values: string[] }[] | undefined {
  if (!rows?.length) {
    return undefined;
  }
  const items = rows
    .filter((row) => row.key?.trim())
    .map((row) => {
      const values = stringToArrayTrimmed(row.value || '');
      return { key: row.key!.trim(), values };
    })
    .filter((item) => item.values.length > 0);
  return items.length ? items : undefined;
}

export function hasConfiguredExcludeNamespaceSelectors(
  rows: ExcludeNamespaceSelectorFormRow[] | undefined,
): boolean {
  return !!parseFormExcludeNamespaceSelectorsToApi(rows)?.length;
}
