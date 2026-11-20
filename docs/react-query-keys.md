# TanStack Query key conventions

Guidelines for naming, structuring, and invalidating TanStack Query (React Query) keys in OCM UI.

Related epic: standardize keys with the [query key factory pattern](https://tkdodo.eu/blog/effective-react-query-keys#use-query-key-factories).

## Why this matters

Query keys identify cache entries and act like dependency arrays: when a key changes, the query refetches. `invalidateQueries` matches keys by **prefix from the left**, so hierarchy determines whether you can refresh one query, a group (for example everything on cluster details), or an entire domain.

Today keys are inconsistent: constants in `src/queries/queriesConstants.ts`, inline magic strings, and occasional objects. That makes typos easy and bulk invalidation fragile. New and migrated code must use domain query key factories instead.

## Domains

A **domain** is a cache-invalidation boundary: queries that share a root key so they can be invalidated together.

Define domains by product and invalidation needs, not by filesystem path alone:

| Prefer grouping when… | Avoid grouping when… |
| --- | --- |
| Resources share a lifecycle (same page or feature refresh) | Invalidating together would refetch unrelated UI |
| You often need `all` vs `detail(id)` style scopes | The only link is a shared API client or folder name |
| `domainKeys.all` is a meaningful “refresh this area” action | You would create one factory per individual `useQuery` |

Use `src/queries/` folders as a **draft map**, then refine:

| Draft domain | Typical `src/queries/` home |
| --- | --- |
| `clusterList` | `ClusterListQueries/` |
| `clusterDetails` | `ClusterDetailsQueries/` (tabs can be sub-levels, not separate roots) |
| `clusterActions` | `ClusterActionsQueries/` — merge under `clusterDetails` / `clusterList` only if invalidation truly aligns |
| `rosaWizard` | `RosaWizardQueries/` |
| `featureGates` | `featureGates/` |
| `accessRequest` | `AccessRequest/` |
| `clusterLogs` | `ClusterLogsQueries/` |
| Shared org/cloud helpers | `common/` — small dedicated domains (for example `organization`, `cloudProviders`) |

Folder names such as `AddOnsTab` or `*Queries` describe UI layout or history. Do **not** copy them into key segments. Prefer stable product names.

## Factory pattern

A query key factory is a plain object that builds related keys. It does not fetch data and is not a React hook.

```ts
export const clusterDetailsKeys = {
  all: ['clusterDetails'] as const,
  details: () => [...clusterDetailsKeys.all, 'detail'] as const,
  detail: (clusterId: string) => [...clusterDetailsKeys.details(), clusterId] as const,
  addOns: (clusterId: string) => [...clusterDetailsKeys.detail(clusterId), 'addOns'] as const,
  notificationContacts: (subscriptionId: string) =>
    [...clusterDetailsKeys.all, 'notificationContacts', subscriptionId] as const,
};
```

Rules:

- Always use **array** keys.
- Structure keys **most generic → most specific** (order matters for identity and prefix invalidation).
- Each factory level spreads its parent (`...clusterDetailsKeys.all`) so prefixes stay consistent.
- Use `as const` for tight TypeScript literals.
- Put **primitives** in keys (ids, enums, serialized filter strings). Adding API objects in keys is not recommended.
- One factory per domain, colocated with that domain’s hooks (for example `src/queries/ClusterDetailsQueries/clusterDetailsKeys.ts`).

### Naming key segments

- Domain root: short camelCase noun or noun phrase (`clusterDetails`, `rosaWizard`, `featureGates`).
- Collection vs item: prefer `list` / `detail` (or clear resource names) over verb prefixes like `fetchClusterDetails`.
- Do not encode hook file names (`useFetchExternalAuths`) as key segments.
- `mutationKey` values should follow the same domain vocabulary when present; they are optional and separate from query cache keys.

## Using factories in hooks

```ts
import { useQuery } from '@tanstack/react-query';

import { clusterDetailsKeys } from './clusterDetailsKeys';

export const useFetchClusterAddOns = (clusterId: string) =>
  useQuery({
    queryKey: clusterDetailsKeys.addOns(clusterId),
    queryFn: () => fetchClusterAddOns(clusterId),
    enabled: !!clusterId,
  });
```

Do not hand-type the same array in multiple places. Reads, invalidations, and tests should all import the factory.

## Invalidation

After a mutation (create / update / delete), mark related cached reads stale with `queryClient.invalidateQueries`. Matching is by key prefix unless you pass a custom `predicate`.

```ts
// Entire cluster details domain (for example leaving the page or hard refresh)
queryClient.invalidateQueries({ queryKey: clusterDetailsKeys.all });

// All detail entries
queryClient.invalidateQueries({ queryKey: clusterDetailsKeys.details() });

// One cluster’s detail tree (detail + nested addOns, etc. that extend this prefix)
queryClient.invalidateQueries({ queryKey: clusterDetailsKeys.detail(clusterId) });

// Only add-ons for one cluster
queryClient.invalidateQueries({ queryKey: clusterDetailsKeys.addOns(clusterId) });
```

### Where to invalidate

Prefer invalidating from the mutation’s `onSuccess` (or a small helper next to the query factory) so callers cannot forget. Either pattern is fine if the helper uses the factory:

```ts
// Inside useMutation
onSuccess: () => {
  queryClient.invalidateQueries({ queryKey: clusterDetailsKeys.addOns(clusterId) });
};

// Or exported helper used by the UI after success
export const invalidateClusterAddOns = (clusterId: string) => {
  queryClient.invalidateQueries({ queryKey: clusterDetailsKeys.addOns(clusterId) });
};
```

Choose the narrowest key that still keeps the UI correct. Broad invalidation is reserved for true domain resets.

## Colocation and project layout

| Live here | Purpose |
| --- | --- |
| `src/queries/<Domain>/…Keys.ts` | Domain factory |
| `src/queries/<Domain>/use*.ts` | `useQuery` / `useMutation` hooks using that factory |
| `src/components/App/queryClient.ts` | Shared `QueryClient` instance |
| `src/queries/queriesConstants.ts` | Legacy flat base keys — do not add new entries; migrate callers to factories |

Factories may live beside a domain folder even when some hooks remain under tab subfolders. Subfolders organize files; the factory owns the key hierarchy.

## Checklist for new queries

1. Identify the domain (invalidation boundary). Reuse an existing factory when possible.
2. Add or extend factory levels (generic → specific) with primitive params only.
3. Use the factory in `queryKey` / invalidation / tests — no inline duplicate arrays.
4. Handle loading and error states in the UI (`docs/agent-code-guide.md`).
5. Do not add new string keys to `queriesConstants.ts`.

## References

- [Effective React Query Keys](https://tkdodo.eu/blog/effective-react-query-keys) (TkDodo)
- [TanStack Query — Query Keys](https://tanstack.com/query/latest/docs/framework/react/guides/query-keys)
- [TanStack Query — Invalidations](https://tanstack.com/query/latest/docs/framework/react/guides/query-invalidation)
