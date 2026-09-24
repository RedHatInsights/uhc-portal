import React from 'react';
import axios from 'axios';

import type { Meta, StoryObj } from '@storybook/react-webpack5';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { OCP5_SUPPORT, TABBED_CLUSTERS } from '~/queries/featureGates/featureConstants';
import { ProductLifeCycle } from '~/types/product-life-cycles';
import { Graph } from '~/types/upgrades_info.v1';

import ocpLifeCycleStatuses from './__mocks__/ocpLifeCycleStatuses';
import Releases from './Releases';

const FEATURE_GATE_QUERY_KEY = 'featureGate' as const;
const OCP_LIFECYCLE_QUERY_KEY = 'ocpLifeCycleStatus' as const;

const ALL_VERSIONS = ocpLifeCycleStatuses.data.data[0].versions;
const FOUR_X_ONLY_VERSIONS = ALL_VERSIONS.filter((version) => !version.name.startsWith('5.'));

// A distinct, per-channel-prefix patch offset so e.g. "stable-5.0" and "candidate-5.0"
// don't collide on the exact same fake "latest version" — mirrors real staging data,
// where stable/fast/eus/candidate channels for the same minor sit on different patches.
const PATCH_OFFSET_BY_PREFIX: Record<string, number> = { stable: 2, fast: 5, eus: 1, candidate: 7 };

/**
 * `ReleaseChannel`'s "Latest version" text and its candidate-channel popover link
 * (`hooks.ts` -> `getOCPReleaseChannel`) are fetched via a plain axios call, not
 * react-query, so they can't be satisfied by seeding a QueryClient cache. Patch
 * `axios.get` to fake the `/api/upgrades_info/v1/graph` response, scoped to each
 * requested channel's own major.minor — otherwise Storybook would hit the real
 * staging API, which has no channels for not-yet-released 5.x versions and
 * silently falls back to an unrelated 4.x version for every channel.
 *
 * Ref-counted rather than a one-time patch: applied while at least one
 * `ReleasesStoryShell` is mounted (including when Storybook's "Docs" page mounts
 * every story at once) and restored to the real `axios.get` once the last one
 * unmounts, so it never leaks into unrelated stories elsewhere in Storybook.
 */
const fakeGraphForChannel = (channel: string | undefined): { data: Graph } => {
  const match = /^(stable|fast|eus|candidate)-(\d+\.\d+)$/.exec(channel ?? '');
  const [, prefix, version] = match ?? [undefined, 'stable', '4.99'];
  const patch = PATCH_OFFSET_BY_PREFIX[prefix ?? 'stable'] ?? 0;
  return {
    data: {
      version: 1,
      nodes: [
        {
          version: `${version}.${patch}`,
          payload: 'quay.io/openshift-release-dev/ocp-release@sha256:storybook-mock',
          metadata: {},
        },
      ],
      edges: [],
      conditionalEdges: [],
    },
  };
};

let patchRefCount = 0;
let originalAxiosGet: typeof axios.get | null = null;

const patchAxiosGraphEndpoint = () => {
  if (patchRefCount === 0) {
    originalAxiosGet = axios.get.bind(axios);
    axios.get = ((url: string, config?: { params?: { channel?: string } }) => {
      if (url === '/api/upgrades_info/v1/graph') {
        return Promise.resolve(fakeGraphForChannel(config?.params?.channel));
      }
      return originalAxiosGet!(url, config);
    }) as typeof axios.get;
  }
  patchRefCount += 1;
};

const unpatchAxiosGraphEndpoint = () => {
  patchRefCount -= 1;
  if (patchRefCount <= 0 && originalAxiosGet) {
    axios.get = originalAxiosGet;
    originalAxiosGet = null;
    patchRefCount = 0;
  }
};

type BuildQueryClientOptions = {
  isOcp5SupportEnabled: boolean;
  versions: ProductLifeCycle['versions'];
  simulateFetchError: boolean;
};

function buildQueryClient({
  isOcp5SupportEnabled,
  versions,
  simulateFetchError,
}: BuildQueryClientOptions) {
  const queryClient = new QueryClient({
    defaultOptions: {
      // The app's real QueryClient defaults to refetchOnMount: 'always' (see
      // src/components/App/queryClient.ts). Override it here so our seeded data
      // below is what renders, instead of racing a real network call that would
      // fall back to unrelated data and clobber it.
      queries: { retry: false, refetchOnMount: false, refetchOnWindowFocus: false },
    },
  });

  queryClient.setQueryData([FEATURE_GATE_QUERY_KEY, OCP5_SUPPORT], {
    data: { enabled: isOcp5SupportEnabled },
  });
  queryClient.setQueryData([FEATURE_GATE_QUERY_KEY, TABBED_CLUSTERS], { data: { enabled: false } });

  if (simulateFetchError) {
    // Writes a genuine error state directly into *this* QueryClient instance via
    // the public prefetchQuery API — scoped to this story only, unlike patching
    // shared axios.get would be (which broke when Storybook's "Docs" page mounts
    // every story's QueryClient at once).
    queryClient.prefetchQuery({
      queryKey: [OCP_LIFECYCLE_QUERY_KEY, isOcp5SupportEnabled],
      queryFn: () => Promise.reject(new Error('Storybook: simulated lifecycle API failure')),
      retry: false,
    });
  } else {
    queryClient.setQueryData([OCP_LIFECYCLE_QUERY_KEY, isOcp5SupportEnabled], {
      data: { data: [{ ...ocpLifeCycleStatuses.data.data[0], versions }] },
    });
  }

  return queryClient;
}

type StoryShellProps = {
  isOcp5SupportEnabled?: boolean;
  versions?: ProductLifeCycle['versions'];
  simulateFetchError?: boolean;
};

/**
 * Renders the real {@link Releases} page against seeded lifecycle data (see
 * `__mocks__/ocpLifeCycleStatuses.ts`, the same fixture `Releases.test.tsx` uses),
 * so a reviewer can see the Releases page doc-link fixes render without a live backend.
 */
function ReleasesStoryShell({
  isOcp5SupportEnabled = true,
  versions = ALL_VERSIONS,
  simulateFetchError = false,
}: StoryShellProps) {
  // Lazy useState initializer (not useEffect): runs once, synchronously, during
  // this instance's initial render -- before Releases' own descendant effects
  // fire the real axios.get calls this is meant to intercept. useEffect would run
  // too late, since child effects fire before their parent's.
  React.useState(patchAxiosGraphEndpoint);
  React.useEffect(() => unpatchAxiosGraphEndpoint, []);

  const queryClient = React.useMemo(
    () => buildQueryClient({ isOcp5SupportEnabled, versions, simulateFetchError }),
    [isOcp5SupportEnabled, versions, simulateFetchError],
  );

  return (
    <QueryClientProvider client={queryClient}>
      <Releases />
    </QueryClientProvider>
  );
}

const meta = {
  title: 'Releases/Releases',
  component: ReleasesStoryShell,
  parameters: {
    docs: {
      description: {
        component: 'Releases page rendered with mixed OCP v4.x and v5.x lifecycle data.',
      },
    },
  },
} satisfies Meta<typeof ReleasesStoryShell>;

export default meta;

type Story = StoryObj<typeof ReleasesStoryShell>;

export const MixedFourAndFiveX: Story = {
  name: 'OCP 4.x + 5.x versions (ocmui-ocp5-support on)',
};

export const FourXOnly: Story = {
  name: 'OCP 4.x only (ocmui-ocp5-support off)',
  args: {
    isOcp5SupportEnabled: false,
    versions: FOUR_X_ONLY_VERSIONS,
  },
};

export const FetchError: Story = {
  name: 'Lifecycle fetch failed',
  args: {
    simulateFetchError: true,
  },
};
